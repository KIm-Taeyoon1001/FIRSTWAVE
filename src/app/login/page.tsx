import { redirect } from 'next/navigation';
import { PublicHeader } from '@/components/public-shell';
import { AuthForm } from '@/components/auth-form';
import { currentUser } from '@/lib/supabase';

export default async function Login({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  if (await currentUser()) redirect('/dashboard');
  const { message } = await searchParams;
  return <><PublicHeader/><AuthForm mode="login" message={message}/></>;
}
