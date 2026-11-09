import { db } from '@/lib/supabase';
import { adminDecision } from '@/lib/actions';
import { ConfirmButton } from '@/components/confirm-button';

export default async function AdminReports({searchParams}:{searchParams:Promise<{message?:string}>}) {
  const {message}=await searchParams, client=await db();
  const {data}=await client!.from('reports').select('id,reason,details,status,created_at,projects(name),users!reports_reporter_id_fkey(email)').eq('status','open').order('created_at',{ascending:true});
  return <>
    <span className="eyebrow">Safety queue</span><h1>Reports</h1><p className="sub">Review and resolve reported content.</p>
    {message && <div className="message">{message}</div>}
    <div className="panel">{data?.length ? data.map(report => <article className="detail-section" key={report.id}>
      <span className="pill">Open report</span><h2 style={{marginTop:12}}>{report.reason}</h2>
      <p>{report.details || 'No additional details provided.'}</p>
      <p style={{fontSize:12}}>Project: {(report.projects as unknown as {name:string}|null)?.name || 'Unavailable'} · Reporter: {(report.users as unknown as {email:string}|null)?.email || 'Unknown'} · {new Date(report.created_at).toLocaleDateString()}</p>
      <form action={adminDecision} style={{display:'flex',gap:8}}><input type="hidden" name="entity" value="report"/><input type="hidden" name="id" value={report.id}/><ConfirmButton className="button small" name="decision" value="resolved" message="Mark this report resolved?">Resolve</ConfirmButton><ConfirmButton className="button small light" name="decision" value="dismissed" message="Dismiss this report?">Dismiss</ConfirmButton></form>
    </article>) : <div className="empty"><h3>No open reports</h3><p>Reports will appear here for review.</p></div>}</div>
  </>;
}
