export default function DashboardLoading() {
  return <div aria-busy="true" aria-label="Loading workspace">
    <div className="workspace-skeleton-line title"/><div className="workspace-skeleton-line subtitle"/>
    <div className="workspace-overview"><div className="workspace-overview-main"><div className="workspace-skeleton-panel"><div className="workspace-skeleton-line heading"/>{[1,2,3].map(item => <div className="workspace-skeleton-row" key={item}><div className="workspace-skeleton-mark"/><div className="workspace-skeleton-line row"/></div>)}</div></div><aside className="workspace-overview-aside"><div className="workspace-skeleton-panel"><div className="workspace-skeleton-line heading"/>{[1,2,3].map(item => <div className="workspace-skeleton-line row" key={item}/>)}</div></aside></div>
  </div>;
}
