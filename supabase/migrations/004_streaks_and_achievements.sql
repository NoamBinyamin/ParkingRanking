-- Adds streak tracking + an achievements system. Run once in the Supabase
-- SQL editor.

alter table public.profiles add column if not exists current_streak integer not null default 0;
alter table public.profiles add column if not exists longest_streak integer not null default 0;
alter table public.profiles add column if not exists last_report_date date;

create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

drop policy if exists "achievements are readable by their owner" on public.user_achievements;
create policy "achievements are readable by their owner"
  on public.user_achievements for select
  to authenticated
  using (auth.uid() = user_id);

-- Rename the existing points trigger so same-timing triggers fire in a
-- guaranteed order: points -> streak -> achievements (Postgres runs
-- same-timing triggers in name order).
drop trigger if exists after_report_insert on public.reports;
create trigger after_report_insert_1_points
  after insert on public.reports
  for each row execute function public.apply_report_points();

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

  return new;
end;
$$;

drop trigger if exists after_report_insert_2_streak on public.reports;
create trigger after_report_insert_2_streak
  after insert on public.reports
  for each row execute function public.update_streak();

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

drop trigger if exists after_report_insert_3_achievements on public.reports;
create trigger after_report_insert_3_achievements
  after insert on public.reports
  for each row execute function public.check_achievements();

create or replace function public.get_my_achievements()
returns table (achievement_id text, unlocked_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select achievement_id, unlocked_at from public.user_achievements where user_id = auth.uid();
$$;

grant execute on function public.get_my_achievements to authenticated;
