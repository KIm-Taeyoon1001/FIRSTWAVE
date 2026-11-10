import Link from 'next/link';
import { db, currentUser } from '@/lib/supabase';

export default async function Settings({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const client = await db(), user = await currentUser();
  const { data } = await client!.from('users').select('email,created_at').eq('id', user!.id).single();
  return <>
    <span className="eyebrow">Account</span><h1>Settings</h1>
    <p className="sub">Manage the account used for both maker and tester activities.</p>
    {message && <div className="message" role="status">{message}</div>}
    <div className="panel" style={{ maxWidth: 660 }}><h2>Account details</h2>
      <div className="feature-row"><span>Email</span><strong>{data?.email || user!.email}</strong></div>
      <div className="feature-row"><span>Joined</span><strong>{data?.created_at ? new Date(data.created_at).toLocaleDateString() : '—'}</strong></div>
      <p style={{ fontSize: 12, color: '#68776d', marginTop: 20 }}>Your account is used for both maker and tester activities.</p>
      <Link className="button light" href="/forgot-password">Reset password</Link>
    </div>
  </>;
}
