alter table public.profiles
  add column tester_interests text[] not null default '{}',
  add column devices text not null default '';
alter table public.projects add column moderation_note text;
alter table public.feedback_questions
  add column kind text not null default 'text'
    check (kind in ('text','rating','yes_no'));
create index feedback_questions_order on public.feedback_questions(project_id, sort_order, id);
drop policy questions_read on public.feedback_questions;
create policy questions_read on public.feedback_questions for select using (
  public.owns_project(project_id) or public.applied_to_project(project_id)
  or exists(select 1 from public.projects p where p.id = project_id and p.status = 'published')
);

create function public.project_application_count(p_project uuid) returns integer
language sql stable security definer set search_path = public as $$
  select case when p.status = 'published'
    then (select count(*)::integer from public.applications where project_id = p.id and status <> 'withdrawn')
    else null end
  from public.projects p where p.id = p_project
$$;
revoke all on function public.project_application_count(uuid) from public;
grant execute on function public.project_application_count(uuid) to anon, authenticated;

drop view public.project_discovery;
create view public.project_discovery with (security_invoker = true) as
select p.*, public.project_spots(p.id) as available_positions,
  public.project_application_count(p.id) as application_count
from public.projects p where p.status = 'published';
grant select on public.project_discovery to anon, authenticated;

create function public.validate_feedback_answers() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if jsonb_typeof(new.answers) <> 'object' then raise exception 'Answers must be an object'; end if;
  if exists (
    select 1 from public.feedback_questions q
    where q.project_id = new.project_id and q.required
      and nullif(trim(coalesce(new.answers->>q.id::text,'')),'') is null
  ) then raise exception 'A required feedback question is unanswered'; end if;
  if exists (
    select 1 from public.feedback_questions q
    where q.project_id = new.project_id and new.answers ? q.id::text
      and (
        (q.kind = 'rating' and coalesce(new.answers->>q.id::text,'') !~ '^[1-5]$')
        or (q.kind = 'yes_no' and coalesce(new.answers->>q.id::text,'') not in ('yes','no'))
        or (q.kind = 'text' and length(coalesce(new.answers->>q.id::text,'')) > 3000)
      )
  ) then raise exception 'A feedback answer is invalid'; end if;
  return new;
end $$;
create trigger feedback_validate_answers before insert on public.feedbacks
for each row execute function public.validate_feedback_answers();

create function public.notify_application_created() returns trigger
language plpgsql security definer set search_path = public as $$
declare maker uuid; title text;
begin
  select maker_id, name into maker, title from public.projects where id = new.project_id;
  insert into public.notifications(user_id,title,body)
    values (maker,'New tester application', 'A tester applied to ' || title || '.');
  return new;
end $$;
create trigger applications_notify_maker after insert on public.applications
for each row execute function public.notify_application_created();

create function public.notify_application_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare title text;
begin
  if old.status = new.status then return new; end if;
  select name into title from public.projects where id = new.project_id;
  insert into public.notifications(user_id,title,body)
    values (new.tester_id,'Application ' || initcap(new.status::text),
      'Your application for ' || title || ' is now ' || new.status::text || '.');
  return new;
end $$;
create trigger applications_notify_tester after update of status on public.applications
for each row execute function public.notify_application_status();

create function public.notify_feedback_created() returns trigger
language plpgsql security definer set search_path = public as $$
declare maker uuid; title text;
begin
  select maker_id, name into maker, title from public.projects where id = new.project_id;
  insert into public.notifications(user_id,title,body)
    values (maker,'New product feedback','A tester submitted feedback for ' || title || '.');
  return new;
end $$;
create trigger feedback_notify_maker after insert on public.feedbacks
for each row execute function public.notify_feedback_created();

create function public.notify_project_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.status = new.status and old.moderation_note is not distinct from new.moderation_note then return new; end if;
  insert into public.notifications(user_id,title,body)
    values (new.maker_id,'Project ' || replace(new.status::text,'_',' '),
      new.name || ' is now ' || replace(new.status::text,'_',' ') ||
      case when new.moderation_note is not null then '. Note: ' || new.moderation_note else '.' end);
  return new;
end $$;
create trigger projects_notify_maker after update of status, moderation_note on public.projects
for each row execute function public.notify_project_status();

create index notifications_unread on public.notifications(user_id, created_at desc)
where read_at is null;
