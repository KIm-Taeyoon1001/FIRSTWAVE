import { redirect } from 'next/navigation';
import { PublicHeader } from '@/components/public-shell';
import { signOut } from '@/lib/actions';
import { currentUser, db } from '@/lib/supabase';

export default async function Suspended() {
  const user = await currentUser();
  if (!user) redirect('/login');
  const client = await db();
  const { data } = await client!.from('users').select('is_suspended').eq('id', user.id).maybeSingle();
  if (!data?.is_suspended) redirect('/dashboard');
  return <><PublicHeader/><main className="auth-page"><section className="auth-card"><span className="eyebrow">Account status</span><h1>Account unavailable.</h1><p>This account cannot access FIRSTWAVE right now.</p><form action={signOut}><button className="button light">Sign out</button></form></section></main></>;
}
