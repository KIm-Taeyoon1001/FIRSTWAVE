import { MessageCircle, UsersRound } from 'lucide-react';
import { db } from '@/lib/supabase';
import { createCommunityPost, replyToCommunityPost } from '@/lib/actions';

const topics = { showcase: 'Product showcase', question: 'Question', testing: 'Testing help', discussion: 'Discussion' } as const;
export default async function Community({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const client = await db();
  const { data: posts, error } = await client!.from('community_posts').select('id,author_id,author_perspective,topic,title,body,created_at').order('created_at', { ascending: false }).limit(30);
  const postIds = (posts || []).map(post => post.id);
  const authorIds = [...new Set((posts || []).map(post => post.author_id))];
  const [{ data: profiles }, { data: replies }] = await Promise.all([
    authorIds.length ? client!.from('profiles').select('user_id,display_name').in('user_id', authorIds) : Promise.resolve({ data: [] }),
    postIds.length ? client!.from('community_replies').select('id,post_id,author_id,body,created_at').in('post_id', postIds).order('created_at') : Promise.resolve({ data: [] }),
  ]);
  const replyAuthors = [...new Set((replies || []).map(reply => reply.author_id))];
  const { data: replyProfiles } = replyAuthors.length ? await client!.from('profiles').select('user_id,display_name').in('user_id', replyAuthors) : { data: [] };
  const names = new Map([...(profiles || []), ...(replyProfiles || [])].map(profile => [profile.user_id, profile.display_name || 'FIRSTWAVE member']));
  const repliesByPost = new Map<string, typeof replies>();
  for (const reply of replies || []) repliesByPost.set(reply.post_id, [...(repliesByPost.get(reply.post_id) || []), reply]);

  return <>
    <div className="workspace-heading"><div><span className="eyebrow">MAKERS + TESTERS</span><h1>Community</h1><p className="sub">Share what you are building, ask for testing help, and learn from other members.</p></div></div>
    <div className="community-layout">
      <section className="panel community-compose" aria-labelledby="community-compose-title">
        <div className="community-welcome"><UsersRound size={19}/><div><strong>One community, two perspectives</strong><span>Makers and testers can both start conversations and reply.</span></div></div>
        {message && <p className="message" role="status">{message}</p>}
        <h2 id="community-compose-title">Start a conversation</h2>
        <form action={createCommunityPost} className="community-form">
          <div className="community-form-row"><label>Your perspective<select name="author_perspective" defaultValue="both"><option value="maker">Maker</option><option value="tester">Beta tester</option><option value="both">Both</option></select></label><label>Topic<select name="topic" defaultValue="question"><option value="showcase">Product showcase</option><option value="question">Question</option><option value="testing">Testing help</option><option value="discussion">Discussion</option></select></label></div>
          <label>Title<input className="field" name="title" minLength={5} maxLength={120} required placeholder="What would you like to discuss?"/></label>
          <label>Details<textarea name="body" minLength={20} maxLength={5000} required placeholder="Give the community enough context to respond."/></label>
          <button className="button" type="submit">Post to community</button>
        </form>
      </section>
      <section className="community-feed" aria-label="Community discussions">
        <div className="community-feed-heading"><div><span className="workspace-kicker">RECENT DISCUSSIONS</span><h2>From the community</h2></div><span>{posts?.length || 0} / 30</span></div>
        {error ? <div className="empty"><h3>Community could not load</h3><p>Try refreshing the page.</p></div> : posts?.length ? posts.map(post => <article className="panel community-post" key={post.id}>
          <div className="community-post-meta"><span className={`community-topic ${post.topic}`}>{topics[post.topic as keyof typeof topics]}</span><span className="community-perspective">{post.author_perspective === 'tester' ? 'Beta tester' : post.author_perspective === 'maker' ? 'Maker' : 'Maker + tester'}</span><span>{names.get(post.author_id) || 'FIRSTWAVE member'}</span><time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString()}</time></div>
          <h3>{post.title}</h3><p className="community-post-body">{post.body}</p>
          <div className="community-replies"><strong><MessageCircle size={14}/>{repliesByPost.get(post.id)?.length || 0} replies</strong>
            {(repliesByPost.get(post.id) || []).map(reply => <div className="community-reply" key={reply.id}><b>{names.get(reply.author_id) || 'FIRSTWAVE member'}</b><p>{reply.body}</p></div>)}
            <form action={replyToCommunityPost} className="community-reply-form"><input type="hidden" name="post_id" value={post.id}/><label className="sr-only" htmlFor={`reply-${post.id}`}>Reply to {post.title}</label><input className="field" id={`reply-${post.id}`} name="body" minLength={2} maxLength={3000} required placeholder="Write a helpful reply"/><button className="button light" type="submit">Reply</button></form>
          </div>
        </article>) : <div className="empty"><MessageCircle size={24}/><h3>Start the first conversation</h3><p>Share a product, ask for testing help, or start a discussion.</p></div>}
      </section>
    </div>
  </>;
}
