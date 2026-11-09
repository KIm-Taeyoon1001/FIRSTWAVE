import { readFile } from 'node:fs/promises';
const page = await readFile(new URL('../site/index.html', import.meta.url), 'utf8');
const ids = new Set([...page.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
const anchors = [...page.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
const broken = anchors.filter(anchor => !ids.has(anchor));
if (broken.length) throw new Error(`Broken anchors: ${broken.join(', ')}`);
if (page.includes('<div class="preview-banner">') || page.includes('npm install')) throw new Error('Preview-only content leaked into production');
if (!page.includes('Where Great Apps')) throw new Error('Brand headline missing');
console.log(`Static page OK: ${anchors.length} links, no broken anchors`);
