import { config, esc, t, has, asset, icon, waLink, igHandle, qs, qsa } from './util.js';
import { gsap, ScrollTrigger, reduced } from './motion.js';

/* ---------- theme: config → CSS custom properties ---------- */
export function applyTheme() {
  const { colors, fonts, showCheckeredAccents, displaySkew } = config.theme;
  const r = document.documentElement;
  Object.entries(colors).forEach(([k, v]) => r.style.setProperty(`--color-${k}`, v));
  r.style.setProperty('--font-display', `"${fonts.display}", "Impact", "Arial Narrow", sans-serif`);
  r.style.setProperty('--font-body', `"${fonts.body}", system-ui, -apple-system, "Segoe UI", sans-serif`);
  r.style.setProperty('--skew', `${Number(displaySkew) || 0}deg`);
  r.dataset.checkered = showCheckeredAccents ? 'on' : 'off';
  r.dataset.dev = config.devMode ? 'on' : 'off';
  r.dataset.glass = config.theme.glassBlur === false ? 'off' : 'on';
  const tc = qs('meta[name="theme-color"]');
  if (tc) tc.content = colors.bg;

  if (fonts.loadFromGoogle !== false) {
    const fam = (n, w) => `family=${encodeURIComponent(n).replace(/%20/g, '+')}${w ? `:wght@${w}` : ''}`;
    const href = `https://fonts.googleapis.com/css2?${fam(fonts.display)}&${fam(fonts.body, '400;500;600;700')}&display=swap`;
    // tools/sync-seo.mjs writes this same link into the HTML so fonts start loading early; add it only if missing or outdated
    if (![...document.querySelectorAll('link[rel="stylesheet"]')].some((l) => l.getAttribute('href') === href)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }
}

/* ---------- SEO: meta, Open Graph, Twitter, JSON-LD ---------- */
function meta(attr, key, content) {
  if (!content) return;
  let el = qs(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function applySeo(page, override = {}) {
  const { seo, business, socials } = config;
  const pageTitle = override.title || config.pages[page]?.title || '';
  const title = page === 'home' || !pageTitle ? seo.title : `${pageTitle} | ${business.name}`;
  const desc = override.description || seo.description;
  const base = has(seo.siteUrl) ? seo.siteUrl.replace(/\/+$/, '') + '/' : new URL('.', location.href).href;
  const img = override.image || seo.ogImage;
  const imgAbs = has(img) ? new URL(asset(img), base).href : '';

  document.title = title;
  meta('name', 'description', desc);
  meta('name', 'keywords', (seo.keywords || []).join(', '));
  meta('property', 'og:type', 'website');
  meta('property', 'og:site_name', business.name);
  meta('property', 'og:title', title);
  meta('property', 'og:description', desc);
  meta('property', 'og:image', imgAbs);
  meta('property', 'og:url', has(seo.siteUrl) ? base + location.pathname.split('/').pop() + location.search : location.href);
  meta('name', 'twitter:card', 'summary_large_image');
  meta('name', 'twitter:title', title);
  meta('name', 'twitter:description', desc);
  meta('name', 'twitter:image', imgAbs);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'MotorcycleRepair',
    name: business.name,
    description: seo.description,
    slogan: business.tagline,
    url: base,
  };
  if (imgAbs) ld.image = imgAbs;
  if (has(business.whatsapp)) ld.telephone = '+' + String(business.whatsapp).replace(/\D+/g, '');
  if (has(business.email)) ld.email = business.email;
  if (has(business.hours)) ld.openingHours = business.hours;
  if (has(business.founder)) ld.founder = { '@type': 'Person', name: business.founder };
  const addr = { '@type': 'PostalAddress', addressCountry: business.country };
  if (has(business.address)) addr.streetAddress = business.address;
  if (has(business.city)) addr.addressLocality = business.city;
  ld.address = addr;
  ld.areaServed = business.country;
  ld.sameAs = Object.values(socials).filter(has);
  ld.makesOffer = config.services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, description: s.short } }));

  let s = qs('#ld-business');
  if (!s) {
    s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = 'ld-business';
    document.head.appendChild(s);
  }
  s.textContent = JSON.stringify(ld);
}

/* ---------- logo ---------- */
export function logoHTML() {
  const { name, logoAccent, logo } = config.business;
  const upper = String(name).toUpperCase();
  const acc = String(logoAccent || '').toUpperCase();
  const text = acc && upper.startsWith(acc) ? `<b>${esc(acc)}</b>${esc(upper.slice(acc.length))}` : esc(upper);
  const img = has(logo)
    ? `<img src="${esc(asset(logo))}" alt="" onload="this.parentNode.classList.add('has-img')" onerror="this.remove()">`
    : '';
  return `<span class="logo__text">${text}</span>${img}`;
}

