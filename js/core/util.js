import config from '../site.config.js';

export { config };

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** true for "[PLACEHOLDER: ...]" strings */
export const isPH = (v) => typeof v === 'string' && /^\s*\[PLACEHOLDER/i.test(v);

/** true when a config value is filled in (not empty, not a placeholder) */
export const has = (v) => v !== undefined && v !== null && v !== '' && !isPH(v);

/** Safe HTML for a config value. Placeholders are highlighted in devMode, replaced by `fallback` otherwise. */
export function t(v, fallback = '') {
  if (isPH(v)) return config.devMode ? `<mark class="ph">${esc(v)}</mark>` : esc(fallback);
  if (v === undefined || v === null || v === '') return esc(fallback);
  return esc(v);
}

/** number or null */
export const num = (v) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !isPH(v) && Number.isFinite(+v)) return +v;
  return null;
};

/** Normalise an asset path so the site works from any folder on any static host. */
export const asset = (p) => {
  if (!has(p)) return '';
  if (/^(https?:)?\/\//.test(p) || p.startsWith('data:')) return p;
  return p.replace(/^\/+/, '');
};

/** Image with a labelled dark placeholder behind it (visible when src is empty or fails to load). */
export function media(src, label, { alt = '', cls = '', eager = false } = {}) {
  const url = asset(src);
  const phNote = isPH(src) && config.devMode ? `<mark class="ph ph--sm">${esc(src)}</mark>` : '';
  const img = url
    ? `<img src="${esc(url)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onerror="this.remove()">`
    : '';
  return `<div class="media ${cls}"><span class="media__ph" aria-hidden="true">${esc(label)}${phNote}</span>${img}</div>`;
}

const digits = (s) => String(s ?? '').replace(/\D+/g, '');

/** Instagram handle from the socials URL */
export const igHandle = () => {
  const m = String(config.socials.instagram || '').match(/instagram\.com\/([^/?#]+)/i);
  return m ? m[1] : '';
};

/** WhatsApp deep link with pre-filled text. Falls back to Instagram DM when no number is configured. */
export function waLink(text = '') {
  const n = has(config.business.whatsapp) ? digits(config.business.whatsapp) : '';
  if (n) return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
  const h = igHandle();
  return h ? `https://ig.me/m/${h}` : config.ui.bookHref;
}
export const hasWhatsapp = () => has(config.business.whatsapp) && digits(config.business.whatsapp).length >= 8;

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- inline icons (24×24, stroke = currentColor) ---------- */
const I = (d, extra = '') =>
  `<svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}>${d}</svg>`;

const ICONS = {
  ecu: I('<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><path d="M10 14l2-4 2 4"/>'),
  mods: I('<path d="M14.5 5.5a4 4 0 0 0-5.2 5.2L3 17l4 4 6.3-6.3a4 4 0 0 0 5.2-5.2l-2.7 2.7-2.8-.7-.7-2.8z"/>'),
  dyno: I('<path d="M3 20h18"/><path d="M4 16a8 8 0 0 1 16 0"/><path d="M12 16l4-6"/><circle cx="12" cy="16" r="1.2"/>'),
  turbo: I('<circle cx="11" cy="13" r="6"/><circle cx="11" cy="13" r="1.6"/><path d="M11 7V3h9v5h-4"/><path d="M11 11.4c1-2 2.6-2.6 4.4-2.2M12.6 13c2 1 2.6 2.6 2.2 4.4M9.4 13c-2-1-2.6-2.600-2.200-4.400M11 14.600c-1 2-2.600 2.600-4.400 2.200"/>'),
  wrench: I('<path d="M14.7 6.3a4 4 0 0 0 5 5L11 20a2.1 2.100 0 0 1-3-3z"/><path d="M14.700 6.300L17 4l3 3-2.300 2.300"/>'),
  bolt: I('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
  arrow: I('<path d="M4 12h15M13 6l6 6-6 6"/>'),
  chevL: I('<path d="M15 5l-7 7 7 7"/>'),
  chevR: I('<path d="M9 5l7 7-7 7"/>'),
  close: I('<path d="M5 5l14 14M19 5L5 19"/>'),
  play: I('<path d="M8 5l11 7-11 7z" fill="currentColor"/>'),
  pin: I('<path d="M12 21s7-6.200 7-11.500A7 7 0 0 0 5 9.500C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.400"/>'),
  clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  mail: I('<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/>'),
  sort: I('<path d="M8 4v16M8 4L4 8M8 4l4 4M16 20V4M16 20l-4-4M16 20l4-4"/>'),
  instagram: I('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.500" cy="6.500" r=".6" fill="currentColor"/>'),
  facebook: I('<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>'),
  youtube: I('<rect x="2.500" y="5.500" width="19" height="13" rx="3"/><path d="M10 9.500l5 2.500-5 2.500z" fill="currentColor"/>'),
  tiktok: I('<path d="M14 3v11.500a3.500 3.500 0 1 1-3.500-3.500"/><path d="M14 3c.4 2.600 2 4.200 4.500 4.500"/>'),
  whatsapp:
    '<svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 0 0-8.600 15.100L2 22l5-1.300A10 10 0 1 0 12 2zm0 1.800a8.200 8.200 0 1 1-4.300 15.200l-.3-.2-2.900.8.800-2.800-.2-.3A8.200 8.200 0 0 1 12 3.800zm-3.400 4c-.2 0-.5.100-.7.400-.300.300-1 1-1 2.300s1 2.700 1.100 2.900c.100.200 2 3.100 4.900 4.200 2.400.9 2.900.8 3.400.7.500-.100 1.700-.700 1.900-1.400.200-.700.200-1.200.200-1.400-.100-.100-.300-.200-.600-.400l-1.900-.900c-.300-.100-.500-.100-.700.200l-.900 1.100c-.200.200-.300.200-.600.100-.300-.200-1.200-.500-2.300-1.400-.900-.800-1.400-1.700-1.600-2-.200-.300 0-.500.100-.600l.400-.500c.200-.200.200-.300.300-.500.100-.200.100-.400 0-.500l-.900-2.100c-.200-.500-.400-.500-.600-.500z"/></svg>',
};

export const icon = (name) => ICONS[name] || ICONS.bolt;

/** Section heading block used on every page */
export function heading({ kicker, heading: h, intro }, tag = 'h2') {
  return `<header class="shead reveal">
    ${kicker ? `<p class="kicker">${t(kicker)}</p>` : ''}
    <${tag} class="shead__title"><span class="display">${t(h)}</span></${tag}>
    ${intro ? `<p class="shead__intro">${t(intro)}</p>` : ''}
  </header>`;
}

/** Banner at the top of inner pages */
export function pageHead(page) {
  const p = config.pages[page] || {};
  return `<section class="phead">
    <div class="wrap">
      ${p.kicker ? `<p class="kicker">${t(p.kicker)}</p>` : ''}
      <h1 class="phead__title"><span class="display">${t(p.title)}</span></h1>
      ${p.intro ? `<p class="phead__intro">${t(p.intro)}</p>` : ''}
    </div>
    <div class="speedlines" aria-hidden="true"><i></i><i></i><i></i></div>
  </section>`;
}

/** Final call-to-action band (shared by several pages) */
export function ctaBand() {
  const c = config.home.cta;
  return `<section class="ctaband">
    <div class="wrap reveal">
      <h2 class="ctaband__title"><span class="display">${t(c.heading)}</span></h2>
      <p class="ctaband__text">${t(c.text)}</p>
      <a class="btn btn--light" href="${esc(config.ui.bookHref)}">${t(c.button)} ${icon('arrow')}</a>
    </div>
  </section>`;
}
