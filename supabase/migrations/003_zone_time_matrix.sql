-- Replaces get_zone_hourly_stats (hour-of-day only) with get_zone_day_hour_stats
-- (day-of-week + hour-of-day), which powers the leaderboard's "right now"
-- recommendation and the per-zone day x hour matrix. Run once in the
-- Supabase SQL editor.

drop function if exists public.get_zone_hourly_stats();

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
    count(*) as report_count
  from public.reports r
  join public.zones z on z.id = r.zone_id
  group by z.id, z.name, day_of_week, hour_of_day;
$$;

grant execute on function public.get_zone_day_hour_stats to authenticated;
