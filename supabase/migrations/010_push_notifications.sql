-- Adds real Web Push notifications (iOS/Android, not just the in-app
-- broadcast toast): a subscriptions table, and a security-definer
-- function the reporting user's own server action calls to look up
-- everyone else's subscriptions and send them a push. Run once in the
-- Supabase SQL editor.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push subscriptions are manageable by their owner" on public.push_subscriptions;
create policy "push subscriptions are manageable by their owner"
  on public.push_subscriptions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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
