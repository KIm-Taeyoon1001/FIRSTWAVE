create function public.project_spots(p_project uuid) returns integer language sql stable security definer set search_path = public as $$
  select case when p.status = 'published' then greatest(0,p.capacity - (select count(*)::integer from public.project_members where project_id = p.id)) else null end
  from public.projects p where p.id = p_project
$$;
revoke all on function public.project_spots(uuid) from public;
grant execute on function public.project_spots(uuid) to anon, authenticated;

create function public.applied_to_project(p_project uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.applications where project_id = p_project and tester_id = auth.uid())
$$;
revoke all on function public.applied_to_project(uuid) from public;
grant execute on function public.applied_to_project(uuid) to authenticated;
drop policy projects_read on public.projects;
create policy projects_read on public.projects for select using (
  status = 'published' or maker_id = auth.uid() or public.is_admin() or public.applied_to_project(id)
);

create function public.require_review_on_edit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status = 'published' and not public.is_admin()
    and (new.name,new.tagline,new.description,new.category,new.platform,new.logo_url,new.screenshots,new.product_url,new.capacity,new.deadline,new.requirements,new.instructions,new.expected_feedback,new.reward)
       is distinct from
        (old.name,old.tagline,old.description,old.category,old.platform,old.logo_url,old.screenshots,old.product_url,old.capacity,old.deadline,old.requirements,old.instructions,old.expected_feedback,old.reward)
  then new.status = 'pending_review'; end if;
  return new;
end $$;
create trigger projects_require_review before update on public.projects for each row execute function public.require_review_on_edit();

create function public.validate_project_transition() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = old.status or public.is_admin() then return new; end if;
  if old.maker_id <> auth.uid() or not public.is_active() then raise exception 'Not authorized'; end if;
  if (old.status in ('draft','rejected') and new.status = 'pending_review')
     or (old.status = 'published' and new.status in ('pending_review','paused','completed'))
     or (old.status = 'paused' and new.status in ('pending_review','completed'))
     or (old.status = 'paused' and new.status = 'published' and old.reviewed_at is not null)
  then return new; end if;
  raise exception 'Invalid project status transition';
end $$;
create trigger projects_validate_transition before update on public.projects for each row execute function public.validate_project_transition();

create function public.prevent_self_suspension() returns trigger language plpgsql as $$
begin if old.id = auth.uid() and new.is_suspended then raise exception 'Admins cannot suspend themselves'; end if; return new; end $$;
create trigger users_prevent_self_suspension before update on public.users for each row execute function public.prevent_self_suspension();

drop policy applications_create on public.applications;
create policy applications_create on public.applications for insert with check (
  tester_id = auth.uid() and public.is_active() and status = 'pending'
  and public.project_spots(project_id) > 0
  and exists(select 1 from public.projects p where p.id = project_id and p.status = 'published' and p.maker_id <> auth.uid() and (p.deadline is null or p.deadline >= current_date))
);

create function public.complete_test_on_feedback() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.applications set status = 'completed'
  where project_id = new.project_id and tester_id = new.tester_id and status = 'approved';
  return new;
end $$;
create trigger feedback_completes_test after insert on public.feedbacks for each row execute function public.complete_test_on_feedback();

create function public.resume_project(p_project uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  update public.projects set status = 'published'
  where id = p_project and maker_id = auth.uid() and status = 'paused' and reviewed_at is not null and public.is_active();
  if not found then raise exception 'Cannot resume this project'; end if;
end $$;
revoke all on function public.resume_project(uuid) from public;
grant execute on function public.resume_project(uuid) to authenticated;

create view public.project_discovery with (security_invoker = true) as
select p.*, public.project_spots(p.id) as available_positions
from public.projects p where p.status = 'published';
grant select on public.project_discovery to anon, authenticated;

create or replace function public.approve_application(p_application uuid) returns void language plpgsql security definer set search_path = public as $$
declare a public.applications%rowtype; p public.projects%rowtype; selected_count integer;
begin
  select * into a from public.applications where id = p_application for update;
  if not found then raise exception 'Application not found'; end if;
  select * into p from public.projects where id = a.project_id for update;
  if p.maker_id <> auth.uid() or not public.is_active() then raise exception 'Not authorized'; end if;
  if p.status <> 'published' or (p.deadline is not null and p.deadline < current_date) then raise exception 'Recruitment is closed'; end if;
  if a.status <> 'pending' then raise exception 'Application is not pending'; end if;
  select count(*) into selected_count from public.project_members where project_id = p.id;
  if selected_count >= p.capacity then raise exception 'Recruitment capacity reached'; end if;
  update public.applications set status = 'approved' where id = a.id;
  insert into public.project_members(project_id,tester_id,application_id) values (p.id,a.tester_id,a.id);
end $$;
