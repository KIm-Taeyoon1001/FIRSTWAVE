import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../scripts/browser-auth.js', import.meta.url), 'utf8');
let loginHandler;
let loginCalls = 0;
let destination = '';
const form = {
  hidden: true,
  elements: { email: { value: ' user@example.com ' }, password: { value: 'correct-password' } },
  querySelectorAll: () => [{ disabled: false }],
  addEventListener: (name, handler) => { if (name === 'submit') loginHandler = handler; },
};
const message = { hidden: true, textContent: '', className: '' };
const nodes = { 'live-login': form, 'auth-message': message };
const client = { auth: {
  getUser: async () => ({ data: { user: null }, error: null }),
  signInWithPassword: async ({ email, password }) => {
    loginCalls++;
    if (email !== 'user@example.com' || password !== 'correct-password') throw new Error('Credentials were not passed to Supabase');
    return { data: { user: { id: 'user-1' } }, error: null };
  },
} };
const window = {
  FIRSTWAVE_AUTH_CONFIG: { url: 'https://example.supabase.co', publishableKey: 'sb_publishable_test' },
  supabase: { createClient: () => client },
  location: { pathname: '/login/', origin: 'https://firstwave.example', assign: path => { destination = path; }, replace: path => { destination = path; } },
};
const document = { getElementById: id => nodes[id] || null, querySelector: () => null };
runInNewContext(source, { window, document, URL, console });
if (!window.FIRSTWAVE_BROWSER_AUTH.configured || !loginHandler || form.hidden) throw new Error('Live login did not initialize');
await loginHandler({ preventDefault() {}, currentTarget: form });
if (loginCalls !== 1 || destination !== '/dashboard/') throw new Error('Live login did not authenticate and redirect');
console.log('Browser auth OK: configured login calls Supabase and opens workspace');
