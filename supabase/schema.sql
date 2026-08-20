-- ParkPoints database schema (Supabase / Postgres)
-- Run this in the Supabase SQL editor once per project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per auth.users entry. id is the Supabase auth provider id, so no
-- password_hash column is needed here -- Supabase Auth owns credentials.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  avatar_emoji text not null default '🚗',
  total_score integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_report_date date,
  created_at timestamptz not null default now()
);

create table public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  point_value integer not null,
  color text not null default '#7c5cff',
  icon text not null default '🅿️',
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  zone_id uuid not null references public.zones (id) on delete restrict,
  points_awarded integer not null,
  -- 'parked': the reporter actually parked there, points_awarded = the
  -- zone's point_value. 'saw': the reporter just spotted an open space
  -- without parking there themselves -- always a flat bonus regardless
  -- of zone (see set_report_points() below), but spot_count still feeds
  -- the analytics with real weight so multiple sightings count for more.
  report_type text not null default 'parked' check (report_type in ('parked', 'saw')),
  spot_count integer not null default 1 check (spot_count between 1 and 5),
  created_at timestamptz not null default now()
);

create index reports_user_id_idx on public.reports (user_id);
create index reports_zone_id_idx on public.reports (zone_id);
create index reports_created_at_idx on public.reports (created_at);

-- Which achievements a user has unlocked. The achievement catalog itself
-- (names, descriptions, icons) lives in the app code (lib/achievements.ts)
-- since it's static content -- this table only records unlock events, and
-- is only ever written to by check_achievements() below, never by clients.
create table public.user_achievements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- Web Push subscriptions (real iOS/Android push, not just the in-app
-- broadcast toast). One row per device/browser a user has enabled
-- notifications on; endpoint is unique so re-subscribing (e.g. after a
-- token refresh) upserts instead of duplicating.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Triggers: keep profiles + points_awarded consistent automatically
-- ---------------------------------------------------------------------------

-- Create a profile row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Snapshot the zone's point value onto the report at insert time, so a
-- later change to a zone's point_value never rewrites report history.
-- Keep SAW_BONUS_POINTS here in sync with lib/reportTypes.ts.
create or replace function public.set_report_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.report_type = 'saw' then
    -- Flat bonus regardless of zone or spot_count -- enforced here
    -- server-side so a client can never inflate it.
    new.points_awarded := 2;
    new.spot_count := greatest(1, least(coalesce(new.spot_count, 1), 5));
  else
    new.spot_count := 1;
    if new.points_awarded is null then
      select point_value into new.points_awarded from public.zones where id = new.zone_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger before_report_insert
  before insert on public.reports
  for each row execute function public.set_report_points();

-- Keep profiles.total_score in sync with report history.
create or replace function public.apply_report_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set total_score = total_score + new.points_awarded
  where id = new.user_id;
  return new;
end;
$$;

-- Triggers of the same timing fire in name order, and check_achievements()
-- below depends on both total_score/streak already being up to date, so
-- these are numbered to guarantee: points -> streak -> achievements.
create trigger after_report_insert_1_points
  after insert on public.reports
  for each row execute function public.apply_report_points();

-- A "streak" is consecutive calendar days with at least one report.
create or replace function public.update_streak()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  report_date date := (new.created_at at time zone 'utc')::date;
  prev_date date;
  prev_streak int;
begin
  select last_report_date, current_streak into prev_date, prev_streak
  from public.profiles where id = new.user_id;

  if prev_date is null or report_date > prev_date + 1 then
    update public.profiles
    set current_streak = 1,
        longest_streak = greatest(longest_streak, 1),
        last_report_date = report_date
    where id = new.user_id;
  elsif report_date = prev_date + 1 then
    update public.profiles
    set current_streak = prev_streak + 1,
        longest_streak = greatest(longest_streak, prev_streak + 1),
        last_report_date = report_date
    where id = new.user_id;
  end if;
  -- report_date = prev_date (already reported today): streak unchanged.

  return new;
