import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const page = await readFile(new URL('../site/index.html', import.meta.url), 'utf8');
const login = await readFile(new URL('../site/login/index.html', import.meta.url), 'utf8');
const signup = await readFile(new URL('../site/signup/index.html', import.meta.url), 'utf8');
const dashboard = await readFile(new URL('../site/dashboard/index.html', import.meta.url), 'utf8');
const developers = await readFile(new URL('../site/developers/index.html', import.meta.url), 'utf8');
const demoScript = await readFile(new URL('../site/demo.js', import.meta.url), 'utf8');
const headers = await readFile(new URL('../site/_headers', import.meta.url), 'utf8');
const ids = new Set([...page.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
const anchors = [...page.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
const broken = anchors.filter(anchor => !ids.has(anchor));
if (broken.length) throw new Error(`Broken anchors: ${broken.join(', ')}`);
if (page.includes('<div class="preview-banner">') || page.includes('npm install')) throw new Error('Preview-only content leaked into production');
if (!page.includes('Where Great Apps')) throw new Error('Brand headline missing');
if (!page.includes('href="/login/"')) throw new Error('Landing page does not link to demo login');
if (!login.includes('id="demo-login"') || !login.includes('Demo mode')) throw new Error('Demo login is missing or mislabeled');
if (!signup.includes('Registration will open') || !signup.includes('href="/login/"')) throw new Error('Sign up state is unclear');
if (!dashboard.includes('data-view="projects"') || !dashboard.includes('id="demo-view"')) throw new Error('Developer workspace is missing');
if (!developers.includes('Campaign briefs') || !developers.includes('href="/login/"')) throw new Error('Developer page is missing or disconnected');
if (!demoScript.includes('sessionStorage.setItem') || !demoScript.includes('localStorage.setItem')) throw new Error('Demo interactions are missing');
if (!headers.startsWith('/*\n')) throw new Error('Security headers do not cover all static routes');
const output = resolve(dirname(fileURLToPath(import.meta.url)), '../site');
for (const [name, content] of [['home',page],['login',login],['signup',signup],['dashboard',dashboard],['developers',developers]]) {
  const targets = [...content.matchAll(/(?:href|src)="(\/[^"#?]+)"/g)].map(match => match[1]);
  for (const target of targets) {
    const file = resolve(output, target.slice(1), target.endsWith('/') ? 'index.html' : '');
    try { await access(file); } catch { throw new Error(`${name} has a missing local target: ${target}`); }
  }
}
console.log(`Static pages OK: ${anchors.length} landing anchors and all internal page and asset links`);
