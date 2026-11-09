'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, currentUser } from './supabase';

function value(form: FormData, key: string) { return String(form.get(key) || '').trim(); }
function go(path: string, message: string): never { redirect(`${path}?message=${encodeURIComponent(message)}`); }
async function requireSession() {
  const client = await db();
  const user = await currentUser();
  if (!client || !user) redirect('/login?message=Please+sign+in+to+continue');
  return { client, user };
}
const projectSchema = z.object({
  name: z.string().min(2).max(100), tagline: z.string().min(5).max(180),
  description: z.string().min(30), category: z.string().min(2),
  platform: z.string().min(2), capacity: z.coerce.number().int().min(1).max(10000),
  product_url: z.union([z.literal(''), z.string().url().refine(url => /^https?:\/\//i.test(url), 'Use an HTTP or HTTPS product URL')]),
  deadline: z.string(), requirements: z.string(), instructions: z.string(),
  expected_feedback: z.string(), reward: z.string(),
});

export async function signIn(form: FormData) {
  const client = await db();
  if (!client) go('/login', 'Supabase is not configured');
  const { error } = await client.auth.signInWithPassword({ email: value(form, 'email'), password: value(form, 'password') });
  if (error) go('/login', error.message);
  redirect('/dashboard');
}
export async function signUp(form: FormData) {
  const client = await db();
  if (!client) go('/signup', 'Supabase is not configured');
  const parsed = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(2) }).safeParse({ email: value(form,'email'), password: value(form,'password'), name: value(form,'name') });
  if (!parsed.success) go('/signup', 'Enter a name, valid email and password of at least 8 characters');
  const { error } = await client.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { data: { full_name: parsed.data.name } } });
  if (error) go('/signup', error.message);
  redirect('/login?message=Check+your+email+to+confirm+your+account');
}
export async function googleSignIn() {
  const client = await db();
  if (!client) go('/login', 'Supabase is not configured');
  const { data, error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback` } });
  if (error || !data.url) go('/login', error?.message || 'Google sign in is unavailable');
  redirect(data.url);
}
export async function signOut() {
  const client = await db();
  await client?.auth.signOut();
  redirect('/');
}
export async function saveProfile(form: FormData) {
  const { client, user } = await requireSession();
  const display_name = value(form,'display_name');
  if (display_name.length < 2 || display_name.length > 80) go('/dashboard/profile', 'Name must be 2–80 characters');
  const allowed = new Set(['Productivity','Developer Tools','Design','Education','Finance','Other']);
  const tester_interests = form.getAll('tester_interests').map(String).filter(item => allowed.has(item));
  const { error } = await client.from('profiles').update({ display_name, bio: value(form,'bio').slice(0,1000), devices: value(form,'devices').slice(0,300), tester_interests }).eq('user_id', user.id);
  if (error) go('/dashboard/profile', error.message);
  revalidatePath('/dashboard/profile');
  go('/dashboard/profile', 'Profile saved');
}
export async function createProject(form: FormData) {
  const { client, user } = await requireSession();
  const parsed = projectSchema.safeParse(Object.fromEntries([...form.keys()].map(k => [k, value(form,k)])));
  if (!parsed.success) go('/dashboard/projects/new', parsed.error.issues[0].message);
  const slug = `${parsed.data.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'project'}-${crypto.randomUUID().slice(0,8)}`;
  const { data, error } = await client.from('projects').insert({ ...parsed.data, product_url: parsed.data.product_url || null, deadline: parsed.data.deadline || null, slug, maker_id: user.id }).select('id').single();
  if (error || !data) go('/dashboard/projects/new', error?.message || 'Could not create project');
  revalidatePath('/dashboard/projects');
  redirect(`/dashboard/projects/${data.id}`);
}
export async function updateProject(form: FormData) {
  const { client, user } = await requireSession();
  const id = value(form,'id');
  const parsed = projectSchema.safeParse(Object.fromEntries([...form.keys()].map(k => [k, value(form,k)])));
  if (!parsed.success) go(`/dashboard/projects/${id}`, parsed.error.issues[0].message);
  const { data, error } = await client.from('projects').update({ ...parsed.data, product_url: parsed.data.product_url || null, deadline: parsed.data.deadline || null }).eq('id', id).eq('maker_id', user.id).select('id').single();
  if (error || !data) go(`/dashboard/projects/${id}`, error?.message || 'Project could not be updated');
  revalidatePath('/dashboard/projects');
  go(`/dashboard/projects/${id}`, 'Project saved');
}
export async function changeProjectStatus(form: FormData) {
  const { client, user } = await requireSession();
  const id = value(form,'id'), status = value(form,'status');
  if (!['pending_review','paused','completed','published'].includes(status)) go(`/dashboard/projects/${id}`, 'Invalid status');
  const currentStatus = status === 'pending_review' ? ['draft','rejected'] : status === 'paused' ? ['published'] : status === 'completed' ? ['published','paused'] : ['paused'];
  const { data: existing } = await client.from('projects').select('status').eq('id',id).eq('maker_id',user.id).single();
  if (!existing || !currentStatus.includes(existing.status)) go(`/dashboard/projects/${id}`, 'This status change is unavailable');
  const { error } = status === 'published' ? await client.rpc('resume_project',{p_project:id}) : await client.from('projects').update({ status }).eq('id', id).eq('maker_id', user.id).eq('status',existing.status).select('id').single();
  if (error) go(`/dashboard/projects/${id}`, error.message);
  revalidatePath('/dashboard/projects');
  go(`/dashboard/projects/${id}`, 'Campaign status updated');
}
export async function uploadProjectAsset(form: FormData) {
  const { client, user } = await requireSession();
  const id = value(form,'id'), kind = value(form,'kind');
  const file = form.get('file');
  if (!(file instanceof File) || !['logo','screenshot'].includes(kind)) go(`/dashboard/projects/${id}`,'Choose an image');
  if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) go(`/dashboard/projects/${id}`,'Use a PNG, JPEG, or WebP image under 5 MB');
  const { data: project } = await client.from('projects').select('maker_id,screenshots,status').eq('id',id).eq('maker_id',user.id).single();
  if (!project || !['draft','rejected','paused','published'].includes(project.status)) go(`/dashboard/projects/${id}`,'This project cannot be edited');
  if (kind === 'screenshot' && (project.screenshots || []).length >= 8) go(`/dashboard/projects/${id}`,'A project can have at most eight screenshots');
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : 'webp';
  const path = `${user.id}/${id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await client.storage.from('project-assets').upload(path,file,{contentType:file.type,upsert:false});
  if (uploadError) go(`/dashboard/projects/${id}`,uploadError.message);
  const { data: url } = client.storage.from('project-assets').getPublicUrl(path);
  const update = kind === 'logo' ? {logo_url:url.publicUrl} : {screenshots:[...(project.screenshots||[]),url.publicUrl].slice(0,8)};
  const { error } = await client.from('projects').update(update).eq('id',id).eq('maker_id',user.id).select('id').single();
  if (error) go(`/dashboard/projects/${id}`,error.message);
  revalidatePath(`/dashboard/projects/${id}`);
  go(`/dashboard/projects/${id}`,'Image uploaded');
}
export async function reportProject(form: FormData) {
  const { client, user } = await requireSession();
  const project_id = value(form,'project_id'), slug = value(form,'slug');
  const reason = value(form,'reason'), details = value(form,'details');
  if (reason.length < 5 || details.length > 2000) go(`/projects/${slug}`,'Enter a reason of at least 5 characters');
  const { error } = await client.from('reports').insert({reporter_id:user.id,project_id,reason,details});
  if (error) go(`/projects/${slug}`,error.message);
  go(`/projects/${slug}`,'Report submitted');
}
export async function applyToProject(form: FormData) {
  const { client, user } = await requireSession();
  const project_id = value(form,'project_id'), slug = value(form,'slug');
  const message = value(form,'message');
  if (message.length < 10 || message.length > 3000) go(`/projects/${slug}`, 'Application message must be 10–3000 characters');
  const { error } = await client.from('applications').insert({ project_id, tester_id: user.id, message, experience: value(form,'experience'), device_info: value(form,'device_info') });
  if (error) go(`/projects/${slug}`, error.message);
  go(`/projects/${slug}`, 'Application submitted');
}
export async function decideApplication(form: FormData) {
  const { client } = await requireSession();
  const id = value(form,'id'), decision = value(form,'decision');
  if (!['approve','reject'].includes(decision)) go('/dashboard/applications','Invalid decision');
  const { error } = await client.rpc(decision === 'approve' ? 'approve_application' : 'reject_application', { p_application: id });
  if (error) go('/dashboard/applications', error.message);
  revalidatePath('/dashboard/applications');
  go('/dashboard/applications', decision === 'approve' ? 'Application approved' : 'Application rejected');
}
export async function withdrawApplication(form: FormData) {
  const { client, user } = await requireSession();
  const id = value(form,'id');
  const { error } = await client.from('applications').update({status:'withdrawn'}).eq('id',id).eq('tester_id',user.id).eq('status','pending').select('id').single();
  if (error) go('/dashboard/applications',error.message);
  revalidatePath('/dashboard/applications');
  go('/dashboard/applications','Application withdrawn');
}
export async function submitFeedback(form: FormData) {
  const { client, user } = await requireSession();
  const project_id = value(form,'project_id');
  const parsed = z.object({ overall_rating: z.coerce.number().int().min(1).max(5), usability_rating: z.coerce.number().int().min(1).max(5) }).safeParse({ overall_rating: value(form,'overall_rating'), usability_rating: value(form,'usability_rating') });
  if (!parsed.success) go('/dashboard/feedback','Choose both ratings');
  const { data: questions, error: questionError } = await client.from('feedback_questions').select('id,kind,required').eq('project_id',project_id);
  if (questionError) go('/dashboard/feedback',questionError.message);
  const answers: Record<string,string> = {};
  for (const question of questions || []) {
    const answer = value(form,`answer_${question.id}`);
    if (question.required && !answer) go('/dashboard/feedback','Answer all required questions');
    if (answer && question.kind === 'rating' && !/^[1-5]$/.test(answer)) go('/dashboard/feedback','Choose a valid question rating');
    if (answer && question.kind === 'yes_no' && !['yes','no'].includes(answer)) go('/dashboard/feedback','Choose yes or no');
    if (answer.length > 3000) go('/dashboard/feedback','A feedback answer is too long');
    if (answer) answers[question.id] = answer;
  }
  const { error } = await client.from('feedbacks').insert({ project_id, tester_id: user.id, ...parsed.data, answers, bugs: value(form,'bugs'), feature_requests: value(form,'feature_requests'), comments: value(form,'comments') });
  if (error) go('/dashboard/feedback', error.message);
  revalidatePath('/dashboard/feedback');
  go('/dashboard/feedback', 'Feedback submitted');
}
export async function createFeedbackQuestion(form: FormData) {
  const { client, user } = await requireSession();
  const project_id = value(form,'project_id'), prompt = value(form,'prompt');
  const kind = value(form,'kind');
  if (prompt.length < 5 || prompt.length > 300 || !['text','rating','yes_no'].includes(kind)) go(`/dashboard/projects/${project_id}`,'Enter a valid feedback question');
  const { data: project } = await client.from('projects').select('status').eq('id',project_id).eq('maker_id',user.id).single();
  if (!project || ['pending_review','completed'].includes(project.status)) go(`/dashboard/projects/${project_id}`,'Questions cannot be edited now');
  const { data: latest } = await client.from('feedback_questions').select('sort_order').eq('project_id',project_id).order('sort_order',{ascending:false}).limit(1).maybeSingle();
  const { error } = await client.from('feedback_questions').insert({ project_id, prompt, kind, required: form.get('required') === 'on', sort_order: (latest?.sort_order || 0) + 1 });
  if (error) go(`/dashboard/projects/${project_id}`,error.message);
  revalidatePath(`/dashboard/projects/${project_id}`);
  go(`/dashboard/projects/${project_id}`,'Question added');
}
export async function deleteFeedbackQuestion(form: FormData) {
  const { client, user } = await requireSession();
  const project_id = value(form,'project_id'), id = value(form,'id');
  const { data: project } = await client.from('projects').select('status').eq('id',project_id).eq('maker_id',user.id).single();
  if (!project || ['pending_review','completed'].includes(project.status)) go(`/dashboard/projects/${project_id}`,'Questions cannot be edited now');
  const { error } = await client.from('feedback_questions').delete().eq('id',id).eq('project_id',project_id).select('id').single();
  if (error) go(`/dashboard/projects/${project_id}`,error.message);
  revalidatePath(`/dashboard/projects/${project_id}`);
  go(`/dashboard/projects/${project_id}`,'Question removed');
}
export async function markNotificationRead(form: FormData) {
  const { client, user } = await requireSession();
  const id = value(form,'id');
  let query = client.from('notifications').update({read_at:new Date().toISOString()}).eq('user_id',user.id).is('read_at',null);
  if (id) query = query.eq('id',id);
  const { error } = await query;
  if (error) go('/dashboard/notifications',error.message);
  revalidatePath('/dashboard/notifications');
  redirect('/dashboard/notifications');
}
export async function adminDecision(form: FormData) {
  const { client, user } = await requireSession();
  const { data: admin } = await client.from('users').select('is_admin').eq('id', user.id).single();
  if (!admin?.is_admin) redirect('/dashboard');
  const entity = value(form,'entity'), id = value(form,'id'), decision = value(form,'decision');
  if (entity === 'project' && ['published','rejected'].includes(decision)) {
    const note = value(form,'note').slice(0,1000);
    if (decision === 'rejected' && note.length < 5) go('/admin/projects','Give a reason for rejection');
    const { error } = await client.from('projects').update({ status: decision, reviewed_at: new Date().toISOString(), moderation_note: decision === 'rejected' ? note : null }).eq('id',id).eq('status','pending_review').select('id').single();
    if (error) go('/admin/projects',error.message);
  } else if (entity === 'user' && ['true','false'].includes(decision)) {
    const { error } = await client.from('users').update({ is_suspended: decision === 'true' }).eq('id',id).select('id').single();
    if (error) go('/admin/users',error.message);
  } else if (entity === 'report' && ['resolved','dismissed'].includes(decision)) {
    const { error } = await client.from('reports').update({ status: decision }).eq('id',id).select('id').single();
    if (error) go('/admin/reports',error.message);
  } else go('/admin','Invalid action');
  await client.from('audit_logs').insert({ actor_id: user.id, action: decision, entity_type: entity, entity_id: id });
  revalidatePath('/admin');
  go(`/admin/${entity === 'project' ? 'projects' : entity === 'user' ? 'users' : 'reports'}`,'Decision saved');
}