end;
$$;

create trigger after_report_insert_2_streak
  after insert on public.reports
  for each row execute function public.update_streak();

-- Grants any achievement whose criteria are newly met. Idempotent via the
-- primary key on user_achievements, so it's safe to re-check every report.
create or replace function public.check_achievements()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  total_reports int;
  jackpot_reports int;
  night_reports int;
  streak int;
begin
  select count(*) into total_reports from public.reports where user_id = new.user_id;

  select count(*) into jackpot_reports
  from public.reports r
  join public.zones z on z.id = r.zone_id
  where r.user_id = new.user_id and z.point_value >= 50;

  select count(*) into night_reports
  from public.reports
  where user_id = new.user_id and extract(hour from created_at) between 0 and 5;

  select current_streak into streak from public.profiles where id = new.user_id;

  if total_reports >= 1 then
    insert into public.user_achievements (user_id, achievement_id)
    values (new.user_id, 'first_park') on conflict do nothing;
  end if;
  if total_reports >= 100 then
    insert into public.user_achievements (user_id, achievement_id)
    values (new.user_id, 'century') on conflict do nothing;
  end if;
  if jackpot_reports >= 3 then
    insert into public.user_achievements (user_id, achievement_id)
    values (new.user_id, 'jackpot_hunter') on conflict do nothing;
  end if;
  if night_reports >= 5 then
    insert into public.user_achievements (user_id, achievement_id)
    values (new.user_id, 'night_owl') on conflict do nothing;
  end if;
  if streak >= 3 then
    insert into public.user_achievements (user_id, achievement_id)
    values (new.user_id, 'streak_3') on conflict do nothing;
  end if;
  if streak >= 7 then
    insert into public.user_achievements (user_id, achievement_id)
    values (new.user_id, 'streak_7') on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger after_report_insert_3_achievements
  after insert on public.reports
  for each row execute function public.check_achievements();

-- Broadcasts a curated "someone just reported X" message to any
-- connected client via Supabase's Broadcast-from-Database feature,
-- WITHOUT granting broader SELECT access to the reports table itself --
-- reports stay exactly as private as before this. Wrapped in its own
-- exception handler so a broadcast failure (e.g. Realtime hiccup) can
-- never break the actual report insert.
create or replace function public.notify_new_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  zone_name text;
  zone_icon text;
  reporter_username text;
  reporter_avatar text;
begin
  begin
    select name, icon into zone_name, zone_icon from public.zones where id = new.zone_id;
    select username, avatar_emoji into reporter_username, reporter_avatar
    from public.profiles where id = new.user_id;

    perform realtime.send(
      jsonb_build_object(
        'zone_name', zone_name,
        'zone_icon', zone_icon,
        'points_awarded', new.points_awarded,
        'username', reporter_username,
        'avatar_emoji', reporter_avatar,
        'user_id', new.user_id
      ),
      'new_report',
      'public-reports',
      false
    );
  exception when others then
    null;
  end;

  return new;
end;
$$;

create trigger after_report_insert_4_notify
  after insert on public.reports
  for each row execute function public.notify_new_report();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.zones enable row level security;
alter table public.reports enable row level security;
alter table public.user_achievements enable row level security;
alter table public.push_subscriptions enable row level security;

-- Profiles: everyone signed in can read (needed for leaderboard usernames),
-- but you can only edit your own row.
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles are editable by their owner"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Zones: read-only reference data for the client.
create policy "active zones are readable by authenticated users"
  on public.zones for select
  to authenticated
  using (is_active = true);

-- Reports: a user can only see and create their own reports. Aggregate
-- views (leaderboard, hourly stats) are exposed separately below via
-- security definer functions so they can summarize across all users
-- without exposing anyone's individual report history.
create policy "reports are readable by their owner"
  on public.reports for select
  to authenticated
  using (auth.uid() = user_id);

