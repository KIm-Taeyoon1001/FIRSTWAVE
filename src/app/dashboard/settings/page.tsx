import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db, currentUser } from '@/lib/supabase';

export default async function Settings({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const client = await db(), user = await currentUser();
  if (!client || !user) redirect('/login');
  const { data } = await client!.from('users').select('email,created_at').eq('id', user!.id).single();
  return <>
    <div className="workspace-heading"><div><span className="eyebrow">ACCOUNT</span><h1>Settings</h1><p className="sub">Review your account details and keep access secure.</p></div></div>
    {message && <div className="message" role="status">{message}</div>}
    <div className="account-layout"><div className="account-main"><section className="panel account-settings-section"><div className="account-section-heading"><div><span className="workspace-kicker">ACCOUNT DETAILS</span><h2>Identity</h2></div></div>
      <dl className="account-details"><div><dt>Email address</dt><dd>{data?.email || user.email || '—'}</dd></div><div><dt>Member since</dt><dd>{data?.created_at ? new Intl.DateTimeFormat('en', {year:'numeric',month:'long',day:'numeric'}).format(new Date(data.created_at)) : '—'}</dd></div></dl>
      <p className="account-help">Your email is used to sign in and receive account messages.</p></section>
      <section className="panel account-settings-section"><div className="account-section-heading"><div><span className="workspace-kicker">SECURITY</span><h2>Password</h2></div></div><p>Need a new password? We’ll email a reset link to your account address.</p><Link className="button light" href="/forgot-password">Reset password</Link></section>
    </div><aside className="panel account-aside"><span className="workspace-kicker">YOUR WORKSPACE</span><h2>One account, two roles</h2><p>Manage your projects and participate as a beta tester with the same account.</p><Link className="small-link" href="/dashboard/profile">Edit your public profile →</Link></aside></div>
  </>;
}
