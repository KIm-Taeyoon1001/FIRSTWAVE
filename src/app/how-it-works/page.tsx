import Link from 'next/link';
import { PublicHeader, Footer } from '@/components/public-shell';

const makerSteps = [
  ['01 / DEFINE', 'Describe the product and testing goal', 'Add product details, platform, ideal tester profile, instructions, and the questions you want answered.'],
  ['02 / REVIEW', 'Choose testers who fit', 'Once a campaign is approved, review applications and select people within your recruitment capacity.'],
  ['03 / IMPROVE', 'Read responses in context', 'Use ratings, bug reports, feature ideas, and custom answers to decide what to improve next.'],
];
const testerSteps = [
  ['01', 'Discover', 'Read the product brief, requirements, testing period, and any offered reward.'],
  ['02', 'Participate', 'Apply and wait for a maker to select you before starting the assigned test.'],
  ['03', 'Respond', 'Submit structured feedback so the maker can understand what worked and what did not.'],
];

export default function HowItWorks() {
  return <>
    <PublicHeader dark/>
    <main>
      <div className="public-hero"><div className="container public-hero-inner"><div><span className="eyebrow">How FIRSTWAVE works</span><h1>From first look to <em>better launch.</em></h1><p>A focused process for sharing a product, selecting testers, and turning their experience into useful feedback.</p></div><div className="public-hero-aside"><span>One clear workflow</span><strong>Build. Launch. Test. Improve.</strong><p>Each step keeps the testing goal in view.</p></div></div></div>
      <section className="section"><div className="container"><div className="section-heading"><div><span className="eyebrow">For makers</span><h2>Make every test purposeful.</h2></div><p>Set expectations before recruiting, then review applications and responses in one workspace.</p></div><div className="process-steps">{makerSteps.map(([number,title,description])=><article key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></div></section>
      <section className="section soft"><div className="container"><div className="section-heading"><div><span className="eyebrow">For testers</span><h2>Be the perspective a product needs.</h2></div><p>Discover a campaign that fits, apply with context, follow the testing instructions, and share what you noticed.</p></div><div className="public-trio">{testerSteps.map(([number,title,description])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
      <section className="section"><div className="container"><div className="final-cta"><span className="eyebrow">Start exploring</span><h2>Find your place in the first wave.</h2><p style={{color:'#aebdb2'}}>Explore campaigns or prepare a product to share with early users.</p><Link className="button" href="/explore">Explore projects →</Link></div></div></section>
    </main>
    <Footer/>
  </>;
}
