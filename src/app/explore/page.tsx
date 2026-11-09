import Link from 'next/link';
import { Search } from 'lucide-react';
import { publicProjects } from '@/lib/data';
import { ProjectCard } from '@/components/project-card';
import { PublicHeader, Footer } from '@/components/public-shell';

type Filters = { q?: string; category?: string; platform?: string; recruitment?: string; sort?: string; page?: string };
const categories = ['Productivity','Developer Tools','Design','Education','Finance','Other'];
const platforms = ['Web','iOS','Android','Desktop','API'];

export default async function Explore({ searchParams }: { searchParams: Promise<Filters> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { projects, count } = await publicProjects({ ...params, page });
  const pageUrl = (number: number) => {
    const query = new URLSearchParams();
    for (const key of ['q','category','platform','recruitment','sort'] as const) if (params[key]) query.set(key,params[key]!);
    query.set('page',String(number));
    return `/explore?${query}`;
  };
  return <>
    <PublicHeader/>
    <div className="page-head"><div className="container"><span className="eyebrow">Explore projects</span><h1>Discover what is being built.</h1><p>Find ambitious early products, apply to test, and help shape what comes next.</p></div></div>
    <main className="container" style={{paddingTop:20,paddingBottom:90}}>
      <form className="filter-form" action="/explore">
        <input className="field" name="q" aria-label="Search projects" placeholder="Search projects or keywords" defaultValue={params.q || ''}/>
        <select name="category" aria-label="Category" defaultValue={params.category || ''}><option value="">All categories</option>{categories.map(value => <option key={value}>{value}</option>)}</select>
        <select name="platform" aria-label="Platform" defaultValue={params.platform || ''}><option value="">All platforms</option>{platforms.map(value => <option key={value}>{value}</option>)}</select>
        <select name="recruitment" aria-label="Recruitment" defaultValue={params.recruitment || ''}><option value="">Any status</option><option value="open">Open</option><option value="closed">Closed</option></select>
        <select name="sort" aria-label="Sort projects" defaultValue={params.sort || 'newest'}><option value="newest">Newest</option><option value="popular">Most applications</option></select>
        <button className="button"><Search size={15}/>Search</button>
      </form>
      <p style={{fontSize:12,color:'#68776d',marginBottom:18}}>{count} published {count === 1 ? 'campaign' : 'campaigns'} · {params.sort === 'popular' ? 'Sorted by real application count' : 'Newest first'}</p>
      {projects.length ? <div className="project-grid">{projects.map(project => <ProjectCard key={project.id} project={project}/>)}</div> :
        <div className="empty"><Search size={30} style={{margin:'0 auto 12px',color:'#16a36a'}}/><h3>No campaigns found</h3><p>Try another keyword or filter. New campaigns appear after approval.</p><Link className="button light" href="/explore">Clear filters</Link></div>}
      {count > 12 && <div className="pagination">{page > 1 && <Link className="button light" href={pageUrl(page-1)}>Previous</Link>}{page * 12 < count && <Link className="button light" href={pageUrl(page+1)}>Next</Link>}</div>}
    </main>
    <Footer/>
  </>;
}
