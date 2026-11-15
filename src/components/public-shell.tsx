import Link from 'next/link';
import { signOut } from '@/lib/actions';
import { currentUser } from '@/lib/supabase';

export function Brand() {
  return <Link className="brand" href="/" aria-label="FIRSTWAVE home">
    <svg className="brand-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="#173B29"/>
      <path d="M8 27.5h7l4-11 7 19 5-13 3 5h6" stroke="#39D98A" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="38" cy="27.5" r="2.2" fill="#E6FFF0"/>
    </svg>
    <span className="brand-lockup"><strong>FIRST<span>WAVE</span></strong><small>BUILD · LAUNCH · LEARN</small></span>
  </Link>;
}

export async function PublicHeader({ dark = false }: { dark?: boolean }) {
  const user = await currentUser();
  return <header className={dark ? 'hero-shell' : ''}>
    <div className="container site-header">
      <Brand/>
      <nav className="nav-links" aria-label="Primary navigation" style={dark ? {} : {color:'#55675a'}}>
        <Link href="/explore">Explore</Link><Link href="/how-it-works">How It Works</Link><Link href="/developers">For Developers</Link><Link href="/pricing">Pricing</Link>
      </nav>
      <div className="nav-actions">{user ? <><span className="auth-status" title={user.email}><span className="auth-status-dot"/>Signed in</span><Link className="button small" href="/dashboard">Workspace</Link><form action={signOut}><button className="auth-signout">Sign out</button></form></> : <><Link className="login-link" href="/login">Log In</Link><Link className="button small" href="/signup">Get Started</Link></>}</div>
      <details className="mobile-nav"><summary aria-label="Open navigation"><span/><span/><span/></summary><nav aria-label="Mobile navigation"><Link href="/explore">Explore</Link><Link href="/how-it-works">How It Works</Link><Link href="/developers">For Developers</Link><Link href="/pricing">Pricing</Link>{user ? <><span className="auth-status"><span className="auth-status-dot"/>Signed in</span><Link href="/dashboard">Workspace</Link><form action={signOut}><button className="auth-signout">Sign out</button></form></> : <><Link href="/login">Log In</Link><Link href="/signup">Get Started</Link></>}</nav></details>
    </div>
  </header>;
}

export function Footer() {
  return <footer className="footer"><div className="container footer-inner"><div><Brand/><p>Where Great Apps Meet Their Users.</p><p>© {new Date().getFullYear()} FIRSTWAVE</p></div><div className="footer-links"><Link href="/explore">Explore</Link><Link href="/how-it-works">How It Works</Link><Link href="/developers">For Developers</Link><Link href="/pricing">Pricing</Link><Link href="/signup">Get Started</Link></div></div></footer>;
}
