import Link from 'next/link';
import { ArrowRight, ChartNoAxesCombined, ClipboardList, MessageSquareText, Users } from 'lucide-react';
import { PublicHeader, Footer } from '@/components/public-shell';

const features = [
  { title: 'Campaign briefs', text: 'Set product details, tester requirements, recruitment limits, and testing instructions.', icon: ClipboardList },
  { title: 'Application review', text: 'Read a tester’s experience and device details before selecting them.', icon: Users },
  { title: 'Structured feedback', text: 'Ask custom questions and collect ratings, issues, ideas, and comments.', icon: MessageSquareText },
  { title: 'Progress at a glance', text: 'Track campaign status, applications, selected testers, and responses.', icon: ChartNoAxesCombined },
];

export default function Developers() {
  return <>
    <div className="developer-hero"><PublicHeader dark/><main className="container developer-hero-inner">
      <div><span className="eyebrow">Built for independent makers</span><h1>Ship with a little more <em>certainty.</em></h1><p>Recruit people who can test your product, organize what they find, and take the next step with better evidence.</p><div className="developer-hero-actions"><Link className="button" href="/dashboard/projects/new">Create a campaign <ArrowRight size={16}/></Link><Link className="button secondary" href="#workflow">See the workflow</Link></div></div>
      <div className="developer-visual" aria-label="Campaign setup design preview"><div className="developer-visual-top"><span>FIRSTWAVE / CAMPAIGN SETUP</span><span>DESIGN PREVIEW</span></div><div className="developer-visual-body"><span className="pill">Draft campaign</span><h3>Give your product a clear brief.</h3><div className="developer-form-line"><small>PRODUCT</small><div>Your product name and a short, specific pitch</div></div><div className="developer-form-line"><small>IDEAL TESTERS</small><div>People whose devices and experience fit your test</div></div><div className="developer-form-line"><small>WHAT TO LEARN</small><div>Questions about usability, bugs, and the overall experience</div></div><div className="developer-visual-foot"><span>Save your draft before review</span><b>Prepare campaign →</b></div></div></div>
    </main></div>
    <div className="container developer-rail"><article><span>01 / PREPARE</span><strong>Make the ask specific</strong><p>Explain the product, ideal tester, and desired feedback.</p></article><article><span>02 / SELECT</span><strong>Keep recruitment intentional</strong><p>Review applications and choose testers within capacity.</p></article><article><span>03 / LEARN</span><strong>See the product clearly</strong><p>Read structured responses alongside campaign progress.</p></article></div>
    <section className="developer-section" id="workflow"><div className="container"><div className="developer-section-heading"><span className="eyebrow">One workspace, three moments</span><h2>From campaign draft to product insight.</h2><p>FIRSTWAVE brings the practical steps of beta testing into a focused developer workflow.</p></div><div className="developer-capabilities">{features.map(({title,text,icon:Icon})=><article className="developer-capability" key={title}><div className="iconbox"><Icon size={21}/></div><b>{title}</b><p>{text}</p></article>)}</div></div></section>
    <section className="developer-section soft"><div className="container developer-strip"><div><span className="eyebrow">Designed for the way you build</span><h2>Less setup. More signal.</h2><p>Keep a clear record of what you asked testers to do and what they actually reported. Prepare a campaign, review applications, and learn from the responses.</p><Link className="button" href="/dashboard">Open your workspace <ArrowRight size={16}/></Link></div><div className="developer-checks"><div><b>1</b>Create a focused draft</div><div><b>2</b>Set your ideal tester profile</div><div><b>3</b>Prepare questions before recruitment</div><div><b>4</b>Review and improve after feedback</div></div></div></section>
    <Footer/>
  </>;
}
