import Link from 'next/link';
import { ArrowRight, Check, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { googleSignIn, signIn, signUp } from '@/lib/actions';
import { configured } from '@/lib/supabase';

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
        <label>Email address<input className="field" type="email" name="email" placeholder="you@example.com" required autoComplete="email" disabled={!configured}/></label>
        <label>Password<input className="field" type="password" name="password" placeholder={signup ? 'At least 8 characters' : 'Enter your password'} required minLength={signup ? 8 : undefined} autoComplete={signup ? 'new-password' : 'current-password'} disabled={!configured}/></label>
        {!signup && <Link className="small-link" href="/forgot-password" style={{justifySelf:'end'}}>Forgot password?</Link>}
        {signup && <p className="auth-note"><Check size={14}/> Use one account as both a maker and a tester.</p>}
        <button className="button" disabled={!configured}>{signup ? 'Create account' : 'Log in'}<ArrowRight size={16}/></button>
      </form>
      <div className="auth-divider"><span>or</span></div><form action={googleSignIn}><button className="button light auth-google" disabled={!configured}><Mail size={16}/> Continue with Google</button></form>
      <p className="auth-switch">{signup ? 'Already have an account?' : 'New to FIRSTWAVE?'} <Link className="small-link" href={signup ? '/login' : '/signup'}>{signup ? 'Log in' : 'Create an account'}</Link></p>
    </section>
  </div></main>;
}
