import { notFound } from 'next/navigation';
import { db, currentUser } from '@/lib/supabase';
import type { Project } from '@/lib/types';
import { ProjectForm } from '@/components/project-form';
import { FeedbackQuestionManager } from '@/components/feedback-question-manager';
import { ConfirmButton } from '@/components/confirm-button';
import { changeProjectStatus, uploadProjectAsset } from '@/lib/actions';

function StatusAction({ id, status, label, confirm }: { id: string; status: string; label: string; confirm?: string }) {
  return <form action={changeProjectStatus}>
    <input type="hidden" name="id" value={id}/>
    <input type="hidden" name="status" value={status}/>
    {confirm ? <ConfirmButton className="button light" message={confirm}>{label}</ConfirmButton> : <button className={status === 'pending_review' ? 'button' : 'button light'}>{label}</button>}
  </form>;
}

export default async function ManageProject({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ message?: string }> }) {
  const { id } = await params;
  const { message } = await searchParams;
  const client = await db(), user = await currentUser();
  const [{ data }, { data: questions }] = await Promise.all([
    client!.from('projects').select('*').eq('id',id).eq('maker_id',user!.id).maybeSingle(),
    client!.from('feedback_questions').select('id,prompt,kind,required,sort_order').eq('project_id',id).order('sort_order',{ascending:true})
  ]);
  if (!data) notFound();
  const project = data as Project;
  const editable = ['draft','rejected','paused','published'].includes(project.status);

  return <>
    <span className="eyebrow">Project management</span>
    <h1>{project.name}</h1>
    <p className="sub"><span className={`status ${project.status}`}>{project.status.replace('_',' ')}</span> · Your campaign workspace</p>
    {message && <div className="message">{message}</div>}
    {project.moderation_note && <div className="message"><strong>Moderator note:</strong> {project.moderation_note}</div>}
    <div className="panel"><h2>Campaign controls</h2><div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
      {['draft','rejected'].includes(project.status) && <StatusAction id={id} status="pending_review" label="Submit for review"/>}
      {project.status === 'published' && <StatusAction id={id} status="paused" label="Pause campaign"/>}
      {project.status === 'paused' && <StatusAction id={id} status="published" label="Resume campaign"/>}
      {['published','paused'].includes(project.status) && <StatusAction id={id} status="completed" label="Close campaign" confirm="Close this campaign? New applications will stop."/>}
    </div></div>
    {editable ? <>
      <div className="panel"><h2>Project details</h2><p style={{fontSize:12,color:'var(--muted)'}}>Changes to a published project return it to moderation.</p><ProjectForm project={project}/></div>
      <div className="panel"><h2>Images</h2><p style={{fontSize:12,color:'var(--muted)'}}>PNG, JPEG, or WebP, up to 5 MB each. Up to eight screenshots.</p>
        {(['logo','screenshot'] as const).map(kind => <form key={kind} action={uploadProjectAsset} style={{display:'flex',gap:10,alignItems:'end',marginTop:12,flexWrap:'wrap'}}>
          <input type="hidden" name="id" value={id}/><input type="hidden" name="kind" value={kind}/>
          <label style={{fontSize:12,fontWeight:700}}>{kind === 'logo' ? 'Project logo' : 'Screenshot'}<input className="field" type="file" name="file" accept="image/png,image/jpeg,image/webp" required/></label>
          <button className="button light">Upload</button>
        </form>)}
      </div>
    </> : <div className="panel"><p>This project is awaiting review or has completed its campaign. Editing is unavailable.</p></div>}
    <FeedbackQuestionManager projectId={id} questions={questions || []} editable={editable}/>
  </>;
}
