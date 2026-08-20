-- Adds: (1) a period-parameterized leaderboard function replacing the
-- month-only one, and (2) a 15-minute report cooldown with a "replace the
-- last report" escape hatch. Run once in the Supabase SQL editor.

drop function if exists public.get_monthly_leaderboard();

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

  select point_value into new_points from public.zones where id = new_zone_id;
  if new_points is null then
    raise exception 'Unknown zone';
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
