const fs=require('fs');
const path=require('path');
const {PGlite}=require('@electric-sql/pglite');
(async()=>{
  const db=new PGlite();
  await db.exec("create role authenticated; create role anon; create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('app.uid',true),'')::uuid$$; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text); create function storage.foldername(name text) returns text[] language sql immutable as $$select string_to_array(name,'/')$$;");
  const root=path.join(__dirname,'..','supabase','migrations');
  for(const file of ['001_initial.sql','002_hardening.sql']){const sql=fs.readFileSync(path.join(root,file),'utf8').replace('create extension if not exists pgcrypto;','');await db.exec(sql);console.log(file,'OK')}
  const maker='00000000-0000-4000-8000-000000000001', tester1='00000000-0000-4000-8000-000000000002', tester2='00000000-0000-4000-8000-000000000003', project='00000000-0000-4000-8000-000000000004', app1='00000000-0000-4000-8000-000000000005', app2='00000000-0000-4000-8000-000000000006', outsider='00000000-0000-4000-8000-000000000008';
  await db.exec(`insert into auth.users(id,email) values ('${maker}','maker@test.local'),('${tester1}','one@test.local'),('${tester2}','two@test.local'),('${outsider}','outsider@test.local'); insert into public.projects(id,maker_id,slug,name,tagline,description,status,capacity,reviewed_at) values ('${project}','${maker}','test','Test project','A test campaign','For testing the database workflow','published',1,now()); insert into public.applications(id,project_id,tester_id,message) values ('${app1}','${project}','${tester1}','I would like to test this'),('${app2}','${project}','${tester2}','I would like to test this too'); select set_config('app.uid','${maker}',false);`);
  await db.exec(`select public.approve_application('${app1}')`);
  let blocked=false;
  try{await db.exec(`select public.approve_application('${app2}')`)}catch(e){blocked=String(e.message).includes('Recruitment capacity reached')}
  const result=await db.query(`select count(*)::int as selected from public.project_members where project_id='${project}'`);
  if(!blocked||result.rows[0].selected!==1)throw new Error('Capacity invariant failed');
  console.log('Approval capacity invariant OK');
  const view=await db.query(`select available_positions from public.project_discovery where id='${project}'`);
  if(view.rows[0]?.available_positions!==0)throw new Error('Public availability calculation failed');
  console.log('Public availability calculation OK');
  const privateProject='00000000-0000-4000-8000-000000000007';
  await db.exec(`insert into public.projects(id,maker_id,slug,name,tagline,description) values ('${privateProject}','${maker}','private','Private draft','A private campaign','This draft must be hidden from other users'); grant usage on schema public,auth to authenticated; grant select,insert,update,delete on all tables in schema public to authenticated; select set_config('app.uid','${tester2}',false); set role authenticated;`);
  const hidden=await db.query(`select id from public.projects where id='${privateProject}'`);
  const otherApplication=await db.query(`select id from public.applications where id='${app1}'`);
  if(hidden.rows.length||otherApplication.rows.length)throw new Error('RLS privacy check failed');
  let feedbackBlocked=false;
  try{await db.exec(`insert into public.feedbacks(project_id,tester_id,overall_rating,usability_rating) values ('${project}','${tester2}',5,5)`)}catch(e){feedbackBlocked=String(e.message).includes('row-level security')}
  if(!feedbackBlocked)throw new Error('Unselected tester submitted feedback');
  await db.exec(`select set_config('app.uid','${tester1}',false); insert into public.feedbacks(project_id,tester_id,overall_rating,usability_rating) values ('${project}','${tester1}',5,4);`);
  await db.exec('reset role');
  const status=await db.query(`select status from public.applications where id='${app1}'`);
  if(status.rows[0].status!=='completed')throw new Error('Feedback did not complete the test');
  console.log('RLS privacy and selected feedback workflow OK');
  await db.exec(`select set_config('app.uid','${maker}',false); update public.projects set status='paused' where id='${project}'`);
  let closedBlocked=false;
  try{await db.exec(`select public.approve_application('${app2}')`)}catch(e){closedBlocked=String(e.message).includes('Recruitment is closed')}
  if(!closedBlocked)throw new Error('Paused campaign accepted an applicant');
  console.log('Paused campaign approval blocked OK');
  await db.exec(`set role authenticated; select set_config('app.uid','${outsider}',false)`);
  const outsiderView=await db.query(`select id from public.projects where id='${project}'`);
  await db.exec(`select set_config('app.uid','${tester1}',false)`);
  const applicantView=await db.query(`select id from public.projects where id='${project}'`);
  await db.exec('reset role');
  if(outsiderView.rows.length!==0||applicantView.rows.length!==1)throw new Error('Paused project visibility failed');
  console.log('Paused project applicant visibility OK');
  await db.close();
})().catch(e=>{console.error(e);process.exit(1)});
