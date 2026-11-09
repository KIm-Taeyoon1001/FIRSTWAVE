import { db } from '@/lib/supabase';
export default async function Audit() {
  const client=await db();
  const {data}=await client!.from('audit_logs').select('id,actor_id,action,entity_type,entity_id,details,created_at').order('created_at',{ascending:false}).limit(100);
  return <><span className="eyebrow">Accountability</span><h1>Audit logs</h1><p className="sub">Recent administrative decisions across the platform.</p>
    <div className="panel table-wrap">{data?.length ? <table><thead><tr><th>Time</th><th>Action</th><th>Entity</th><th>Actor</th></tr></thead><tbody>{data.map(log => <tr key={log.id}><td>{new Date(log.created_at).toLocaleString()}</td><td>{log.action}</td><td>{log.entity_type}<br/><span style={{color:'#87958c'}}>{log.entity_id}</span></td><td>{log.actor_id}</td></tr>)}</tbody></table> : <div className="empty"><h3>No admin actions yet</h3><p>Moderation decisions will appear here.</p></div>}</div>
  </>;
}
