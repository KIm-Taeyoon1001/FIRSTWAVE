import { Bell } from 'lucide-react';
import { db, currentUser } from '@/lib/supabase';
import { markNotificationRead } from '@/lib/actions';

export default async function Notifications({searchParams}:{searchParams:Promise<{message?:string}>}) {
  const {message} = await searchParams;
  const client = await db(), user = await currentUser();
  const {data} = await client!.from('notifications').select('id,title,body,read_at,created_at').eq('user_id',user!.id).order('created_at',{ascending:false}).limit(50);
  return <>
    <span className="eyebrow">Activity</span><h1>Notifications</h1><p className="sub">Updates about your projects, applications, and feedback.</p>
    {message && <div className="message">{message}</div>}
    <div className="panel"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><h2>Recent updates</h2>
      {data?.some(item => !item.read_at) && <form action={markNotificationRead}><button className="button small light">Mark all as read</button></form>}
    </div>
      {data?.length ? <div>{data.map(item => <div key={item.id} className="feature-row" style={{borderColor:'var(--line)',gap:16,alignItems:'start',background:item.read_at?'transparent':'#20382a',padding:'16px 12px'}}>
        <Bell size={17} color="#16a36a" style={{flex:'none'}}/>
        <div style={{flex:1}}><strong>{item.title}</strong><p style={{fontSize:12,color:'var(--muted)',margin:'4px 0'}}>{item.body}</p><small style={{color:'var(--muted)'}}>{new Date(item.created_at).toLocaleString()}</small></div>
        {!item.read_at && <form action={markNotificationRead}><input type="hidden" name="id" value={item.id}/><button className="button small light">Mark read</button></form>}
      </div>)}</div> : <div className="empty"><Bell size={27} style={{margin:'0 auto 10px',color:'#16a36a'}}/><h3>All caught up</h3><p>New activity will appear here.</p></div>}
    </div>
  </>;
}
