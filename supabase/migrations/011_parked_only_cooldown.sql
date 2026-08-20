-- The 15-minute report cooldown should only apply to "parked" reports --
-- "saw" (spot-sighting) reports were unintentionally sharing the same
-- cooldown since it checked the user's single most recent report of
-- any type. Run once in the Supabase SQL editor.

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
  -- The cooldown (and thus this replace flow) only ever applies to
  -- 'parked' reports -- 'saw' reports have no cooldown to replace.
  select * into last_report
  from public.reports
  where user_id = auth.uid() and report_type = 'parked'
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
