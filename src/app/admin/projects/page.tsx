import { db } from '@/lib/supabase';
import { adminDecision } from '@/lib/actions';
import { ConfirmButton } from '@/components/confirm-button';

export default async function AdminProjects({searchParams}:{searchParams:Promise<{message?:string}>}) {
  const {message}=await searchParams, client=await db();
  const {data}=await client!.from('projects').select('id,name,tagline,description,category,platform,product_url,capacity,created_at').eq('status','pending_review').order('created_at',{ascending:true});
  return <>
    <span className="eyebrow">Moderation queue</span><h1>Projects</h1><p className="sub">Review product details before they become public.</p>
    {message && <div className="message">{message}</div>}
    <div className="panel">{data?.length ? data.map(project => <article className="detail-section" key={project.id}>
      <span className="pill">{project.category} · {project.platform}</span>
      <h2 style={{marginTop:12}}>{project.name}</h2><p>{project.tagline}</p><p style={{whiteSpace:'pre-wrap'}}>{project.description}</p>
      <p>Capacity: {project.capacity} · Submitted {new Date(project.created_at).toLocaleDateString()}</p>
      {project.product_url && <a className="small-link" href={project.product_url} target="_blank" rel="noopener noreferrer">Visit product ↗</a>}
      <form action={adminDecision} className="form-stack" style={{maxWidth:590,marginTop:18}}>
        <input type="hidden" name="entity" value="project"/><input type="hidden" name="id" value={project.id}/>
        <label>Reason for rejection<textarea name="note" maxLength={1000} placeholder="Explain what the maker should change if you reject this project."/></label>
        <div style={{display:'flex',gap:8}}><button className="button small" name="decision" value="published">Approve project</button><ConfirmButton className="button small light" name="decision" value="rejected" message="Reject this project and send the note to its maker?">Reject project</ConfirmButton></div>
      </form>
    </article>) : <div className="empty"><h3>Queue is clear</h3><p>Submitted projects will appear here.</p></div>}</div>
  </>;
}
