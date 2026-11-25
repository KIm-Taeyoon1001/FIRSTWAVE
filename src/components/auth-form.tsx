import Link from 'next/link';
import { ArrowRight, Check, LockKeyhole, MailCheck, Sparkles } from 'lucide-react';
import { googleSignIn, signIn, signUp } from '@/lib/actions';
import { configured } from '@/lib/supabase';

const interests = ['Productivity','Developer Tools','Design','Education','Finance','Other'];

export function AuthForm({ mode, message }: { mode: 'login' | 'signup'; message?: string }) {
  const signup = mode === 'signup';
  return <main className="auth-page"><div className="auth-layout">
    <aside className="auth-story"><span className="auth-story-label"><Sparkles size={14}/> THE FIRSTWAVE WORKSPACE</span>
      <div><h2>Better products begin with <em>real people.</em></h2><p>Meet thoughtful testers, understand what they experience, and make your next release stronger.</p></div>
      <div className="auth-story-steps"><div><span>01</span> Share what you are building</div><div><span>02</span> Find the right early users</div><div><span>03</span> Turn feedback into progress</div></div>
      <small>BUILD · LAUNCH · TEST · IMPROVE</small></aside>
    <section className="auth-card" aria-labelledby="auth-title"><span className="eyebrow">{signup ? 'Join the first wave' : 'Welcome back'}</span>
      <h1 id="auth-title">{signup ? 'Create your account.' : 'Log in to FIRSTWAVE.'}</h1>
      <p>{signup ? 'One account for building products and testing the next big thing.' : 'Continue to your projects, applications, and feedback.'}</p>
      {message && <div className="message" role="status">{message}</div>}
      {!configured && <div className="auth-pending" role="status"><LockKeyhole size={17}/><span>Account access is coming soon. Sign in will be enabled when the service is connected.</span></div>}
      <form action={signup ? signUp : signIn} className="form-stack auth-fields">
        {signup && <label>Full name<input className="field" name="name" placeholder="Your name" required minLength={2} maxLength={80} autoComplete="name" disabled={!configured}/></label>}
        <label>Email address<input className="field" type="email" name="email" placeholder="you@example.com" required autoComplete="email" disabled={!configured}/>{signup && <span className="auth-field-hint">Use an inbox you can access to confirm your account.</span>}</label>
        <label>Password<input className="field" type="password" name="password" placeholder={signup ? 'At least 8 characters' : 'Enter your password'} required minLength={signup ? 8 : undefined} autoComplete={signup ? 'new-password' : 'current-password'} disabled={!configured}/>{signup && <span className="auth-field-hint">Use at least 8 characters.</span>}</label>
        {signup && <label>Confirm password<input className="field" type="password" name="confirm_password" placeholder="Enter your password again" required minLength={8} autoComplete="new-password" disabled={!configured}/></label>}
        {signup && <fieldset className="account-fieldset"><legend>What are you interested in?</legend><div className="account-interest-list">{interests.map(interest => <label className="account-interest" key={interest}><input type="checkbox" name="tester_interests" value={interest} disabled={!configured}/>{interest}</label>)}</div><small>Choose any that fit. You can change these later in your profile.</small></fieldset>}
        {signup && <label>Devices and platforms <span className="auth-field-hint">(optional)</span><input className="field" name="devices" maxLength={300} placeholder="Windows, macOS, iOS, Android…" disabled={!configured}/><span className="auth-field-hint">Helps makers understand which products you can test.</span></label>}
        {!signup && <Link className="small-link" href="/forgot-password" style={{justifySelf:'end'}}>Forgot password?</Link>}
        {signup && <p className="auth-note"><Check size={14}/> Use one account as both a maker and a tester.</p>}
        {signup && <div className="auth-confirmation"><MailCheck size={17}/><span><strong>Confirm by email</strong>We’ll send a link to verify your address before you get started.</span></div>}
        <button className="button" disabled={!configured}>{signup ? 'Create account' : 'Log in'}<ArrowRight size={16}/></button>
      </form>
      <div className="auth-divider"><span>or</span></div><form action={googleSignIn}><button className="button light auth-google" disabled={!configured}><GoogleMark/> Continue with Google</button></form>
      <p className="auth-switch">{signup ? 'Already have an account?' : 'New to FIRSTWAVE?'} <Link className="small-link" href={signup ? '/login' : '/signup'}>{signup ? 'Log in' : 'Create an account'}</Link></p>
      <p className="auth-resend"><Link href="/resend-confirmation">Did not receive a confirmation email?</Link></p>
    </section>
  </div></main>;
}

function GoogleMark() {
  return <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303A12 12 0 0 1 13.3 31.107l-6.59 5.11A20 20 0 0 0 44 24c0-1.34-.138-2.648-.389-3.917Z"/>
    <path fill="#34A853" d="M24 44c5.4 0 10.23-2.06 13.9-5.43l-6.42-5.43A12 12 0 0 1 13.3 31.107l-6.59 5.11A20 20 0 0 0 24 44Z"/>
    <path fill="#FBBC05" d="M13.3 31.107a12 12 0 0 1 0-14.214L6.71 11.783a20 20 0 0 0 0 24.434l6.59-5.11Z"/>
    <path fill="#EA4335" d="M24 8a11.9 11.9 0 0 1 8.45 3.3l5.96-5.96A19.9 19.9 0 0 0 24 4 20 20 0 0 0 6.71 11.783l6.59 5.11A12 12 0 0 1 24 8Z"/>
  </svg>;
}
