import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { html } from './preview-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'site');
let page = html
  .replace('<title>FIRSTWAVE — Local design preview</title>', '<title>FIRSTWAVE — Where Great Apps Meet Their Users</title>')
  .replace(/<div class="preview-banner">[\s\S]*?<\/div>\s*/, '')
  .replaceAll('href="#setup"', 'href="#launch"')
  .replace('<a class="login-link" href="#launch">Log In</a>', '')
  .replace('>Get Started</a>', '>Early Access</a>')
  .replace('>Pricing</a>', '>Early Access</a>')
  .replace('>Submit Your App <span', '>For Developers <span')
  .replace('>Become a Tester <span', '>For Testers <span')
  .replace('>Explore all projects →</a>', '>Early access details →</a>')
  .replace('Published beta campaigns will appear once a Supabase project is connected.', 'Campaigns will appear here when the marketplace opens.')
  .replace('>Set up the full app →</a>', '>See early access →</a>')
  .replace('>Setup</a>', '>Early Access</a>');

const start = page.indexOf('<section class="section" id="setup">');
const end = page.indexOf('<footer class="footer">', start);
if (start < 0 || end < 0) throw new Error('Could not find the launch section');
page = page.slice(0, start) + `<section class="section" id="launch"><div class="container"><div class="final-cta"><span class="eyebrow">Build. Launch. Test. Improve.</span><h2>Your next users are out there.</h2><p style="color:#aebdb2">FIRSTWAVE is preparing a place for makers and testers to work together.</p><a class="button" href="#workflow">See how it works →</a></div></div></section>\n` + page.slice(end);
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'index.html'), page, 'utf8');
await writeFile(resolve(output, 'favicon.svg'), await readFile(resolve(root, 'src/app/icon.svg')), 'utf8');
await writeFile(resolve(output, '_headers'), '/\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n', 'utf8');
console.log(`Static FIRSTWAVE site built at ${output}`);
