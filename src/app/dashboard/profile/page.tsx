import { db, currentUser } from '@/lib/supabase';
import { saveProfile } from '@/lib/actions';

const categories = ['Productivity','Developer Tools','Design','Education','Finance','Other'];

export default async function Profile({searchParams}:{searchParams:Promise<{message?:string}>}) {
  const { message } = await searchParams;
  const client = await db(), user = await currentUser();
  const { data } = await client!.from('profiles').select('display_name,bio,devices,tester_interests').eq('user_id',user!.id).single();
  const interests = new Set((data?.tester_interests || []) as string[]);
  return <>
    <span className="eyebrow">Account</span><h1>Profile</h1>
    <p className="sub">Your identity across maker and tester activities. Interests help shape project recommendations.</p>
    {message && <div className="message">{message}</div>}
    <div className="panel" style={{maxWidth:700}}>
      <form action={saveProfile} className="form-stack">
        <label>Display name<input className="field" name="display_name" required minLength={2} maxLength={80} defaultValue={data?.display_name || ''}/></label>
        <label>Bio<textarea name="bio" maxLength={1000} defaultValue={data?.bio || ''} placeholder="Tell makers what you enjoy building or testing."/></label>
        <label>Devices and platforms<input className="field" name="devices" maxLength={300} defaultValue={data?.devices || ''} placeholder="e.g. Windows 11, Chrome, iPhone"/></label>
        <fieldset style={{border:0,padding:0,margin:0}}><legend style={{fontSize:12,fontWeight:700,marginBottom:10}}>Testing interests</legend>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{categories.map(category => <label key={category} style={{display:'inline-flex',alignItems:'center',gap:7,padding:'9px 11px',border:'1px solid var(--line)',borderRadius:8,fontSize:12,fontWeight:600}}><input type="checkbox" name="tester_interests" value={category} defaultChecked={interests.has(category)}/>{category}</label>)}</div>
        </fieldset>
        <button className="button" style={{width:'auto',justifySelf:'start'}}>Save profile</button>
      </form>
    </div>
  </>;
}
