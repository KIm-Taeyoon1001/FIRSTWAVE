import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { projectBySlug } from '@/lib/data';
import { db, currentUser } from '@/lib/supabase';
import { applyToProject, reportProject } from '@/lib/actions';
import { PublicHeader, Footer } from '@/components/public-shell';

type MakerProfile = { display_name: string; bio: string; avatar_url: string | null };

export default async function ProjectDetail({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ message?: string }>;
}) {
  const { slug } = await params;
  const { message } = await searchParams;
  const project = await projectBySlug(slug);
  if (!project) notFound();
  const client = await db();
  const user = await currentUser();
  const [spotsResult, applicationResult, makerResult] = await Promise.all([
    client ? client.rpc('project_spots', { p_project: project.id }) : Promise.resolve({ data: project.capacity }),
    client && user ? client.from('applications').select('status').eq('project_id', project.id).eq('tester_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
    client ? client.from('public_maker_profiles').select('display_name,bio,avatar_url').eq('user_id', project.maker_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const maker = makerResult.data as MakerProfile | null;
  const application = applicationResult.data;
  const spots = project.status === 'published' && typeof spotsResult.data === 'number' ? spotsResult.data : 0;
  const deadlinePassed = Boolean(project.deadline && project.deadline < new Date().toISOString().slice(0, 10));
  const closed = project.status !== 'published' || deadlinePassed || spots === 0;

  return <>
    <PublicHeader/>
    <main className="container">
      <div style={{ paddingTop: 28 }}><Link className="small-link" href="/explore"><ArrowLeft size={14} style={{ display: 'inline' }}/> Back to Explore</Link></div>
      {message && <div className="message" role="status">{message}</div>}
      <div className="detail-layout">
        <article>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <div className="project-logo" style={{ width: 68, height: 68, fontSize: 29 }}>{project.logo_url ? <img src={project.logo_url} alt=""/> : project.name[0]}</div>
            <div><span className="pill">{project.category}</span><h1 style={{ fontSize: 43, margin: '7px 0 0' }}>{project.name}</h1></div>
          </div>
          <p style={{ fontSize: 19, color: 'var(--muted)', marginTop: 17 }}>{project.tagline}</p>
          <div className="project-meta"><span>{project.platform}</span><span>{closed ? 'Applications closed' : 'Recruiting testers'}</span></div>
          {project.screenshots?.length > 0 && <section className="detail-section"><h2>Product preview</h2><div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>{project.screenshots.map((url, index) => <img key={url} src={url} alt={`${project.name} screenshot ${index + 1}`} style={{ maxWidth: 300, borderRadius: 9, border: '1px solid var(--line)' }}/>)}</div></section>}
          <section className="detail-section"><h2>About the product</h2><p style={{ whiteSpace: 'pre-wrap' }}>{project.description}</p>{project.product_url && <a className="small-link" href={project.product_url} target="_blank" rel="noopener noreferrer">Visit product <ExternalLink size={13} style={{ display: 'inline' }}/></a>}</section>
          {maker && <section className="detail-section"><h2>Built by</h2><div style={{ display: 'flex', gap: 13, alignItems: 'center' }}><div className="project-logo" style={{ width: 44, height: 44, fontSize: 17 }}>{maker.avatar_url ? <img src={maker.avatar_url} alt=""/> : (maker.display_name || 'M').slice(0, 1).toUpperCase()}</div><div><strong>{maker.display_name || 'FIRSTWAVE maker'}</strong>{maker.bio && <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{maker.bio}</p>}</div></div></section>}
          {([['Ideal tester', project.requirements], ['Testing instructions', project.instructions], ['Expected feedback', project.expected_feedback], ['Rewards', project.reward]] as const).filter(([, body]) => body).map(([title, body]) => <section className="detail-section" key={title}><h2>{title}</h2><p style={{ whiteSpace: 'pre-wrap' }}>{body}</p></section>)}
          {user && user.id !== project.maker_id && <section className="detail-section"><h2>Report this project</h2><form action={reportProject} className="form-stack"><input type="hidden" name="project_id" value={project.id}/><input type="hidden" name="slug" value={slug}/><label>Reason<input className="field" name="reason" required minLength={5} maxLength={150}/></label><label>Details<textarea name="details" maxLength={2000}/></label><button className="button light" style={{ justifySelf: 'start' }}>Submit report</button></form></section>}
        </article>
        <aside className="detail-aside">
          <span className={closed ? 'status paused' : 'pill'}>{closed ? 'Applications closed' : 'Open for applications'}</span>
          <h2 style={{ fontSize: 23, margin: '15px 0' }}>Join this beta test</h2>
          <dl><dt>Platform</dt><dd>{project.platform}</dd><dt>Available positions</dt><dd>{spots}</dd><dt>Apply by</dt><dd>{project.deadline || 'Open deadline'}</dd></dl>
          {application ? <div className="message">Your application is {application.status}.</div>
            : user?.id === project.maker_id ? <Link className="button" href={`/dashboard/projects/${project.id}`}>Manage project</Link>
            : closed ? <p>{spots === 0 && project.status === 'published' && !deadlinePassed ? 'Recruitment is full.' : 'This campaign is not accepting applications.'}</p>
            : user ? <form action={applyToProject} className="form-stack"><input type="hidden" name="project_id" value={project.id}/><input type="hidden" name="slug" value={slug}/><label>Why do you want to test?<textarea name="message" required minLength={10} maxLength={3000} placeholder="Share your interest and how you can help"/></label><label>Relevant experience<input className="field" name="experience" placeholder="Optional"/></label><label>Devices and platform<input className="field" name="device_info" placeholder="e.g. Windows 11, Chrome"/></label><button className="button">Apply to test</button></form>
            : <Link className="button" href="/login">Sign in to apply</Link>}
        </aside>
      </div>
    </main>
    <Footer/>
  </>;
}
