-- Broadcasts a curated "someone just reported X" message over Supabase
-- Realtime Broadcast whenever a report is inserted, without granting
-- broader SELECT access to the reports table (reports stay exactly as
-- private as before). Wrapped in its own exception handler so a
-- broadcast failure can never break the actual report insert. Run once
-- in the Supabase SQL editor.

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

drop trigger if exists after_report_insert_4_notify on public.reports;
create trigger after_report_insert_4_notify
  after insert on public.reports
  for each row execute function public.notify_new_report();
