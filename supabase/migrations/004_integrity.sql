-- Keep moderation fields under administrative control even when a maker calls
-- the PostgREST API directly instead of using the application form.
create function public.guard_project_update() returns trigger
language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if (new.maker_id, new.slug, new.reviewed_at, new.moderation_note, new.created_at)
       is distinct from
       (old.maker_id, old.slug, old.reviewed_at, old.moderation_note, old.created_at)
    then raise exception 'Moderation fields cannot be changed by makers'; end if;
  end if;
  if new.capacity < (select count(*) from public.project_members where project_id = old.id)
  then raise exception 'Capacity cannot be lower than selected testers'; end if;
  return new;
end $$;
create trigger projects_guard_update before update on public.projects
for each row execute function public.guard_project_update();
alter table public.projects add constraint projects_product_url_http
check (product_url is null or product_url ~* '^https?://[^[:space:]/?#]+');

-- Once any tester has answered a campaign, keep its question set stable so
-- stored answers always retain their original meaning.
create function public.guard_feedback_question() returns trigger
language plpgsql set search_path = public as $$
declare target_project uuid; target_status public.project_status;
begin
  if auth.uid() is null then return coalesce(new, old); end if;
  if TG_OP = 'UPDATE' and new.project_id <> old.project_id
  then raise exception 'Feedback questions cannot move between campaigns'; end if;
  if TG_OP = 'DELETE' then target_project := old.project_id;
  else target_project := new.project_id; end if;
  select status into target_status from public.projects where id = target_project;
  if target_status in ('pending_review', 'completed') or
     exists(select 1 from public.feedbacks where project_id = target_project)
  then raise exception 'Feedback questions are locked for this campaign'; end if;
  return coalesce(new, old);
end $$;
create trigger feedback_questions_guard before insert or update or delete
on public.feedback_questions for each row execute function public.guard_feedback_question();

-- Device details and tester interests are useful to a maker reviewing an
-- applicant, but must not be available through a public profile table scan.
drop policy profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (
  user_id = auth.uid() or public.is_admin() or exists (
    select 1 from public.applications a
    join public.projects p on p.id = a.project_id
    where a.tester_id = profiles.user_id and p.maker_id = auth.uid()
  )
);
create view public.public_maker_profiles as
select user_id, display_name, bio, avatar_url
from public.profiles profile
where exists (
  select 1 from public.projects p
  where p.maker_id = profile.user_id and p.status = 'published'
);
grant select on public.public_maker_profiles to anon, authenticated;
