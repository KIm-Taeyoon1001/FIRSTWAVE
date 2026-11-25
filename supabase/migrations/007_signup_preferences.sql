-- Store signup preferences when auth.users is created, including before email confirmation.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  interests text[];
  device_list text;
begin
  select coalesce(array_agg(distinct item), '{}'::text[]) into interests
  from jsonb_array_elements_text(
    case when jsonb_typeof(new.raw_user_meta_data->'tester_interests') = 'array'
      then new.raw_user_meta_data->'tester_interests' else '[]'::jsonb end
  ) as items(item)
  where item = any(array['Productivity','Developer Tools','Design','Education','Finance','Other']);

  device_list := left(coalesce(new.raw_user_meta_data->>'devices', ''), 300);
  insert into public.users(id,email) values (new.id, coalesce(new.email,''));
  insert into public.profiles(user_id,display_name,tester_interests,devices)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'full_name',''), 80), interests, device_list);
  return new;
end $$;
