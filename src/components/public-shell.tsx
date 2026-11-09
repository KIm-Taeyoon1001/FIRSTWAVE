import Link from 'next/link';

export function Brand() {
  return <Link className="brand" href="/" aria-label="FIRSTWAVE home">
    <svg className="brand-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect width="48" height="48" rx="13" fill="#16A36A"/>
      <path d="M8 27.5c4.8 0 4.8-10 9.6-10s4.8 10 9.6 10 4.8-10 9.6-10" stroke="white" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 35c4.8 0 4.8-10 9.6-10s4.8 10 9.6 10 4.8-10 9.6-10" stroke="white" strokeOpacity=".43" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span className="brand-lockup"><strong>FIRST<span>WAVE</span></strong><small>BUILD · LAUNCH · LEARN</small></span>
  </Link>;
}

export function PublicHeader({ dark = false }: { dark?: boolean }) {
  return <header className={dark ? 'hero-shell' : ''}>
    <div className="container site-header">
      <Brand/>
      <nav className="nav-links" aria-label="Primary navigation" style={dark ? {} : {color:'#55675a'}}>
        <Link href="/explore">Explore</Link><Link href="/how-it-works">How It Works</Link><Link href="/developers">For Developers</Link><Link href="/pricing">Pricing</Link>
      </nav>
      <div className="nav-actions"><Link className="login-link" href="/login">Log In</Link><Link className="button small" href="/signup">Get Started</Link></div>
      <details className="mobile-nav"><summary aria-label="Open navigation"><span/><span/><span/></summary><nav aria-label="Mobile navigation"><Link href="/explore">Explore</Link><Link href="/how-it-works">How It Works</Link><Link href="/developers">For Developers</Link><Link href="/pricing">Pricing</Link><Link href="/login">Log In</Link></nav></details>
    </div>
  </header>;
}

export function Footer() {
  return <footer className="footer"><div className="container footer-inner"><div><Brand/><p>Where Great Apps Meet Their Users.</p><p>© {new Date().getFullYear()} FIRSTWAVE</p></div><div className="footer-links"><Link href="/explore">Explore</Link><Link href="/how-it-works">How It Works</Link><Link href="/developers">For Developers</Link><Link href="/pricing">Pricing</Link><Link href="/signup">Get Started</Link></div></div></footer>;
}
