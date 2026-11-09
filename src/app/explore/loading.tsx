import { PublicHeader } from '@/components/public-shell';
export default function Loading() { return <><PublicHeader/><div className="page-head"><div className="container"><h1>Explore projects</h1></div></div><div className="container section"><div className="project-grid">{[1,2,3,4,5,6].map(i=><div className="project-card" key={i} style={{height:250,background:'#f5f8f6'}}/>)}</div></div></>; }
