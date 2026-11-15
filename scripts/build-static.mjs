import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { html } from './preview-server.mjs';
import { buildDemoPages } from './demo-site.mjs';
import { buildPublicPages } from './public-pages.mjs';
import { buildCommunityPage } from './community-page.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'site');
const localEnv = await readFile(resolve(root, '.env.local'), 'utf8').catch(() => '');
function publicEnv(name) {
  const direct = process.env[name];
  if (direct) return direct.trim();
  const line = localEnv.split(/\r?\n/).find(item => item.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim().replace(/^(["'])(.*)\1$/, '$2') : '';
}
const supabaseUrl = publicEnv('NEXT_PUBLIC_SUPABASE_URL') || 'https://xxytpyxnxaiwgzglsyel.supabase.co';
const publishableKey = publicEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') || publicEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
if (publishableKey) {
  let legacyRole = '';
  try { legacyRole = JSON.parse(Buffer.from(publishableKey.split('.')[1], 'base64url').toString()).role; } catch { /* Publishable keys are opaque. */ }
  if (!publishableKey.startsWith('sb_publishable_') && legacyRole !== 'anon') throw new Error('Only a Supabase publishable or legacy anon key may be written to the static site');
}
let page = html
  .replace('<title>FIRSTWAVE — Local design preview</title>', '<title>FIRSTWAVE — Where Great Apps Meet Their Users</title>')
  .replace(/<div class="preview-banner">[\s\S]*?<\/div>\s*/, '')
  .replaceAll('href="#setup"', 'href="#launch"')
  .replace('<a class="login-link" href="#launch">Log In</a>', '<a class="login-link" href="/login/">Log In</a>')
  .replace('<a class="button small" href="#launch">Get Started</a>', '<a class="button small" href="/login/">Try Demo</a>')
  .replace('>Pricing</a>', '>Early Access</a>')
  .replace('<a class="button" href="#developers">Submit Your App', '<a class="button" href="/login/">Submit Your App')
  .replace('>Become a Tester <span', '>For Testers <span')
  .replace('>Explore all projects →</a>', '>Early access details →</a>')
  .replace('Published beta campaigns will appear once a Supabase project is connected.', 'Campaigns will appear here when the marketplace opens.')
  .replace('>Set up the full app →</a>', '>See early access →</a>')
  .replace('>Setup</a>', '>Early Access</a>');

page = page
  .replace('</head>', '<link rel="stylesheet" href="/marketing.css"></head>')
  .replace('<a href="#developers">For Developers</a>', '<a href="/developers/">For Developers</a>')
  .replace('<a class="button" href="#launch">See early access', '<a class="button" href="/developers/">Explore the maker workspace')
  .replace('<a class="button" href="#workflow">See how it works', '<a class="button" href="/login/">Try the workspace')
  .replace('<a href="#launch">Early Access</a></nav></div></footer>', '<a href="/developers/">For Developers</a><a href="/login/">Try Demo</a></nav></div></footer>');

const start = page.indexOf('<section class="section" id="setup">');
const end = page.indexOf('<footer class="footer">', start);
if (start < 0 || end < 0) throw new Error('Could not find the launch section');
page = page.slice(0, start) + `<section class="section" id="launch"><div class="container"><div class="final-cta"><span class="eyebrow">Build. Launch. Test. Improve.</span><h2>Your next users are out there.</h2><p style="color:#aebdb2">FIRSTWAVE is preparing a place for makers and testers to work together.</p><a class="button" href="#workflow">See how it works →</a></div></div></section>\n` + page.slice(end);
page = page.replace('<a href="#developers">For Developers</a>', '<a href="/developers/">For Developers</a>')
  .replace('<a href="#launch">Early Access</a></nav></details>', '<a href="/login/">Try Demo</a><a href="/signup/">Sign Up</a></nav></details>')
  .replace('<a class="button" href="#workflow">See how it works →</a>', '<a class="button" href="/login/">Try the workspace →</a>');
const projectEnd = page.indexOf('</section>', page.indexOf('<section class="section" id="projects">')) + '</section>'.length;
if (projectEnd < 10) throw new Error('Could not find project section');
page = page.slice(0, projectEnd) + `<section class="proof-section"><div class="container proof-grid"><div class="proof-copy"><span class="eyebrow">A focused path to validation</span><h2>From first test to next release.</h2><p>Bring your campaign, tester recruitment, and product learning into one focused workspace.</p><a class="small-link" href="/developers/">Explore the developer workflow →</a></div><div class="proof-flow" aria-label="Developer workflow preview"><div><span>01 / CAMPAIGN</span><strong>Define what you need to learn</strong><small>Product details · Tester profile · Questions</small></div><div><span>02 / RECRUIT</span><strong>Choose the right early users</strong><small>Applications · Selection · Capacity</small></div><div><span>03 / IMPROVE</span><strong>Turn feedback into direction</strong><small>Ratings · Issues · Ideas</small></div></div></div></section>` + page.slice(projectEnd);
page = page
  .replaceAll('<a href="#projects">Explore</a>', '<a href="/explore/">Explore</a>')
  .replaceAll('<a href="#workflow">How It Works</a>', '<a href="/how-it-works/">How It Works</a>')
  .replaceAll('<a href="#launch">Early Access</a>', '<a href="/pricing/">Pricing</a>')
  .replace('<a class="button secondary" href="#projects">For Testers', '<a class="button secondary" href="/explore/">For Testers')
  .replace('<a class="small-link" href="#launch">Early access details', '<a class="small-link" href="/explore/">Explore projects');
page = page.replaceAll('<a href="/developers/">For Developers</a>', '<a href="/developers/">For Developers</a><a href="/community/">Community</a>');
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'index.html'), page, 'utf8');
await buildDemoPages(root, output, page);
await buildPublicPages(output, page);
await buildCommunityPage(root, output, page);
const authMessage = '<p id="auth-message" class="demo-error" role="status" aria-live="polite" hidden></p>';
const googleButton = '<button id="google-login" class="button light auth-google" type="button" hidden>Continue with Google</button>';
const liveLogin = `<form id="live-login" class="form-stack auth-fields" hidden><label>Email address<input class="field" name="email" type="email" autocomplete="username" required></label><label>Password<input class="field" name="password" type="password" autocomplete="current-password" required></label>${authMessage}<button class="button">Log in</button></form>${googleButton}<p id="forgot-link" class="auth-switch" hidden><a class="small-link" href="/forgot-password/">Forgot password?</a></p>`;
const liveSignup = `<form id="live-signup" class="form-stack auth-fields" hidden><label>Full name<input class="field" name="full_name" autocomplete="name" minlength="2" required></label><label>Email address<input class="field" name="email" type="email" autocomplete="email" required></label><label>Password<input class="field" name="password" type="password" autocomplete="new-password" minlength="8" required></label>${authMessage}<button class="button">Create account</button></form>${googleButton}`;
for (const [route, insertion, marker] of [
  ['login/index.html', liveLogin, '<form id="demo-login"'],
  ['signup/index.html', liveSignup, '<div class="form-stack auth-fields">'],
]) {
  const target = resolve(output, route);
  let markup = await readFile(target, 'utf8');
  if (!markup.includes(marker)) throw new Error(`Missing auth form in ${route}`);
  markup = markup.replace(marker, `${insertion}${route.startsWith('signup') ? '<div id="signup-preview" class="form-stack auth-fields">' : marker}`);
  if (route.startsWith('login')) markup = markup.replace('<div class="demo-credentials">', '<div id="demo-credentials" class="demo-credentials">');
  if (route.startsWith('signup')) markup = markup.replace('<div id="signup-preview" class="form-stack auth-fields"><label', '<div id="signup-preview" class="form-stack auth-fields"><label');
  markup = markup.replace('<div class="demo-notice">', '<div id="demo-notice" class="demo-notice">');
  await writeFile(target, markup, 'utf8');
}
const authPage = (title, form) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} · FIRSTWAVE</title><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/marketing.css"><link rel="stylesheet" href="/demo.css"></head><body><header class="demo-header"><div class="container site-header"><a class="brand" href="/">FIRSTWAVE</a><nav class="demo-header-links"><a href="/">Home</a><a href="/login/">Log In</a></nav></div></header><main class="auth-page"><section class="auth-card auth-standalone"><span class="eyebrow">ACCOUNT ACCESS</span><h1>${title}</h1><p>Secure your FIRSTWAVE account.</p><div class="demo-notice" id="unconfigured-message">Account recovery is available when Supabase authentication is connected.</div>${form}${authMessage}<p class="auth-switch"><a href="/login/">Back to log in</a></p></section></main></body></html>`;
for (const [route, title, form] of [
  ['forgot-password', 'Reset your password', '<form id="recover-form" class="form-stack auth-fields"><label>Email address<input class="field" name="email" type="email" autocomplete="email" required></label><button class="button">Send reset link</button></form>'],
  ['reset-password', 'Choose a new password', '<form id="reset-form" class="form-stack auth-fields"><label>New password<input class="field" name="password" type="password" autocomplete="new-password" minlength="8" required></label><button class="button">Update password</button></form>'],
]) { await mkdir(resolve(output, route), { recursive: true }); await writeFile(resolve(output, route, 'index.html'), authPage(title, form), 'utf8'); }
for (const route of ['index.html','explore/index.html','how-it-works/index.html','developers/index.html','pricing/index.html','login/index.html','signup/index.html','dashboard/index.html','community/index.html','forgot-password/index.html','reset-password/index.html']) {
  const target = resolve(output, route);
  const markup = await readFile(target, 'utf8');
  if (!markup.includes('</body>')) throw new Error(`Missing document body in ${route}`);
  const pageScripts = '<script src="/auth-config.js"></script><script src="/browser-auth.js"></script><script src="/demo-auth.js"></script>' + (route === 'community/index.html' ? '<script src="/community.js"></script>' : '') + '<script src="/language.js"></script></body>';
  await writeFile(target, markup.replace('</body>', pageScripts), 'utf8');
}
await writeFile(resolve(output, 'auth-config.js'), `window.FIRSTWAVE_AUTH_CONFIG = Object.freeze(${JSON.stringify({ url: supabaseUrl, publishableKey })});\n`, 'utf8');
await writeFile(resolve(output, 'browser-auth.js'), await readFile(resolve(root, 'scripts/browser-auth.js')), 'utf8');
await writeFile(resolve(output, 'demo-auth.js'), await readFile(resolve(root, 'scripts/demo-auth.js')), 'utf8');
await writeFile(resolve(output, 'language.js'), await readFile(resolve(root, 'scripts/language.js')), 'utf8');
await writeFile(resolve(output, 'marketing.css'), await readFile(resolve(root, 'scripts/marketing.css')), 'utf8');
await writeFile(resolve(output, 'favicon.svg'), await readFile(resolve(root, 'src/app/icon.svg')), 'utf8');
await writeFile(resolve(output, '_headers'), [
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: strict-origin-when-cross-origin',
  '  X-Frame-Options: DENY',
  '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
  "  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://accounts.google.com; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://xxytpyxnxaiwgzglsyel.supabase.co wss://xxytpyxnxaiwgzglsyel.supabase.co",
  '',
].join('\n'), 'utf8');
console.log(`Static FIRSTWAVE site built at ${output}`);