const socialLinks = () =>
  Object.entries(config.socials)
    .filter(([, url]) => has(url))
    .map(([k, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(k)}">${icon(k)}</a>`)
    .join('');

/* ---------- header + mobile menu ---------- */
function renderHeader(page) {
  const header = qs('#site-header');
  const current = location.pathname.split('/').pop() || 'index.html';
  const links = config.nav
    .map((n) => `<a href="${esc(n.href)}" ${n.href === current ? 'aria-current="page"' : ''}>${t(n.label)}</a>`)
    .join('');
  header.className = 'hdr';
  header.dataset.over = page === 'home' ? 'hero' : 'page';
  header.innerHTML = `
    <div class="hdr__in">
      <a class="logo" href="index.html" aria-label="${esc(config.business.name)}">${logoHTML()}</a>
      <nav class="hdr__nav" aria-label="Primary">${links}</nav>
      <a class="btn btn--sm hdr__cta" href="${esc(config.ui.bookHref)}">${t(config.ui.bookCta)}</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="mmenu" aria-label="${esc(config.ui.menuOpen)}"><span></span><span></span><span></span></button>
    </div>
    <div class="mmenu" id="mmenu" hidden>
      <nav class="mmenu__nav" aria-label="Mobile">
        ${config.nav.map((n, i) => `<a href="${esc(n.href)}" style="--i:${i}" ${n.href === current ? 'aria-current="page"' : ''}><span class="display">${t(n.label)}</span></a>`).join('')}
      </nav>
      <div class="mmenu__foot" style="--i:${config.nav.length}">
        <a class="btn" href="${esc(config.ui.bookHref)}">${t(config.ui.bookCta)}</a>
        <div class="socials">${socialLinks()}</div>
      </div>
    </div>`;

  const burger = qs('.burger', header);
  const menu = qs('#mmenu', header);
  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? config.ui.menuClose : config.ui.menuOpen);
    document.documentElement.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      window.__lenis?.stop();
    } else {
      menu.classList.remove('is-open');
      window.__lenis?.start();
      setTimeout(() => { if (burger.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 350);
    }
  };
  burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setOpen(false); burger.focus(); }
  });
  qsa('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => e.matches && setOpen(false));

  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- footer ---------- */
function renderFooter() {
  const { business, ui, credits } = config;
  const footer = qs('#site-footer');
  footer.className = 'ftr';
  const contact = [
    has(business.address) || config.devMode ? `<li>${icon('pin')}<span>${t(business.address)}${has(business.city) || config.devMode ? `, ${t(business.city)}` : ''}</span></li>` : '',
    has(business.hours) || config.devMode ? `<li>${icon('clock')}<span>${t(business.hours)}</span></li>` : '',
    has(business.email) ? `<li>${icon('mail')}<a href="mailto:${esc(business.email)}">${esc(business.email)}</a></li>` : config.devMode ? `<li>${icon('mail')}<span>${t(business.email)}</span></li>` : '',
    igHandle() ? `<li>${icon('instagram')}<a href="${esc(config.socials.instagram)}" target="_blank" rel="noopener">@${esc(igHandle())}</a></li>` : '',
  ].join('');
  footer.innerHTML = `
    <div class="ftr__flag" aria-hidden="true"></div>
    <div class="wrap ftr__grid">
      <div class="ftr__brand">
        <a class="logo logo--lg" href="index.html" aria-label="${esc(business.name)}">${logoHTML()}</a>
        <p class="ftr__tag"><span class="display">${t(business.tagline)}</span></p>
        <div class="socials">${socialLinks()}</div>
      </div>
      <nav class="ftr__nav" aria-label="Footer">
        ${config.nav.map((n) => `<a href="${esc(n.href)}">${t(n.label)}</a>`).join('')}
      </nav>
      <ul class="ftr__contact">${contact}</ul>
    </div>
    <div class="wrap ftr__base">
      <p>© ${new Date().getFullYear()} ${esc(business.name)}. ${t(ui.rights)}</p>
      <p>${t(ui.footerNote)}</p>
      ${has(credits.model) || config.devMode ? `<p class="ftr__credit">${t(credits.model)}</p>` : ''}
      ${has(credits.photos) ? `<p class="ftr__credit">${t(credits.photos)}</p>` : ''}
    </div>`;
}

/* ---------- floating WhatsApp button ---------- */
function renderWhatsapp() {
  const a = document.createElement('a');
  a.className = 'wa';
  a.href = waLink(config.ui.whatsappPrefill);
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', config.ui.whatsappLabel);
  a.title = config.ui.whatsappLabel;
  a.innerHTML = icon('whatsapp');
  document.body.appendChild(a);
}

/* ---------- one-time intro: logo reveal + red speed-line wipe ---------- */
function intro() {
  let seen = false;
  try { seen = sessionStorage.getItem('la-intro') === '1'; sessionStorage.setItem('la-intro', '1'); } catch (e) { /* storage blocked */ }
  if (seen || reduced) return;
  const el = document.createElement('div');
  el.className = 'intro';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="intro__logo logo logo--xl">${logoHTML()}</div><i></i><i></i><i></i>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1250);
}

/* ---------- custom cursor (desktop, fine pointer) ---------- */
function cursor() {
  if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.createElement('div');
  dot.className = 'cursor';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  const xTo = gsap.quickTo(dot, 'x', { duration: 0.18, ease: 'power3.out' });
  const yTo = gsap.quickTo(dot, 'y', { duration: 0.18, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => {
    dot.classList.add('is-on');
    xTo(e.clientX);
    yTo(e.clientY);
  }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    dot.classList.toggle('is-link', !!e.target.closest?.('a, button, [role="button"], input, select, textarea, summary, th[aria-sort]'));
  });
  document.documentElement.addEventListener('pointerleave', () => dot.classList.remove('is-on'));
}

export function initLayout(page) {
  applyTheme();
  applySeo(page);
  intro();
  renderHeader(page);
  renderFooter();
  renderWhatsapp();
  cursor();
  const skip = qs('.skip');
  if (skip) skip.textContent = config.ui.skipToContent;
}

export function afterRender() {
  // images/fonts change heights → keep scroll-driven sections accurate
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
