import './globals.css';
import './polish.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'FIRSTWAVE — Where Great Apps Meet Their Users', description: 'A developer-first marketplace for beta testing and product feedback.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
