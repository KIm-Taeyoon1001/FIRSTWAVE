import Link from 'next/link';
import { ArrowRight, MailCheck } from 'lucide-react';
import { PublicHeader } from '@/components/public-shell';
import { resendConfirmation } from '@/lib/actions';
import { configured } from '@/lib/supabase';

export default async function ResendConfirmation({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return <><PublicHeader/><main className="auth-page"><section className="auth-card" aria-labelledby="resend-title">
    <span className="eyebrow"><MailCheck size={14}/> Email confirmation</span>
    <h1 id="resend-title">Check your inbox.</h1>
    <p>Enter the address you used to sign up. We will send another confirmation link if your account is waiting for verification.</p>
    {message && <div className="message" role="status">{message}</div>}
    <form action={resendConfirmation} className="form-stack auth-fields"><label>Email address<input className="field" type="email" name="email" autoComplete="email" required disabled={!configured} placeholder="you@example.com"/></label><button className="button" disabled={!configured}>Resend confirmation <ArrowRight size={16}/></button></form>
    <p className="auth-switch"><Link className="small-link" href="/login">Back to log in</Link></p>
  </section></main></>;
}
