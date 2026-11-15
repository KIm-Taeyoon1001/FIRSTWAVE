-- Shared discussion space for makers and testers. Participation is limited to
-- authenticated, active accounts; each user can only edit their own content.
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  author_perspective text not null default 'both' check (author_perspective in ('maker','tester','both')),
  topic text not null check (topic in ('showcase','question','testing','discussion')),
  title text not null check (char_length(trim(title)) between 5 and 120),
  body text not null check (char_length(trim(body)) between 20 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index community_posts_recent on public.community_posts(created_at desc);
create index community_posts_topic_recent on public.community_posts(topic, created_at desc);

create table public.community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 2 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index community_replies_post_recent on public.community_replies(post_id, created_at);

alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;
create policy community_posts_read on public.community_posts for select to authenticated using (public.is_active());
create policy community_posts_create on public.community_posts for insert to authenticated with check (author_id = auth.uid() and public.is_active());
create policy community_posts_update on public.community_posts for update to authenticated using (author_id = auth.uid() and public.is_active()) with check (author_id = auth.uid() and public.is_active());
create policy community_posts_delete on public.community_posts for delete to authenticated using (author_id = auth.uid() and public.is_active());
create policy community_replies_read on public.community_replies for select to authenticated using (public.is_active());
create policy community_replies_create on public.community_replies for insert to authenticated with check (author_id = auth.uid() and public.is_active() and exists(select 1 from public.community_posts p where p.id = post_id));
create policy community_replies_update on public.community_replies for update to authenticated using (author_id = auth.uid() and public.is_active()) with check (author_id = auth.uid() and public.is_active());
create policy community_replies_delete on public.community_replies for delete to authenticated using (author_id = auth.uid() and public.is_active());
grant select, insert, update, delete on public.community_posts, public.community_replies to authenticated;
