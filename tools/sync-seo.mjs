#!/usr/bin/env node
/* OPTIONAL helper — not a build step. The site runs without it.

   Why: WhatsApp / Facebook / Instagram link previews do not run JavaScript,
   so they only see the meta tags written in the HTML files. This script copies
   config.seo (title, description, og:image ...) into the <!-- seo:start --> …
   <!-- seo:end --> block of every page.

   It also writes "speed hints" into the <!-- perf:start --> … <!-- perf:end --> block:
   the font stylesheet, the list of script files each page needs (so the browser fetches
   them all at once instead of one after another) and the first hero frame. Without
   them the site still works, it just starts a little slower.

   Run after changing `seo`, `business.name`, page titles, `theme.fonts`, `hero.mode`
   or `hero.frames`:
       node tools/sync-seo.mjs
*/
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = await readFile(path.join(root, 'js/site.config.js'), 'utf8');
const { default: config } = await import('data:text/javascript;charset=utf-8,' + encodeURIComponent(src));

const isPH = (v) => typeof v === 'string' && /^\s*\[PLACEHOLDER/i.test(v);
const has = (v) => v !== undefined && v !== null && v !== '' && !isPH(v);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const pages = { 'index.html': 'home', 'services.html': 'services', 'builds.html': 'builds', 'build.html': 'build', 'dyno.html': 'dyno', 'about.html': 'about', 'contact.html': 'contact' };
const { seo, business } = config;
const base = has(seo.siteUrl) ? seo.siteUrl.replace(/\/+$/, '') + '/' : '';
const image = has(seo.ogImage) ? base + seo.ogImage.replace(/^\/+/, '') : '';

/* ---------- speed hints ---------- */
// every local module a page imports (static imports, followed recursively)
const moduleGraph = async (entry, seen = new Set()) => {
  const rel = path.relative(root, entry).split(path.sep).join('/');
  if (seen.has(rel)) return seen;
  seen.add(rel);
  const code = await readFile(entry, 'utf8');
  for (const m of code.matchAll(/^\s*import\s[^'"]*?['"](\.{1,2}\/[^'"]+)['"]/gm)) {
    await moduleGraph(path.resolve(path.dirname(entry), m[1]), seen);
  }
  return seen;
};
const fam = (n, w) => `family=${encodeURIComponent(n).replace(/%20/g, '+')}${w ? `:wght@${w}` : ''}`;
const fonts = config.theme.fonts;
const fontHref = fonts.loadFromGoogle !== false
  ? `https://fonts.googleapis.com/css2?${fam(fonts.display)}&${fam(fonts.body, '400;500;600;700')}&display=swap`
  : '';
const firstFrame = (pattern) => pattern.replace(/^\/+/, '').replace(/#+/, (m) => '1'.padStart(m.length, '0'));

async function perfBlock(page) {
  const mods = await moduleGraph(path.join(root, 'js/main.js'));
  await moduleGraph(path.join(root, `js/pages/${page}.js`), mods);
  const lines = [];
  if (fontHref) lines.push(`<link rel="stylesheet" href="${esc(fontHref)}">`);
  if (page === 'home' && config.hero.mode === 'frames' && has(config.hero.frames?.desktop)) {
    await moduleGraph(path.join(root, 'js/hero/frames.js'), mods);
    const f = config.hero.frames;
    const mobile = has(f.mobile) ? f.mobile : f.desktop;
    lines.push(`<link rel="preload" as="image" href="${esc(firstFrame(f.desktop))}" media="(min-width: 761px)" fetchpriority="high">`);
    lines.push(`<link rel="preload" as="image" href="${esc(firstFrame(mobile))}" media="(max-width: 760px)" fetchpriority="high">`);
  }
  [...mods].filter((m) => m !== 'js/main.js').forEach((m) => lines.push(`<link rel="modulepreload" href="${esc(m)}">`));
  return lines.map((l) => '  ' + l).join('\n');
}

for (const [file, page] of Object.entries(pages)) {
  const pageTitle = config.pages?.[page]?.title;
  const title = page === 'home' || !pageTitle ? seo.title : `${pageTitle} | ${business.name}`;
  const block = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}">`,
    `<meta name="keywords" content="${esc((seo.keywords || []).join(', '))}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(business.name)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(seo.description)}">`,
    image && `<meta property="og:image" content="${esc(image)}">`,
    base && `<meta property="og:url" content="${esc(base + (file === 'index.html' ? '' : file))}">`,
    base && `<link rel="canonical" href="${esc(base + (file === 'index.html' ? '' : file))}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(seo.description)}">`,
    image && `<meta name="twitter:image" content="${esc(image)}">`,
    `<meta name="theme-color" content="${esc(config.theme.colors.bg)}">`,
  ].filter(Boolean).map((l) => '  ' + l).join('\n');

  const fp = path.join(root, file);
  let html = await readFile(fp, 'utf8');
  // speed hints: create the block after the seo block the first time, then keep it up to date
  const perf = `<!-- perf:start (generated by tools/sync-seo.mjs) -->
${await perfBlock(page)}
  <!-- perf:end -->`;
  const perfRe = /<!-- perf:start[^>]*-->[\s\S]*?<!-- perf:end -->/;
  // It must sit AFTER js/vendor-map.js: that script defines where "gsap" etc. come from, and browsers
  // need to know that before any module (even a preloaded one) starts loading.
  const mainTag = '<script type="module" src="js/main.js"></script>';
  html = perfRe.test(html) ? html.replace(perfRe, perf) : html.replace(mainTag, `${perf}\n  ${mainTag}`);
  const re = /<!-- seo:start[^>]*-->[\s\S]*?<!-- seo:end -->/;
  if (!re.test(html)) { console.warn(`skip ${file}: no seo block`); continue; }
  await writeFile(fp, html.replace(re, `<!-- seo:start (generated from js/site.config.js by tools/sync-seo.mjs) -->\n${block}\n  <!-- seo:end -->`));
  console.log(`updated ${file}`);
}
if (!base) console.log('\nNote: seo.siteUrl is still a placeholder — og:image/og:url are relative or omitted. Set it, then run this again.');
