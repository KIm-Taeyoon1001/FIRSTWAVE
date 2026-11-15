import Link from 'next/link';
import { FolderKanban, Search } from 'lucide-react';
import { db, currentUser } from '@/lib/supabase';

const statuses = ['draft', 'pending_review', 'published', 'paused', 'completed', 'rejected'] as const;
type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function MyProjects({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q || '').trim().slice(0, 100);
  const status = statuses.find(value => value === params.status);
  const client = await db();
  const user = await currentUser();
  let request = client!.from('projects')
    .select('id,name,tagline,status,capacity,created_at')
    .eq('maker_id', user!.id)
    .order('created_at', { ascending: false });
  if (query) request = request.ilike('name', `%${query.replace(/[,%()]/g, '')}%`);
  if (status) request = request.eq('status', status);
  const { data, error } = await request;

  return <>
    <div className="workspace-heading">
      <div><span className="eyebrow">WORKSPACE / PROJECTS</span><h1>My Projects</h1><p className="sub">Manage campaigns from first draft through final feedback.</p></div>
      <Link className="button" href="/dashboard/projects/new">+ New project</Link>
    </div>
    <section className="panel project-index" aria-labelledby="projects-heading">
      <div className="project-index-heading">
        <div><h2 id="projects-heading">Your campaigns</h2><p>{data?.length ?? 0} {data?.length === 1 ? 'project' : 'projects'}{query || status ? ' found' : ''}</p></div>
        <form className="project-index-filters" action="/dashboard/projects" role="search">
          <label className="sr-only" htmlFor="project-query">Search projects</label>
          <div className="project-search-field"><Search size={15} aria-hidden="true"/><input id="project-query" name="q" type="search" placeholder="Find a project" defaultValue={query} maxLength={100}/></div>
          <label className="sr-only" htmlFor="project-status">Filter by status</label>
          <select id="project-status" name="status" defaultValue={status || ''}><option value="">All statuses</option>{statuses.map(value => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select>
          <button className="button light" type="submit">Filter</button>
        </form>
      </div>
      {error ? <div className="empty" role="alert"><h3>Projects could not be loaded</h3><p>Refresh the page to try again.</p></div> : data?.length ? <div className="table-wrap"><table><thead><tr><th scope="col">Project</th><th scope="col">Status</th><th scope="col">Testers</th><th scope="col">Created</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>{data.map(project => <tr key={project.id}><td><Link className="project-name-link" href={`/dashboard/projects/${project.id}`}>{project.name}</Link><span className="project-tagline">{project.tagline}</span></td><td><span className={`status ${project.status}`}>{project.status.replace('_', ' ')}</span></td><td>{project.capacity} spots</td><td><time dateTime={project.created_at}>{new Date(project.created_at).toLocaleDateString()}</time></td><td><Link className="small-link" href={`/dashboard/projects/${project.id}`}>Open <span aria-hidden="true">→</span></Link></td></tr>)}</tbody></table></div> : query || status ? <div className="empty"><h3>No matching projects</h3><p>Try a different search or status filter.</p><Link className="small-link" href="/dashboard/projects">Clear filters</Link></div> : <div className="empty"><FolderKanban size={25} aria-hidden="true"/><h3>Your first campaign starts here</h3><p>Add your product and describe what you want to learn.</p><Link className="button" href="/dashboard/projects/new">Create project</Link></div>}
    </section>
  </>;
}
