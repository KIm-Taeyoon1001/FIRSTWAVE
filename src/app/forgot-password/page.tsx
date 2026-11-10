import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { PublicHeader } from '@/components/public-shell';
import { requestPasswordReset } from '@/lib/actions';
import { configured } from '@/lib/supabase';

export default async function ForgotPassword({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return <><PublicHeader/><main className="auth-page"><section className="auth-card" aria-labelledby="forgot-title">
    <span className="eyebrow">Account recovery</span><h1 id="forgot-title">Reset your password.</h1>
    <p>Enter your account email. If it exists, we will send a reset link.</p>
    {message && <div className="message" role="status">{message}</div>}
    {!configured && <div className="auth-pending"><LockKeyhole size={17}/>Account access is not configured yet.</div>}
    <form action={requestPasswordReset} className="form-stack auth-fields"><label>Email address<input className="field" type="email" name="email" autoComplete="email" required disabled={!configured} placeholder="you@example.com"/></label><button className="button" disabled={!configured}>Send reset link <ArrowRight size={16}/></button></form>
    <p className="auth-switch"><Link className="small-link" href="/login">Back to log in</Link></p>
  </section></main></>;
}
