import { PublicHeader } from '@/components/public-shell';
import { AuthForm } from '@/components/auth-form';
export default async function Login({searchParams}:{searchParams:Promise<{message?:string}>}) { const {message}=await searchParams; return <><PublicHeader/><AuthForm mode="login" message={message}/></>; }
