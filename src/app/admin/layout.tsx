import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db, currentUser } from '@/lib/supabase';
import { Brand } from '@/components/public-shell';
export default async function AdminLayout({children}:{children:React.ReactNode}) { const client=await db(),user=await currentUser(); if(!client||!user)redirect('/login'); const {data}=await client.from('users').select('is_admin,is_suspended').eq('id',user.id).single();if(!data?.is_admin||data.is_suspended)redirect('/dashboard');return <div className="dash"><aside className="dash-side"><Brand/><nav><Link href="/admin">Overview</Link><Link href="/admin/projects">Project moderation</Link><Link href="/admin/users">Users</Link><Link href="/admin/reports">Reports</Link><Link href="/dashboard">Back to workspace</Link></nav></aside><main className="dash-content">{children}</main></div>; }
