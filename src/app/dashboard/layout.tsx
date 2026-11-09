import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutDashboard, FolderKanban, ClipboardList, MessageSquareText, ChartNoAxesCombined, UserRound, Settings, Compass, LogOut, Bell, ShieldCheck } from 'lucide-react';
import { currentUser, db } from '@/lib/supabase';
import { Brand } from '@/components/public-shell';
import { signOut } from '@/lib/actions';

const nav = [
  ['Overview','/dashboard',LayoutDashboard],
  ['My Projects','/dashboard/projects',FolderKanban],
  ['Applications','/dashboard/applications',ClipboardList],
  ['Feedback','/dashboard/feedback',MessageSquareText],
  ['Analytics','/dashboard/analytics',ChartNoAxesCombined],
  ['Notifications','/dashboard/notifications',Bell],
  ['Profile','/dashboard/profile',UserRound],
  ['Settings','/dashboard/settings',Settings]
] as const;

export default async function DashboardLayout({children}:{children:React.ReactNode}) {
  const user = await currentUser();
  if (!user) redirect('/login?message=Please+sign+in+to+continue');
  const client = await db();
  const [{count: unread}, {data: account}] = await Promise.all([
    client!.from('notifications').select('*',{count:'exact',head:true}).eq('user_id',user.id).is('read_at',null),
    client!.from('users').select('is_admin').eq('id',user.id).single()
  ]);
  return <div className="dash">
    <aside className="dash-side"><Brand/><nav aria-label="Dashboard navigation">
      {nav.map(([label,href,Icon]) => <Link key={href} href={href}><Icon size={16}/>{label}</Link>)}
      {account?.is_admin && <Link href="/admin"><ShieldCheck size={16}/>Administration</Link>}
      <Link href="/explore"><Compass size={16}/>Explore</Link>
    </nav></aside>
    <div className="dash-main">
      <div className="dash-top"><span style={{fontSize:12,color:'#738376'}}>Workspace / FIRSTWAVE</span>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <Link href="/dashboard/notifications" aria-label={`${unread || 0} unread notifications`} style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,color:'#627468'}}><Bell size={16}/>{unread ? <span className="status">{unread}</span> : null}</Link>
          <span style={{fontSize:12,color:'#627468'}}>{user.email}</span>
          <form action={signOut}><button aria-label="Sign out" style={{border:0,background:'none',color:'#627468'}}><LogOut size={16}/></button></form>
        </div>
      </div>
      <main className="dash-content">{children}</main>
    </div>
  </div>;
}
