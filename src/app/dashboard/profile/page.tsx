import { db, currentUser } from '@/lib/supabase';
import { saveProfile } from '@/lib/actions';
import { redirect } from 'next/navigation';

const categories = ['Productivity','Developer Tools','Design','Education','Finance','Other'];

export default async function Profile({searchParams}:{searchParams:Promise<{message?:string}>}) {
  const { message } = await searchParams;
  const client = await db(), user = await currentUser();
  if (!client || !user) redirect('/login');
  const { data } = await client!.from('profiles').select('display_name,bio,devices,tester_interests').eq('user_id',user!.id).single();
  const interests = new Set((data?.tester_interests || []) as string[]);
  return <>
    <div className="workspace-heading"><div><span className="eyebrow">YOUR IDENTITY</span><h1>My profile</h1><p className="sub">Introduce yourself to makers and choose the products you want to test.</p></div></div>
    {message && <div className="message" role="status">{message}</div>}
    <div className="account-layout"><section className="panel account-main"><div className="account-section-heading"><div><span className="workspace-kicker">PUBLIC PROFILE</span><h2>Profile details</h2></div><span>Visible when you apply to test</span></div>
      <form action={saveProfile} className="form-stack account-form">
        <label>Display name<input className="field" name="display_name" required minLength={2} maxLength={80} defaultValue={data?.display_name || ''} autoComplete="nickname"/><small>Use the name you want other members to see.</small></label>
        <label>About you<textarea name="bio" maxLength={1000} defaultValue={data?.bio || ''} placeholder="What do you build, test, or care about?"/><small>A short introduction helps makers understand your perspective.</small></label>
        <label>Devices and platforms<input className="field" name="devices" maxLength={300} defaultValue={data?.devices || ''} placeholder="Windows 11 · Chrome · iPhone"/><small>List the devices you can use for beta testing.</small></label>
        <fieldset className="account-fieldset"><legend>Testing interests</legend><div className="account-interest-list">{categories.map(category => <label key={category} className="account-interest"><input type="checkbox" name="tester_interests" value={category} defaultChecked={interests.has(category)}/>{category}</label>)}</div><small>Interests help shape project recommendations.</small></fieldset>
        <button className="button account-save">Save profile</button>
      </form>
    </section><aside className="panel account-aside"><span className="workspace-kicker">ONE ACCOUNT</span><h2>Make and test</h2><p>Your profile works across both sides of FIRSTWAVE. Publish a project and apply to test another product with the same account.</p><div className="account-aside-line"><span>Account email</span><strong>{user.email || '—'}</strong></div></aside></div>
  </>;
}
