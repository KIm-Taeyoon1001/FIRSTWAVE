import './globals.css';
import './polish.css';
import '../../scripts/marketing.css';
import './theme.css';
import type { Metadata } from 'next';
import { siteUrl } from '@/lib/site-url';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'FIRSTWAVE | Where Great Apps Meet Their Users', template: '%s | FIRSTWAVE' },
  description: 'Discover early-stage products, recruit beta testers, and collect feedback to build better apps.',
  openGraph: { type: 'website', siteName: 'FIRSTWAVE', title: 'FIRSTWAVE | Where Great Apps Meet Their Users', description: 'Discover early-stage products and connect with beta testers.' },
  twitter: { card: 'summary_large_image' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{const t=localStorage.getItem('firstwave-theme');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'dark';document.documentElement.style.colorScheme=document.documentElement.dataset.theme}catch{}" }}/></head><body>{children}</body></html>; }
