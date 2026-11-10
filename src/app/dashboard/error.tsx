'use client';

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="empty" role="alert"><h1>Workspace could not load.</h1><p>Try loading this page again.</p><button className="button" onClick={reset}>Try again</button></div>;
}
