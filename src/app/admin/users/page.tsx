import Link from 'next/link';
import { db, currentUser } from '@/lib/supabase';
import { adminDecision } from '@/lib/actions';
import { ConfirmButton } from '@/components/confirm-button';

export default async function AdminUsers({searchParams}:{searchParams:Promise<{message?:string;q?:string;page?:string}>}) {
  const {message,q,page:rawPage}=await searchParams, client=await db(), current=await currentUser();
  const page=Math.max(1,Number(rawPage)||1), search=(q||'').trim().replace(/[%_]/g,'').slice(0,100);
  let query=client!.from('users').select('id,email,is_admin,is_suspended,created_at',{count:'exact'}).order('created_at',{ascending:false});
  if (search) query=query.ilike('email',`%${search}%`);
  const {data,count}=await query.range((page-1)*25,page*25-1);
  return <>
    <span className="eyebrow">Account management</span><h1>Users</h1><p className="sub">Review accounts and suspend access when necessary.</p>
    {message && <div className="message">{message}</div>}
    <form action="/admin/users" className="filter-form"><input className="field" name="q" type="search" defaultValue={q||''} placeholder="Search by email" aria-label="Search users"/><button className="button">Search</button></form>
    <div className="panel table-wrap">{data?.length ? <table><thead><tr><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead><tbody>{data.map(member => <tr key={member.id}>
      <td>{member.email}</td><td>{member.is_admin?'Admin':'Member'}</td><td><span className={member.is_suspended?'status rejected':'status'}>{member.is_suspended?'Suspended':'Active'}</span></td><td>{new Date(member.created_at).toLocaleDateString()}</td>
      <td>{member.id!==current!.id && <form action={adminDecision}><input type="hidden" name="entity" value="user"/><input type="hidden" name="id" value={member.id}/><ConfirmButton className="button small light" name="decision" value={String(!member.is_suspended)} message={member.is_suspended?'Restore this account?':'Suspend this account?'}>{member.is_suspended?'Restore':'Suspend'}</ConfirmButton></form>}</td>
    </tr>)}</tbody></table> : <div className="empty"><h3>No users found</h3><p>Try another email search.</p></div>}</div>
    {(count||0)>25 && <div className="pagination">{page>1&&<Link className="button light" href={`/admin/users?q=${encodeURIComponent(q||'')}&page=${page-1}`}>Previous</Link>}{page*25<(count||0)&&<Link className="button light" href={`/admin/users?q=${encodeURIComponent(q||'')}&page=${page+1}`}>Next</Link>}</div>}
  </>;
}
