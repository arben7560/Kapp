create table public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null check (schema_version >= 1),
  progress_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

revoke all on table public.user_progress from anon;
grant select, insert, update on table public.user_progress to authenticated;

create policy "Users can read their own progress"
on public.user_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own progress"
on public.user_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own progress"
on public.user_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create function public.set_user_progress_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_user_progress_updated_at() from public;

create trigger set_user_progress_updated_at
before update on public.user_progress
for each row
execute function public.set_user_progress_updated_at();
