import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { PublicHeader } from '@/components/public-shell';
import { updatePassword } from '@/lib/actions';
import { currentUser } from '@/lib/supabase';

export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  if (!await currentUser()) redirect('/forgot-password?message=Open+the+link+from+your+reset+email');
  const { message } = await searchParams;
  return <><PublicHeader/><main className="auth-page"><section className="auth-card" aria-labelledby="reset-title">
    <span className="eyebrow">Account recovery</span><h1 id="reset-title">Choose a new password.</h1>
    <p>Use at least eight characters. Your new password will be active immediately.</p>
    {message && <div className="message" role="status">{message}</div>}
    <form action={updatePassword} className="form-stack auth-fields"><label>New password<input className="field" type="password" name="password" minLength={8} autoComplete="new-password" required/></label><label>Confirm password<input className="field" type="password" name="confirm_password" minLength={8} autoComplete="new-password" required/></label><button className="button">Update password <ArrowRight size={16}/></button></form>
    <p className="auth-switch"><Link className="small-link" href="/dashboard/settings">Back to settings</Link></p>
  </section></main></>;
}
