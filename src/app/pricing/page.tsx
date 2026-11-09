import Link from 'next/link';
import { PublicHeader, Footer } from '@/components/public-shell';

export default function Pricing() {
  return <>
    <PublicHeader dark/>
    <main>
      <div className="public-hero"><div className="container public-hero-inner"><div><span className="eyebrow">Pricing</span><h1>Start with the <em>product.</em></h1><p>FIRSTWAVE is in early access. Future paid plans and their terms will be announced before any charges apply.</p></div><div className="public-hero-aside"><span>Current status</span><strong>Pricing is not announced yet.</strong><p>We will publish clear plan details before introducing paid access.</p></div></div></div>
      <section className="section"><div className="container pricing-wrap"><div className="pricing-card"><span className="pill">Early access</span><h2>A place to validate what you build.</h2><p>Prepare a beta test for your product and discover how makers and testers can work together.</p><ul><li>Campaign briefs and tester requirements</li><li>Application review and selection</li><li>Structured feedback and progress tracking</li></ul><Link className="button" href="/signup">Create an account →</Link></div><div className="pricing-note"><span className="eyebrow">Clear expectations</span><h3>Clear terms before paid access.</h3><p>Plan details will be published before paid access is introduced.</p><Link className="small-link" href="/developers">See what makers can do →</Link></div></div></section>
      <section className="section soft"><div className="container"><div className="section-heading"><div><span className="eyebrow">Questions</span><h2>Before the platform opens.</h2></div></div><div className="faq-list"><details><summary>Can I start a beta campaign?</summary><p>Once your account is ready, you can prepare a campaign draft. Publishing follows moderation approval.</p></details><details><summary>When are testers selected?</summary><p>After a campaign is published, the maker reviews applications and selects testers within its recruitment capacity.</p></details><details><summary>Will there be paid plans?</summary><p>Any future paid plans will be announced with their terms before charges apply.</p></details></div></div></section>
    </main>
    <Footer/>
  </>;
}
