/* Supabase authentication for the static Cloudflare Pages build. */
(() => {
  const config = window.FIRSTWAVE_AUTH_CONFIG || {};
  const configured = Boolean(config.url && config.publishableKey);
  let clientPromise;
  function getClient() {
    if (!configured) return Promise.reject(new Error('Supabase public key is not configured.'));
    if (!clientPromise) clientPromise = new Promise((resolve, reject) => {
      if (window.supabase?.createClient) return resolve(window.supabase.createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }));
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = () => window.supabase?.createClient ? resolve(window.supabase.createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })) : reject(new Error('Authentication library did not load.'));
      script.onerror = () => reject(new Error('Authentication library could not load. Check your connection.'));
      document.head.appendChild(script);
    });
    return clientPromise;
  }
  async function currentUser() {
    const client = await getClient();
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    return data.user;
  }
  window.FIRSTWAVE_BROWSER_AUTH = { configured, getClient, currentUser };
  if (!configured) {
    for (const id of ['recover-form', 'reset-form']) {
      const form = document.getElementById(id);
      if (form) form.hidden = true;
    }
    return;
  }

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const show = (id) => { const element = document.getElementById(id); if (element) element.hidden = false; };
  const hide = (id) => { const element = document.getElementById(id); if (element) element.hidden = true; };
  const message = (value, error = true) => {
    const element = document.getElementById('auth-message');
    if (!element) return;
    element.textContent = value;
    element.className = error ? 'demo-error' : 'auth-success';
    element.hidden = false;
  };
  const busy = (form, value) => { form.querySelectorAll('button').forEach(button => { button.disabled = value; }); };
  const errorText = error => error?.message || 'Something went wrong. Please try again.';
  const destination = '/dashboard/';

  async function prepare() {
    if (path === '/login') { hide('demo-login'); hide('demo-credentials'); hide('demo-notice'); show('live-login'); show('google-login'); show('forgot-link'); }
    if (path === '/signup') { hide('signup-preview'); hide('demo-notice'); show('live-signup'); show('google-login'); }
    if (path === '/forgot-password' || path === '/reset-password') hide('unconfigured-message');
    try {
      const user = await currentUser();
      if (!user) return;
      if (path === '/login' || path === '/signup') { window.location.replace(destination); return; }
      const header = document.querySelector('.hero-shell .site-header, header .site-header');
      for (const actions of [header?.querySelector('.nav-actions, .public-actions, .demo-header-links'), header?.querySelector('.mobile-nav nav')]) {
        if (!actions) continue;
        actions.querySelectorAll('a[href="/login/"], a[href="/signup/"]').forEach(link => link.remove());
        const label = document.createElement('span'); label.className = 'demo-auth-status'; label.textContent = user.email || 'Signed in';
        const workspace = document.createElement('a'); workspace.href = destination; workspace.textContent = 'Workspace'; workspace.className = 'button small';
        const signout = document.createElement('button'); signout.type = 'button'; signout.className = 'demo-auth-signout'; signout.textContent = 'Sign out';
        signout.addEventListener('click', async () => { signout.disabled = true; try { const client = await getClient(); const { error } = await client.auth.signOut(); if (error) throw error; window.location.assign('/'); } catch (error) { signout.disabled = false; window.alert(errorText(error)); } });
        actions.append(label, workspace, signout);
      }
    } catch (error) { if (path === '/login' || path === '/signup') message(errorText(error)); }
  }

  document.getElementById('live-login')?.addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget; busy(form, true);
    try {
      const client = await getClient();
      const { data, error } = await client.auth.signInWithPassword({ email: form.elements.email.value.trim(), password: form.elements.password.value });
      if (error) throw error;
      if (!data.user) throw new Error('Unable to verify this account.');
      window.location.assign(destination);
    } catch (error) { message(errorText(error)); busy(form, false); }
  });
  document.getElementById('live-signup')?.addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget; busy(form, true);
    try {
      const client = await getClient();
      const { data, error } = await client.auth.signUp({ email: form.elements.email.value.trim(), password: form.elements.password.value, options: { data: { full_name: form.elements.full_name.value.trim() }, emailRedirectTo: new URL(destination, window.location.origin).href } });
      if (error) throw error;
      if (data.session) window.location.assign(destination);
      else message('Check your email to confirm your account, then log in.', false);
    } catch (error) { message(errorText(error)); } finally { busy(form, false); }
  });
  document.getElementById('google-login')?.addEventListener('click', async event => {
    const button = event.currentTarget; button.disabled = true;
    try { const client = await getClient(); const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: new URL(destination, window.location.origin).href } }); if (error) throw error; }
    catch (error) { message(errorText(error)); button.disabled = false; }
  });
  document.getElementById('recover-form')?.addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget; busy(form, true);
    try { const client = await getClient(); const { error } = await client.auth.resetPasswordForEmail(form.elements.email.value.trim(), { redirectTo: new URL('/reset-password/', window.location.origin).href }); if (error) throw error; message('If this email has an account, a reset link is on its way.', false); }
    catch (error) { message(errorText(error)); } finally { busy(form, false); }
  });
  document.getElementById('reset-form')?.addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget; busy(form, true);
    try { const client = await getClient(); const { data } = await client.auth.getSession(); if (!data.session) throw new Error('Open the password reset link from your email first.'); const { error } = await client.auth.updateUser({ password: form.elements.password.value }); if (error) throw error; message('Password updated. Opening your workspace…', false); window.setTimeout(() => window.location.assign(destination), 800); }
    catch (error) { message(errorText(error)); busy(form, false); }
  });
  prepare();
})();
