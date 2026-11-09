import { PublicHeader } from '@/components/public-shell';
import { AuthForm } from '@/components/auth-form';
export default async function Signup({searchParams}:{searchParams:Promise<{message?:string}>}) { const {message}=await searchParams; return <><PublicHeader/><AuthForm mode="signup" message={message}/></>; }
