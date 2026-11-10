import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Compass, LogOut, Bell } from 'lucide-react';
import { currentUser, db } from '@/lib/supabase';
import { Brand } from '@/components/public-shell';
import { DashboardNav } from '@/components/dashboard-nav';
import { signOut } from '@/lib/actions';

export default async function DashboardLayout({children}:{children:React.ReactNode}) {
  const user = await currentUser();
  if (!user) redirect('/login?message=Please+sign+in+to+continue');
  const client = await db();
  const [{count: unread}, {data: account}] = await Promise.all([
    client!.from('notifications').select('*',{count:'exact',head:true}).eq('user_id',user.id).is('read_at',null),
    client!.from('users').select('is_admin,is_suspended').eq('id',user.id).single()
  ]);
  if (account?.is_suspended) redirect('/suspended');
  return <div className="dash">
    <header className="dash-global"><div className="dash-global-brand"><Brand/><span className="dash-global-divider"/><span className="dash-workspace-name">Personal workspace</span></div>
      <div className="dash-global-actions"><Link className="dash-explore" href="/explore"><Compass size={16}/>Explore</Link><Link href="/dashboard/notifications" aria-label={`${unread || 0} unread notifications`}><Bell size={17}/>{unread ? <span className="status">{unread}</span> : null}</Link><span className="auth-status"><span className="auth-status-dot"/>Signed in</span><span className="dash-account-email">{user.email}</span><form action={signOut}><button aria-label="Sign out" className="dash-signout"><LogOut size={16}/></button></form></div>
    </header>
    <aside className="dash-side"><div className="dash-sidebar-title"><span>FIRSTWAVE</span><strong>Workspace</strong></div><DashboardNav isAdmin={Boolean(account?.is_admin)}/></aside>
    <div className="dash-main">
      <main className="dash-content">{children}</main>
    </div>
  </div>;
}
