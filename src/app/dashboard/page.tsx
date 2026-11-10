import Link from 'next/link';
import { db, currentUser } from '@/lib/supabase';
import { recommendedProjects } from '@/lib/data';
import { ProjectCard } from '@/components/project-card';
export default async function Dashboard() {
  const client = await db(); const user = await currentUser(); const uid = user!.id;
  const { data: profile } = await client!.from('profiles').select('tester_interests').eq('user_id',uid).single();
  const [projects, applications, selected, completed, feedback, testerApplications, recommended] = await Promise.all([
    client!.from('projects').select('id,name,status,capacity,created_at').eq('maker_id',uid).order('created_at',{ascending:false}),
    client!.from('applications').select('id,project_id,status,created_at,projects!inner(maker_id)').eq('projects.maker_id',uid),
    client!.from('project_members').select('project_id,projects!inner(maker_id)').eq('projects.maker_id',uid),
    client!.from('applications').select('id,projects!inner(maker_id)',{count:'exact',head:true}).eq('projects.maker_id',uid).eq('status','completed'),
    client!.from('feedbacks').select('id,project_id,projects!inner(maker_id)').eq('projects.maker_id',uid),
    client!.from('applications').select('id,status,created_at,projects(name,slug)').eq('tester_id',uid).order('created_at',{ascending:false}).limit(5),
    recommendedProjects(uid,(profile?.tester_interests || []) as string[])
  ]);
  const ps=projects.data||[], apps=applications.data||[], sels=selected.data||[], fbs=feedback.data||[], suggested=recommended.slice(0,3);
  return <>
    <div className="workspace-heading"><div><span className="eyebrow">WORKSPACE / OVERVIEW</span><h1>Overview</h1><p className="sub">Projects and testing activity in one place.</p></div><Link className="button" href="/dashboard/projects/new">New project</Link></div>
    <div className="workspace-overview">
      <div className="workspace-overview-main">
        <section className="panel"><div className="workspace-panel-heading"><div><span className="workspace-kicker">YOUR WORK</span><h2>Recent projects</h2></div><Link className="small-link" href="/dashboard/projects">View all projects</Link></div>
          {ps.length ? <div className="table-wrap"><table><thead><tr><th>Project</th><th>Status</th><th>Applications</th><th>Selected / capacity</th></tr></thead><tbody>{ps.slice(0,5).map(p=><tr key={p.id}><td><Link className="small-link" href={`/dashboard/projects/${p.id}`}>{p.name}</Link></td><td><span className={`status ${p.status}`}>{p.status.replace('_',' ')}</span></td><td>{apps.filter(a=>a.project_id===p.id).length}</td><td>{sels.filter(s=>s.project_id===p.id).length} / {p.capacity}</td></tr>)}</tbody></table></div> : <div className="empty"><h3>No projects yet</h3><p>Create your first campaign to start recruiting testers.</p><Link className="button" href="/dashboard/projects/new">Create project</Link></div>}
        </section>
        <section className="panel"><div className="workspace-panel-heading"><div><span className="workspace-kicker">TESTING</span><h2>Your tester activity</h2></div><Link className="small-link" href="/dashboard/applications">Applications</Link></div>
          {testerApplications.data?.length ? <div className="table-wrap"><table><thead><tr><th>Project</th><th>Status</th><th>Applied</th></tr></thead><tbody>{testerApplications.data.map(a=><tr key={a.id}><td>{(a.projects as unknown as {name:string}|null)?.name || 'Project'}</td><td><span className={`status ${a.status}`}>{a.status}</span></td><td>{new Date(a.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <div className="empty"><h3>No applications yet</h3><p>Find products to test and share your perspective.</p><Link className="button" href="/explore">Explore projects</Link></div>}
        </section>
        <section className="panel"><div className="workspace-panel-heading"><div><span className="workspace-kicker">DISCOVER</span><h2>Products to test</h2></div><Link className="small-link" href="/explore">Explore all</Link></div>{suggested.length ? <div className="project-grid">{suggested.map(p=><ProjectCard key={p.id} project={p}/>)}</div> : <div className="empty"><h3>No projects to recommend yet</h3><p>New projects from other makers will appear here after moderation.</p></div>}</section>
      </div>
      <aside className="workspace-overview-aside"><section className="panel"><span className="workspace-kicker">CAMPAIGN STATUS</span><h2>At a glance</h2>{[['Total projects',ps.length],['Active campaigns',ps.filter(p=>p.status==='published').length],['Applications',apps.length],['Selected testers',sels.length],['Completed tests',completed.count||0],['Feedback received',fbs.length]].map(([label,n])=><div className="workspace-stat-line" key={label}><span>{label}</span><strong>{n}</strong></div>)}</section><section className="panel"><span className="workspace-kicker">NEXT STEPS</span><h2>Get started</h2><p>Write a clear campaign brief, set your tester requirements, and prepare questions before review.</p><Link className="small-link" href="/dashboard/projects/new">Create a project</Link></section></aside>
    </div>
  </>;
}