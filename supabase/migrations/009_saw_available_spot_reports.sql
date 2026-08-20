-- Adds a "saw an available spot" report type, distinct from actually
-- parking there: a flat +2 bonus regardless of zone, with a spot_count
-- that weights the analytics (used for "where should I park now"
-- recommendations) without affecting the flat bonus. Run once in the
-- Supabase SQL editor.

alter table public.reports add column if not exists report_type text not null default 'parked';
alter table public.reports drop constraint if exists reports_report_type_check;
alter table public.reports add constraint reports_report_type_check check (report_type in ('parked', 'saw'));

alter table public.reports add column if not exists spot_count integer not null default 1;
alter table public.reports drop constraint if exists reports_spot_count_check;
alter table public.reports add constraint reports_spot_count_check check (spot_count between 1 and 5);

-- Keep SAW_BONUS_POINTS here in sync with lib/reportTypes.ts.
create or replace function public.set_report_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.report_type = 'saw' then
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
    sum(r.spot_count)::bigint as report_count
  from public.reports r
  join public.zones z on z.id = r.zone_id
  group by z.id, z.name, day_of_week, hour_of_day;
$$;

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
