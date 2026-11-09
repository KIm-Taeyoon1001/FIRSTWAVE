import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { html } from './preview-server.mjs';
import { buildDemoPages } from './demo-site.mjs';
import { buildPublicPages } from './public-pages.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'site');
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
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'index.html'), page, 'utf8');
await buildDemoPages(root, output, page);
await buildPublicPages(output, page);
await writeFile(resolve(output, 'marketing.css'), await readFile(resolve(root, 'scripts/marketing.css')), 'utf8');
await writeFile(resolve(output, 'favicon.svg'), await readFile(resolve(root, 'src/app/icon.svg')), 'utf8');
await writeFile(resolve(output, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n', 'utf8');
console.log(`Static FIRSTWAVE site built at ${output}`);
