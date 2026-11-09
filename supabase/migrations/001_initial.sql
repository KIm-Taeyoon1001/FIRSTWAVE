create extension if not exists pgcrypto;
create type public.project_status as enum ('draft','pending_review','published','paused','completed','rejected');
create type public.application_status as enum ('pending','approved','rejected','withdrawn','completed');
create type public.report_status as enum ('open','resolved','dismissed');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_admin boolean not null default false,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  maker_enabled boolean not null default true,
  tester_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text unique not null
);
insert into public.categories (slug,name) values
('productivity','Productivity'),('developer-tools','Developer Tools'),('design','Design'),('education','Education'),('finance','Finance'),('other','Other');
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  maker_id uuid not null references public.users(id) on delete cascade,
  slug text unique not null,
  name text not null check (length(name) between 2 and 100),
  tagline text not null check (length(tagline) <= 180),
  description text not null default '',
  category text not null default 'Other',
  platform text not null default 'Web',
  status public.project_status not null default 'draft',
  logo_url text,
  screenshots text[] not null default '{}',
  product_url text,
  capacity integer not null default 10 check (capacity between 1 and 10000),
  deadline date,
  requirements text,
  instructions text,
  expected_feedback text,
  reward text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_discovery on public.projects(status, created_at desc);
create index projects_maker on public.projects(maker_id, created_at desc);
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  tester_id uuid not null references public.users(id) on delete cascade,
  status public.application_status not null default 'pending',
  message text not null check (length(message) between 10 and 3000),
  experience text,
  device_info text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, tester_id)
);
create index applications_project on public.applications(project_id, status);
create index applications_tester on public.applications(tester_id, created_at desc);
create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  tester_id uuid not null references public.users(id) on delete cascade,
  application_id uuid not null unique references public.applications(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (project_id, tester_id)
);
create table public.feedback_questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  prompt text not null,
  required boolean not null default false,
  sort_order integer not null default 0
);
create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  tester_id uuid not null references public.users(id) on delete cascade,
  overall_rating integer not null check (overall_rating between 1 and 5),
  usability_rating integer not null check (usability_rating between 1 and 5),
  bugs text not null default '',
  feature_requests text not null default '',
  comments text not null default '',
  answers jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, tester_id)
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user on public.notifications(user_id, created_at desc);
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  reason text not null,
  details text not null default '',
  status public.report_status not null default 'open',
  created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users(id,email) values (new.id, coalesce(new.email,''));
  insert into public.profiles(user_id,display_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger projects_updated before update on public.projects for each row execute function public.touch_updated_at();
create trigger profiles_updated before update on public.profiles for each row execute function public.touch_updated_at();
create trigger applications_updated before update on public.applications for each row execute function public.touch_updated_at();
create trigger feedbacks_updated before update on public.feedbacks for each row execute function public.touch_updated_at();

create function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
select exists(select 1 from public.users where id = auth.uid() and is_admin and not is_suspended) $$;
create function public.is_active() returns boolean language sql stable security definer set search_path = public as $$
select exists(select 1 from public.users where id = auth.uid() and not is_suspended) $$;
create function public.owns_project(p uuid) returns boolean language sql stable security definer set search_path = public as $$
select exists(select 1 from public.projects where id = p and maker_id = auth.uid()) $$;
create function public.is_member(p uuid) returns boolean language sql stable security definer set search_path = public as $$
select exists(select 1 from public.project_members where project_id = p and tester_id = auth.uid()) $$;

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.applications enable row level security;
alter table public.project_members enable row level security;
alter table public.feedback_questions enable row level security;
alter table public.feedbacks enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;

create policy users_self_read on public.users for select using (id = auth.uid() or public.is_admin());
create policy profiles_read on public.profiles for select using (true);
create policy profiles_self_update on public.profiles for update using (user_id = auth.uid() and public.is_active()) with check (user_id = auth.uid());
create policy categories_read on public.categories for select using (true);
create policy projects_read on public.projects for select using (status = 'published' or maker_id = auth.uid() or public.is_admin());
create policy projects_create on public.projects for insert with check (maker_id = auth.uid() and public.is_active() and status = 'draft');
create policy projects_update on public.projects for update using (maker_id = auth.uid() and public.is_active() and status in ('draft','rejected','paused','published')) with check (maker_id = auth.uid() and status in ('draft','pending_review','paused','completed'));
create policy applications_read on public.applications for select using (tester_id = auth.uid() or public.owns_project(project_id) or public.is_admin());
create policy applications_create on public.applications for insert with check (tester_id = auth.uid() and public.is_active() and status = 'pending' and exists(select 1 from public.projects p where p.id = project_id and p.status = 'published' and p.maker_id <> auth.uid() and (p.deadline is null or p.deadline >= current_date)));
create policy applications_withdraw on public.applications for update using (tester_id = auth.uid() and status = 'pending') with check (tester_id = auth.uid() and status = 'withdrawn');
create policy members_read on public.project_members for select using (tester_id = auth.uid() or public.owns_project(project_id) or public.is_admin());
create policy questions_read on public.feedback_questions for select using (exists(select 1 from public.projects p where p.id = project_id and p.status = 'published') or public.owns_project(project_id));
create policy questions_write on public.feedback_questions for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy feedback_read on public.feedbacks for select using (tester_id = auth.uid() or public.owns_project(project_id) or public.is_admin());
create policy feedback_create on public.feedbacks for insert with check (tester_id = auth.uid() and public.is_active() and public.is_member(project_id));
create policy notifications_read on public.notifications for select using (user_id = auth.uid());
create policy notifications_update on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reports_create on public.reports for insert with check (reporter_id = auth.uid() and public.is_active());
create policy reports_read on public.reports for select using (reporter_id = auth.uid() or public.is_admin());
create policy audit_read on public.audit_logs for select using (public.is_admin());

create function public.approve_application(p_application uuid) returns void language plpgsql security definer set search_path = public as $$
declare a public.applications%rowtype; p public.projects%rowtype; selected_count integer;
begin
  select * into a from public.applications where id = p_application for update;
  if not found then raise exception 'Application not found'; end if;
  select * into p from public.projects where id = a.project_id for update;
  if p.maker_id <> auth.uid() or not public.is_active() then raise exception 'Not authorized'; end if;
  if a.status <> 'pending' then raise exception 'Application is not pending'; end if;
  select count(*) into selected_count from public.project_members where project_id = p.id;
  if selected_count >= p.capacity then raise exception 'Recruitment capacity reached'; end if;
  update public.applications set status = 'approved' where id = a.id;
  insert into public.project_members(project_id,tester_id,application_id) values (p.id,a.tester_id,a.id);
end $$;
create function public.reject_application(p_application uuid) returns void language plpgsql security definer set search_path = public as $$
declare a public.applications%rowtype;
begin
  select * into a from public.applications where id = p_application for update;
  if not found or not public.owns_project(a.project_id) or not public.is_active() then raise exception 'Not authorized'; end if;
  if a.status <> 'pending' then raise exception 'Application is not pending'; end if;
  update public.applications set status = 'rejected' where id = a.id;
end $$;
revoke all on function public.approve_application(uuid), public.reject_application(uuid) from public;
grant execute on function public.approve_application(uuid), public.reject_application(uuid) to authenticated;

create policy admin_update_users on public.users for update using (public.is_admin()) with check (public.is_admin());
create policy admin_update_projects on public.projects for update using (public.is_admin()) with check (public.is_admin());
create policy admin_update_reports on public.reports for update using (public.is_admin()) with check (public.is_admin());
create policy admin_insert_audit on public.audit_logs for insert with check (public.is_admin() and actor_id = auth.uid());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('project-assets','project-assets',true,5242880,array['image/png','image/jpeg','image/webp']);
create policy assets_public_read on storage.objects for select using (bucket_id = 'project-assets');
create policy assets_owner_insert on storage.objects for insert to authenticated with check (bucket_id = 'project-assets' and (storage.foldername(name))[1] = auth.uid()::text and public.is_active());
create policy assets_owner_delete on storage.objects for delete to authenticated using (bucket_id = 'project-assets' and (storage.foldername(name))[1] = auth.uid()::text);
