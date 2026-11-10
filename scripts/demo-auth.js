const demoSessionKey = 'firstwave-demo-session';
let demoSignedIn = false;
try { demoSignedIn = sessionStorage.getItem(demoSessionKey) === 'active'; } catch { /* Storage may be unavailable. */ }

if (demoSignedIn) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/login' || path === '/signup') {
    window.location.replace('/dashboard/');
  } else {
    const header = document.querySelector('.hero-shell .site-header, header .site-header');
    const actions = header?.querySelector('.nav-actions, .public-actions, .demo-header-links');
    if (actions) {
      actions.querySelectorAll('a[href="/login/"], a[href="/signup/"]').forEach(link => link.remove());
      actions.insertAdjacentHTML('beforeend', '<span class="demo-auth-status"><span class="demo-auth-dot" aria-hidden="true"></span>Demo signed in</span><a class="button small" href="/dashboard/">Workspace</a><button class="demo-auth-signout" type="button" data-demo-signout>Sign out</button>');
    }
    const mobile = header?.querySelector('.mobile-nav nav');
    if (mobile) {
      mobile.querySelectorAll('a[href="/login/"], a[href="/signup/"]').forEach(link => link.remove());
      mobile.insertAdjacentHTML('beforeend', '<span class="demo-auth-status"><span class="demo-auth-dot" aria-hidden="true"></span>Demo signed in</span><a href="/dashboard/">Workspace</a><button type="button" data-demo-signout>Sign out</button>');
    }
    document.querySelectorAll('a[href="/login/"]').forEach(link => {
      link.setAttribute('href', '/dashboard/');
    });
    document.querySelectorAll('[data-demo-signout]').forEach(button => button.addEventListener('click', () => {
      try { sessionStorage.removeItem(demoSessionKey); } catch { /* Continue to the public page. */ }
      window.location.assign('/');
    }));
  }
}
