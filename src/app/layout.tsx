import './globals.css';
import './polish.css';
import '../../scripts/marketing.css';
import './theme.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'FIRSTWAVE — Where Great Apps Meet Their Users', description: 'A developer-first marketplace for beta testing and product feedback.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: "try{const t=localStorage.getItem('firstwave-theme');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'dark';document.documentElement.style.colorScheme=document.documentElement.dataset.theme}catch{}" }}/></head><body>{children}</body></html>; }
