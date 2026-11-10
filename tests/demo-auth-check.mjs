import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const code = await readFile(new URL('../site/demo-auth.js', import.meta.url), 'utf8');

function visit(path, signedIn) {
  const session = new Map(signedIn ? [['firstwave-demo-session', 'active']] : []);
  const guestLinks = [{ removed: false, remove() { this.removed = true; } }];
  const actions = { markup: '', querySelectorAll: () => guestLinks, insertAdjacentHTML: (_, html) => { actions.markup = html; } };
  const mobile = { markup: '', querySelectorAll: () => guestLinks, insertAdjacentHTML: (_, html) => { mobile.markup = html; } };
  const header = { querySelector: selector => selector.includes('mobile-nav') ? mobile : actions };
  const cta = { href: '/login/', setAttribute: (_, value) => { cta.href = value; } };
  let signOut, destination = '';
  const buttons = [{ addEventListener: (_, handler) => { signOut = handler; } }];
  runInNewContext(code, {
    sessionStorage: { getItem: key => session.get(key) ?? null, removeItem: key => session.delete(key) },
    document: { querySelector: () => header, querySelectorAll: selector => selector === '[data-demo-signout]' ? buttons : [cta] },
    window: { location: { pathname: path, assign: value => { destination = value; }, replace: value => { destination = value; } } },
  });
  return { session, guestLinks, actions, mobile, cta, signOut, destination: () => destination };
}

const guest = visit('/explore/', false);
if (guest.guestLinks[0].removed || guest.actions.markup || guest.cta.href !== '/login/') throw new Error('Guest navigation was changed');
const active = visit('/explore/', true);
if (!active.guestLinks[0].removed || !active.actions.markup.includes('Demo signed in') || !active.actions.markup.includes('/dashboard/')) throw new Error('Signed-in header was not shown');
if (!active.mobile.markup.includes('Demo signed in') || active.cta.href !== '/dashboard/') throw new Error('Signed-in mobile navigation or CTA was not updated');
active.signOut();
if (active.session.has('firstwave-demo-session') || active.destination() !== '/') throw new Error('Sign out did not clear the demo session');
if (visit('/login/', true).destination() !== '/dashboard/') throw new Error('Signed-in user was left on the login page');
console.log('Demo auth navigation OK: guest, signed in, mobile, sign out and login redirect');
