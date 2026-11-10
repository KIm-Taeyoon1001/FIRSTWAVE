-- Accept only string answers to questions that belong to the same campaign.
-- The browser form validates this too, but direct API writes must follow the
-- same rule because feedback is read by makers and used for analytics.
create or replace function public.validate_feedback_answers() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if jsonb_typeof(new.answers) <> 'object' then
    raise exception 'Answers must be an object';
  end if;
  if exists (
    select 1 from jsonb_each(new.answers) answer
    left join public.feedback_questions question
      on question.project_id = new.project_id and question.id::text = answer.key
    where question.id is null or jsonb_typeof(answer.value) <> 'string'
  ) then
    raise exception 'Feedback answers must reference campaign questions and contain text';
  end if;
  if exists (
    select 1 from public.feedback_questions question
    where question.project_id = new.project_id and question.required
      and nullif(trim(coalesce(new.answers->>question.id::text, '')), '') is null
  ) then
    raise exception 'A required feedback question is unanswered';
  end if;
  if exists (
    select 1 from public.feedback_questions question
    where question.project_id = new.project_id and new.answers ? question.id::text
      and (
        (question.kind = 'rating' and coalesce(new.answers->>question.id::text, '') !~ '^[1-5]$')
        or (question.kind = 'yes_no' and coalesce(new.answers->>question.id::text, '') not in ('yes', 'no'))
        or (question.kind = 'text' and length(coalesce(new.answers->>question.id::text, '')) > 3000)
      )
  ) then
    raise exception 'A feedback answer is invalid';
  end if;
  return new;
end $$;
