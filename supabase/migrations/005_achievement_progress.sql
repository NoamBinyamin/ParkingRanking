-- Adds get_my_progress(), which returns raw progress counters so the UI can
-- render "2/3" style progress bars toward locked achievements. Run once in
-- the Supabase SQL editor.

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
