(() => {
  const state = document.getElementById('community-state');
  const formWrap = document.getElementById('community-compose-form');
  const list = document.getElementById('community-posts');
  const errorBox = document.getElementById('community-error');
  const topics = { showcase: 'Product showcase', question: 'Question', testing: 'Testing help', discussion: 'Discussion' };
  const esc = value => String(value ?? '');
  const node = (tag, text, className) => { const element = document.createElement(tag); element.textContent = text; if (className) element.className = className; return element; };
  async function start() {
    const auth = window.FIRSTWAVE_BROWSER_AUTH;
    if (!auth?.configured) { state.textContent = 'Community sign-in is not configured yet. Add the Supabase publishable key to enable shared posts.'; return; }
    try {
      const user = await auth.currentUser();
      if (!user) { state.replaceChildren(document.createTextNode('Sign in to join the shared FIRSTWAVE community. ')); const link = node('a', 'Log in'); link.href = '/login/'; state.append(link); return; }
      state.textContent = 'Signed in as ' + (user.email || 'FIRSTWAVE member');
      formWrap.hidden = false;
      await loadPosts();
    } catch (error) { state.textContent = error.message || 'Could not connect to the community.'; }
  }
  async function loadPosts() {
    const client = await window.FIRSTWAVE_BROWSER_AUTH.getClient();
    const { data: posts, error } = await client.from('community_posts').select('id,author_id,author_perspective,topic,title,body,created_at').order('created_at', { ascending: false }).limit(30);
    if (error) throw error;
    list.replaceChildren();
    if (!posts?.length) { list.append(node('div', 'No conversations yet. Start the first one.', 'empty')); return; }
    const ids = [...new Set(posts.map(post => post.author_id))];
    const { data: profiles } = await client.from('profiles').select('user_id,display_name').in('user_id', ids);
    const names = new Map((profiles || []).map(profile => [profile.user_id, profile.display_name || 'FIRSTWAVE member']));
    for (const post of posts) {
      const article = node('article', '', 'community-post');
      const meta = node('div', '', 'community-post-meta');
      meta.append(node('span', topics[post.topic] || 'Discussion', 'community-topic ' + post.topic));
      meta.append(node('span', post.author_perspective === 'maker' ? 'Maker' : post.author_perspective === 'tester' ? 'Beta tester' : 'Maker + tester', 'community-perspective'));
      meta.append(node('span', names.get(post.author_id) || 'FIRSTWAVE member'));
      meta.append(node('time', new Date(post.created_at).toLocaleDateString()));
      const title = node('h3', post.title);
      const body = node('p', post.body, 'community-post-body');
      const replies = node('section', '', 'community-replies');
      replies.append(node('strong', 'Replies', 'community-reply-heading'));
      const { data: items, error: replyError } = await client.from('community_replies').select('id,author_id,body,created_at').eq('post_id', post.id).order('created_at').limit(40);
      if (replyError) throw replyError;
      if (items?.length) {
        const replyIds = [...new Set(items.map(reply => reply.author_id))];
        const { data: replyUsers } = await client.from('profiles').select('user_id,display_name').in('user_id', replyIds);
        const replyNames = new Map((replyUsers || []).map(profile => [profile.user_id, profile.display_name || 'FIRSTWAVE member']));
        for (const item of items) { const reply = node('div', '', 'community-reply'); reply.append(node('b', replyNames.get(item.author_id) || 'FIRSTWAVE member')); reply.append(node('p', item.body)); replies.append(reply); }
      }
      const replyForm = document.createElement('form'); replyForm.className = 'community-reply-form';
      const input = document.createElement('input'); input.className = 'field'; input.name = 'body'; input.required = true; input.minLength = 2; input.maxLength = 3000; input.placeholder = 'Write a helpful reply';
      const replyButton = node('button', 'Reply', 'button light'); replyButton.type = 'submit';
      replyForm.append(input, replyButton);
      replyForm.addEventListener('submit', async event => { event.preventDefault(); replyButton.disabled = true; try { const { error } = await client.from('community_replies').insert({ post_id: post.id, author_id: window.communityUser.id, body: input.value.trim() }); if (error) throw error; await loadPosts(); } catch (error) { window.alert(error.message); replyButton.disabled = false; } });
      replies.append(replyForm); article.append(meta, title, body, replies); list.append(article);
    }
  }
  document.getElementById('community-post-form').addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget; const button = form.querySelector('button'); button.disabled = true; errorBox.hidden = true;
    try { const client = await window.FIRSTWAVE_BROWSER_AUTH.getClient(); const values = Object.fromEntries(new FormData(form)); const { error } = await client.from('community_posts').insert({ ...values, author_id: window.communityUser.id }); if (error) throw error; form.reset(); await loadPosts(); }
    catch (error) { errorBox.textContent = error.message || 'Could not publish your post.'; errorBox.hidden = false; }
    finally { button.disabled = false; }
  });
  window.FIRSTWAVE_BROWSER_AUTH?.currentUser().then(user => { window.communityUser = user; start(); }).catch(start);
})();
