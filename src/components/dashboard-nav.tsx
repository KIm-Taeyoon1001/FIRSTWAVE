'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, ClipboardList, MessageSquareText, ChartNoAxesCombined, UserRound, Settings, Bell, ShieldCheck, UsersRound } from 'lucide-react';

const groups = [
  { label: 'Workspace', items: [['Overview', '/dashboard', LayoutDashboard]] },
  { label: 'Maker', items: [['My Projects', '/dashboard/projects', FolderKanban], ['Analytics', '/dashboard/analytics', ChartNoAxesCombined]] },
  { label: 'Tester', items: [['Applications', '/dashboard/applications', ClipboardList], ['Feedback', '/dashboard/feedback', MessageSquareText]] },
  { label: 'Together', items: [['Community', '/dashboard/community', UsersRound]] },
  { label: 'Account', items: [['Notifications', '/dashboard/notifications', Bell], ['Profile', '/dashboard/profile', UserRound], ['Settings', '/dashboard/settings', Settings]] },
] as const;

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  return <nav aria-label="Dashboard navigation">{groups.map(group => <div className="dash-nav-group" key={group.label}>
    <span className="dash-nav-label">{group.label}</span>
    {group.items.map(([label, href, Icon]) => <Link key={href} href={href} aria-current={path === href || (href !== '/dashboard' && path.startsWith(`${href}/`)) ? 'page' : undefined}><Icon size={16}/>{label}</Link>)}
  </div>)}{isAdmin && <div className="dash-nav-group"><span className="dash-nav-label">Manage</span><Link href="/admin" aria-current={path.startsWith('/admin') ? 'page' : undefined}><ShieldCheck size={16}/>Administration</Link></div>}</nav>;
}