create policy "reports are insertable by their owner"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Achievements: readable by their owner only. No insert policy -- rows are
-- only ever created by check_achievements(), which runs as security definer.
create policy "achievements are readable by their owner"
  on public.user_achievements for select
  to authenticated
  using (auth.uid() = user_id);

-- Push subscriptions: a user manages only their own (register/unregister
-- this device). Reading OTHER users' subscriptions to actually send a
-- push happens only through get_push_subscriptions_to_notify() below,
-- which runs as security definer -- there's no policy here that exposes
-- other people's subscriptions directly.
create policy "push subscriptions are manageable by their owner"
  on public.push_subscriptions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Aggregate read functions (leaderboard + time-based analytics)
-- ---------------------------------------------------------------------------

-- Ranked points for a given period ('week' | 'month' | 'all'), all
-- computed fresh from report history (rather than reading
-- profiles.total_score) so the three tabs stay internally consistent.
-- Weeks/months are calendar-based (Postgres's date_trunc default, weeks
-- start Monday), not rolling windows.
create or replace function public.get_leaderboard(period text default 'month')
returns table (
  user_id uuid,
  username text,
  avatar_emoji text,
  points integer
)
language sql
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.username,
    p.avatar_emoji,
    coalesce(sum(r.points_awarded), 0)::int as points
  from public.profiles p
  left join public.reports r
    on r.user_id = p.id
    and (
      (period = 'week' and r.created_at >= date_trunc('week', now()))
      or (period = 'month' and r.created_at >= date_trunc('month', now()))
      or (period = 'all')
    )
  group by p.id, p.username, p.avatar_emoji
  having coalesce(sum(r.points_awarded), 0) <> 0
  order by points desc
  limit 50;
$$;

grant execute on function public.get_leaderboard to authenticated;

