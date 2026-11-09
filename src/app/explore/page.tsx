import Link from 'next/link';
import { Search } from 'lucide-react';
import { publicProjects } from '@/lib/data';
import { ProjectCard } from '@/components/project-card';
import { PublicHeader, Footer } from '@/components/public-shell';
export default async function Explore({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; platform?: string; recruitment?: string; page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageUrl = (number: number) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q',params.q);
    if (params.category) query.set('category',params.category);
    if (params.platform) query.set('platform',params.platform);
    if (params.recruitment) query.set('recruitment',params.recruitment);
    query.set('page',String(number));
    return `/explore?${query}`;
  };
  const { projects, count } = await publicProjects({ q: params.q, category: params.category, platform: params.platform, recruitment: params.recruitment, page });
  return <><PublicHeader/><div className="page-head"><div className="container"><span className="eyebrow">Explore projects</span><h1>Discover what is being built.</h1><p>Find ambitious early products, apply to test, and help shape what comes next.</p></div></div><main className="container" style={{paddingTop:20,paddingBottom:90}}><form className="filter-form" action="/explore"><input className="field" name="q" aria-label="Search projects" placeholder="Search projects or keywords" defaultValue={params.q || ''}/><select name="category" aria-label="Category" defaultValue={params.category || ''}><option value="">All categories</option>{['Productivity','Developer Tools','Design','Education','Finance','Other'].map(v=><option key={v}>{v}</option>)}</select><select name="platform" aria-label="Platform" defaultValue={params.platform || ''}><option value="">All platforms</option>{['Web','iOS','Android','Desktop','API'].map(v=><option key={v}>{v}</option>)}</select><select name="recruitment" aria-label="Recruitment" defaultValue={params.recruitment||''}><option value="">Any status</option><option value="open">Open</option><option value="closed">Deadline passed</option></select><button className="button"><Search size={15}/>Search</button></form><p style={{fontSize:12,color:'#68776d',marginBottom:18}}>{count} published {count === 1 ? 'campaign' : 'campaigns'} · Newest first</p>{projects.length ? <div className="project-grid">{projects.map(p=><ProjectCard key={p.id} project={p}/>)}</div> : <div className="empty"><Search size={30} style={{margin:'0 auto 12px',color:'#16a36a'}}/><h3>No campaigns found</h3><p>Try another keyword or filter. New campaigns will appear here after approval.</p><Link className="button light" href="/explore">Clear filters</Link></div>}{count > 12 && <div className="pagination">{page > 1 && <Link className="button light" href={pageUrl(page-1)}>Previous</Link>}{page * 12 < count && <Link className="button light" href={pageUrl(page+1)}>Next</Link>}</div>}</main><Footer/></>;
}