-- Report density per zone, broken down by day-of-week (0 = Sunday .. 6 =
-- Saturday, matching both Postgres's extract(dow) and JS's Date#getDay())
-- and hour-of-day. Powers the "right now" recommendation and the per-zone
-- day x hour matrix on the leaderboard screen.
create or replace function public.get_zone_day_hour_stats()
returns table (
  zone_id uuid,
  zone_name text,
  day_of_week int,
  hour_of_day int,
  report_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    z.id as zone_id,
    z.name as zone_name,
    extract(dow from r.created_at)::int as day_of_week,
    extract(hour from r.created_at)::int as hour_of_day,
    -- Summed rather than counted: a "saw 3 open spots" report should
    -- weigh 3x as heavily toward "parking is available here" as a
    -- single 'parked' report (whose spot_count is always 1).
    sum(r.spot_count)::bigint as report_count
  from public.reports r
  join public.zones z on z.id = r.zone_id
  group by z.id, z.name, day_of_week, hour_of_day;
$$;

grant execute on function public.get_zone_day_hour_stats to authenticated;

-- The current user's unlocked achievement ids + when they were unlocked.
create or replace function public.get_my_achievements()
returns table (achievement_id text, unlocked_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select achievement_id, unlocked_at from public.user_achievements where user_id = auth.uid();
$$;

grant execute on function public.get_my_achievements to authenticated;

-- The current user's raw progress counters, so the UI can render "2/3"
-- style progress toward each locked achievement without duplicating the
-- unlock thresholds themselves (those stay app-side in lib/achievements.ts).
create or replace function public.get_my_progress()
returns table (
  total_reports bigint,
  jackpot_reports bigint,
  night_reports bigint,
  current_streak int
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.reports where user_id = auth.uid()) as total_reports,
    (select count(*) from public.reports r join public.zones z on z.id = r.zone_id
       where r.user_id = auth.uid() and z.point_value >= 50) as jackpot_reports,
    (select count(*) from public.reports
       where user_id = auth.uid() and extract(hour from created_at) between 0 and 5) as night_reports,
    coalesce((select current_streak from public.profiles where id = auth.uid()), 0) as current_streak;
$$;

grant execute on function public.get_my_progress to authenticated;

-- Every OTHER user's push subscriptions, for the reporting user's own
-- server action to send real pushes to after a report. Security definer
-- because the RLS policy on push_subscriptions otherwise only lets a
-- user see their own rows -- this is the one deliberate, narrow
-- exception (still just endpoint/keys, never who owns which).
create or replace function public.get_push_subscriptions_to_notify(exclude_user_id uuid)
returns table (endpoint text, p256dh text, auth text)
language sql
security definer
set search_path = public
as $$
  select endpoint, p256dh, auth
  from public.push_subscriptions
  where user_id <> exclude_user_id;
$$;

grant execute on function public.get_push_subscriptions_to_notify to authenticated;

-- ---------------------------------------------------------------------------
-- Report cooldown: reports must be >=15 minutes apart. Rather than reject
-- a too-soon report outright, the client offers to edit the existing one
-- instead -- this function performs that edit, adjusting total_score by
-- the delta between the old and new zone's points. It deliberately does
-- NOT re-run streak/achievement logic, since this corrects an existing
-- report rather than logging a new one.
-- ---------------------------------------------------------------------------

create or replace function public.replace_last_report(new_zone_id uuid)
returns public.reports
language plpgsql
security definer
set search_path = public
as $$
declare
  last_report public.reports;
  new_points integer;
  updated_report public.reports;
begin
  select * into last_report
  from public.reports
  where user_id = auth.uid()
  order by created_at desc
  limit 1;

  if last_report is null or last_report.created_at < now() - interval '15 minutes' then
    raise exception 'No recent report within the cooldown window to replace';
  end if;

  -- Replacing only ever changes the zone, never the report_type -- a
  -- 'saw' report keeps its flat bonus regardless of the new zone.
  if last_report.report_type = 'saw' then
    new_points := 2;
  else
    select point_value into new_points from public.zones where id = new_zone_id;
    if new_points is null then
      raise exception 'Unknown zone';
    end if;
  end if;

  update public.profiles
  set total_score = total_score - last_report.points_awarded + new_points
  where id = auth.uid();

  update public.reports
  set zone_id = new_zone_id, points_awarded = new_points, created_at = now()
  where id = last_report.id
  returning * into updated_report;

  return updated_report;
end;
$$;

grant execute on function public.replace_last_report to authenticated;

-- ---------------------------------------------------------------------------
-- Seed zones
-- ---------------------------------------------------------------------------

insert into public.zones (name, slug, point_value, color, icon, description) values
  ('ג''וקר', 'joker', 50, '#ff5da2', '🃏',
    'הקלף המנצח! מצאת את החניה המושלמת שכולם חולמים עליה. שיחקת אותה בענק! 🃏👑'),
  ('כצנלסון א''', 'katznelson-a', 20, '#7c5cff', '🍕',
    'חניה של אלופים. 🏙️🍕'),
  ('סירקין א''', 'sirkin-a', 20, '#33d17a', '🌳',
    'חניה מעולה בחלק המבוקש סירקין. אפשר לכבות מנוע ברוגע. 🌳🚙'),
  ('כצנלסון ב''', 'katznelson-b', 10, '#3ec6ff', '🚶',
    'קצת יותר הליכה על כצנלסון, אבל היי - חניה זו חניה! 🚶‍♂️🛍️'),
  ('סירקין ב''', 'sirkin-b', 10, '#ffc93c', '🌃',
    'בהמשך הרחוב של סירקין. לא מושלם, אבל סוגר פינה מעולה ללילה. 🌙🚗'),
  ('סחלה', 'sachla', -20, '#ff5a5f', '💩',
    'על הפנים... חניה נוראית, רחוקה, צפופה או סתם מייאשת. עדיף היה לבוא באופניים. 💩👎');
