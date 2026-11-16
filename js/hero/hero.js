/* HERO controller: picks a renderer (3d / frames / silhouette / image), maps scroll
   progress → camera (from config keyframes) and drives the overlays.
   Everything here is driven by config.hero — see js/site.config.js. */
import { config, esc, t, num, asset, has } from '../core/util.js';
import { ScrollTrigger, reduced } from '../core/motion.js';
import { prepareKeyframes, sampleCamera, clamp, smoothstep, dist } from './camera-path.js';
import { createSilhouette, staticSilhouette } from './silhouette.js';

const rad = (d) => (d * Math.PI) / 180;

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

async function fileExists(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    const type = r.headers.get('content-type') || '';
    return r.ok && !type.includes('text/html'); // some hosts answer 200 + index.html for missing files
  } catch (e) {
    return false;
  }
}

/** visibility 0–1 of an overlay at progress p, with soft edges */
function fade(p, from, to, edge = 0.025) {
  const a = from <= 0 ? 1 : smoothstep(from - edge * 0.2, from + edge, p);
  const b = to >= 1 ? 1 : 1 - smoothstep(to - edge, to + edge * 0.2, p);
  return Math.min(a, b);
}

export async function initHero(section) {
  const cfg = config.hero;
  const ui = config.ui;
  const dev = !!config.devMode;
  const kfs = prepareKeyframes(cfg.cameraKeyframes);
  const overlays = (cfg.overlays || []).map((o, i) => ({ ...o, i }));
  const titles = overlays.filter((o) => o.type === 'title');
  const callouts = overlays.filter((o) => o.type === 'callout');
  const hpO = overlays.find((o) => o.type === 'hpCounter');
  const ctaO = overlays.find((o) => o.type === 'cta');
  // devMode only: index.html?model=<url> previews another GLB without editing the config
  const modelUrl = (dev && new URLSearchParams(location.search).get('model')) || asset(cfg.bike.modelUrl);

  // ---------- resolve mode ----------
  let mode = cfg.mode || '3d';
  let why = '';
  if (reduced && mode !== 'image') { mode = 'image'; why = 'prefers-reduced-motion'; }
  if (mode === '3d' && !webglOK()) { mode = 'image'; why = 'WebGL unavailable'; }
  if (mode === '3d' && !(modelUrl && (await fileExists(modelUrl)))) { mode = 'silhouette'; why = `model not found at ${modelUrl}`; }
  if (dev && why) console.info(`%c[hero] mode "${cfg.mode}" → "${mode}" (${why})`, 'color:#E10600');

  const stock = num(cfg.bike.stockHp);
  const tuned = num(cfg.bike.tunedHp);
  const bikeLabel = [cfg.bike.name, cfg.bike.year].filter(has).join(' · ');
  // frames mode: the poster is the first frame for this screen size, so it is downloaded once and reused
  const narrowScreen = window.matchMedia('(max-width: 760px)').matches;
  const framePattern = mode === 'frames' ? (narrowScreen && cfg.frames?.mobile) || cfg.frames?.desktop : '';
  const posterUrl = framePattern
    ? asset(framePattern).replace(/#+/, (m) => '1'.padStart(m.length, '0'))
    : asset(cfg.poster);
  const posterHTML = `<div class="hero__poster">${staticSilhouette('hbp')}${posterUrl ? `<img src="${esc(posterUrl)}" alt="" fetchpriority="high" decoding="async" onerror="this.remove()">` : ''}</div>`;
  const ctaHTML = (cfg.cta || [])
    .map((b) => `<a class="btn ${b.style === 'secondary' ? 'btn--ghost' : ''}" href="${esc(b.href)}">${t(b.label)}</a>`)
    .join('');

  section.className = 'hero';
  section.dataset.mode = mode;
  section.style.setProperty('--hero-len', mode === 'image' ? '100svh' : cfg.scrollLength || '350vh');
  section.style.setProperty('--hero-bg', cfg.background || config.theme.colors.bg);
  section.style.setProperty('--hero-rim', cfg.lighting?.rimColor || config.theme.colors.accent);
  section.style.setProperty('--hero-headlight', cfg.lighting?.headlightColor || '#DCEBFF');
  section.setAttribute('aria-label', bikeLabel);

  section.innerHTML = `
    <div class="hero__sticky">
      <div class="hero__glow" aria-hidden="true"></div>
      <div class="hero__stage"></div>
      ${mode === '3d' || mode === 'image' || mode === 'frames' ? posterHTML : ''}
      <div class="hero__vignette" aria-hidden="true"></div>
      <svg class="hero__leaders" aria-hidden="true">
        ${callouts.map((c) => `<g data-i="${c.i}"><path pathLength="1"/><circle r="4"/></g>`).join('')}
      </svg>
      <div class="hero__overlays">
        <div class="hero__titles">
          ${titles.map((o, n) => `<${n === 0 ? 'h1' : 'p'} class="hero__title" data-i="${o.i}"><span class="display">${t(o.text)}</span></${n === 0 ? 'h1' : 'p'}>`).join('')}
        </div>
        ${callouts.map((c) => `<div class="callout" data-i="${c.i}"><span>${t(c.text)}</span></div>`).join('')}
        ${hpO ? `<div class="hero__hp" data-i="${hpO.i}">
            <p class="hero__hp-name">${esc(bikeLabel)}</p>
            <p class="hero__hp-num"><strong data-hp>${stock ?? ''}</strong><span>${t(ui.hp)}</span></p>
            <div class="hero__hp-bar"><i></i></div>
            <p class="hero__hp-meta"><span>${t(ui.stock)} <b>${stock ?? '—'}</b></span><span class="hero__hp-arrow"></span><span>${t(ui.tuned)} <b>${tuned ?? t(cfg.bike.tunedHp, '—')}</b></span></p>
          </div>` : ''}
        ${ctaO ? `<div class="hero__cta" data-i="${ctaO.i}">${ctaHTML}</div>` : ''}
        <ol class="hero__clist">${callouts.map((c) => `<li data-i="${c.i}">${t(c.text)}</li>`).join('')}</ol>
      </div>
      <div class="hero__loader" hidden><div class="hero__loader-bar"><i></i></div><span>${t(ui.loading)} <b>0</b>%</span></div>
      <div class="hero__hint" aria-hidden="true"><span>${t(ui.scrollHint)}</span><i></i></div>
    </div>`;

  const sticky = section.querySelector('.hero__sticky');
  const stage = section.querySelector('.hero__stage');
  const poster = section.querySelector('.hero__poster');
  const loader = section.querySelector('.hero__loader');
  const byI = (sel) => new Map([...section.querySelectorAll(sel)].map((el) => [+el.dataset.i, el]));
  const titleEls = byI('.hero__title');
  const calloutEls = byI('.callout');
  const leaderEls = byI('.hero__leaders g');
  const listEls = byI('.hero__clist li');
  const hpEl = section.querySelector('.hero__hp');
  const hpNum = section.querySelector('[data-hp]');
  const hpBar = section.querySelector('.hero__hp-bar i');
  const ctaEl = section.querySelector('.hero__cta');

  // ---------- static mode: poster + first title + CTA, no scroll animation ----------
  if (mode === 'image') {
    section.classList.add('hero--static');
    return;
  }

  const setLoad = (v) => {
    loader.hidden = false;
    const pct = Math.round(clamp(v) * 100);
    loader.querySelector('i').style.transform = `scaleX(${clamp(v)})`;
    loader.querySelector('b').textContent = pct;
  };
  const doneLoading = () => {
    loader.hidden = true;
    poster?.classList.add('is-hidden');
    setTimeout(() => poster?.remove(), 700);
  };

  // ---------- renderer ----------
  let view = null;
  const useSilhouette = () => { section.dataset.mode = mode = 'silhouette'; view = createSilhouette(stage, cfg, kfs); };

  if (mode === 'silhouette') {
    useSilhouette();
  } else if (mode === 'frames') {
    try {
      const { createFrames } = await import('./frames.js');
      view = await createFrames(stage, cfg, { onProgress: () => {} });
      doneLoading();
    } catch (e) {
      if (dev) console.info('[hero] frames not found → silhouette fallback');
      doneLoading();
      useSilhouette();
    }
  } else {
    // 3D: start the scroll logic immediately on the poster, swap in the model when ready
    setLoad(0);
    import('./scene3d.js')
      .then(({ createScene3D }) => createScene3D(stage, cfg, { url: modelUrl, onProgress: setLoad, dev }))
      .then((v) => { view = v; doneLoading(); })
      .catch((err) => {
        console.warn('[hero] 3D model failed to load → silhouette fallback', err);
        doneLoading();
        useSilhouette();
      });
  }

  // ---------- camera fit (narrow screens) ----------
  let W = sticky.clientWidth, H = sticky.clientHeight;
  new ResizeObserver(() => { W = sticky.clientWidth; H = sticky.clientHeight; }).observe(sticky);

  function fitCamera(raw, p) {
    const f = cfg.fit || {};
    const aspect = W / Math.max(1, H);
    const d = dist(raw.position, raw.lookAt);
    const visW = 2 * d * Math.tan(rad(raw.fov) / 2) * aspect;
    const s = smoothstep(0.15, 0.85, p);
    const k = 1 + (Math.max(1, (f.minVisibleWidth || 0) / visW) - 1) * s;
    const lift = aspect < 1 ? (f.portraitLift || 0) * s : 0;
    const L = raw.lookAt, P = raw.position;
    return {
      position: [L[0] + (P[0] - L[0]) * k, L[1] + (P[1] - L[1]) * k - lift, L[2] + (P[2] - L[2]) * k],
      lookAt: [L[0], L[1] - lift, L[2]],
      fov: raw.fov,
    };
  }

  // ---------- overlays ----------
  const narrow = window.matchMedia('(max-width: 760px)');
  const hpFrom = tuned !== null && stock !== null ? stock : 0;
  const hpTo = tuned !== null ? tuned : stock ?? 0;

  function updateOverlays(p) {
    titles.forEach((o) => {
      const el = titleEls.get(o.i);
      const v = fade(p, o.from, o.to);
      el.style.opacity = v.toFixed(3);
      el.style.transform = `translate3d(${((1 - v) * -28).toFixed(1)}px, 0, 0)`;
      el.style.visibility = v > 0.01 ? 'visible' : 'hidden';
    });

    const listMode = narrow.matches || !view || !view.project;
    section.classList.toggle('hero--list', listMode);
    callouts.forEach((o, n) => {
      const v = fade(p, o.from, o.to);
      const local = clamp((p - o.from) / (o.to - o.from || 1e-6));
      listEls.get(o.i).classList.toggle('is-on', v > 0.5);
      const label = calloutEls.get(o.i), g = leaderEls.get(o.i);
      const pt = !listMode && v > 0.01 && Array.isArray(o.anchor) ? view.project(o.anchor) : null;
      if (!pt || !pt.visible) {
        label.style.opacity = '0';
        g.style.opacity = '0';
        return;
      }
      const side = o.side === 'left' ? -1 : o.side === 'right' ? 1 : n % 2 ? -1 : 1;
      const dy = 70 + (n % 3) * 44;
      const dx = clamp(W * 0.13, 90, 210);
      const lx = clamp(pt.x + side * (dy + dx), 110, W - 110);
      const ly = clamp(pt.y - dy, 96, H - 140);
      const ex = clamp(pt.x + side * Math.abs(pt.y - ly), Math.min(pt.x, lx), Math.max(pt.x, lx));
      const path = g.firstElementChild, dot = g.lastElementChild;
      path.setAttribute('d', `M${pt.x.toFixed(1)} ${pt.y.toFixed(1)} L${ex.toFixed(1)} ${ly.toFixed(1)} L${lx.toFixed(1)} ${ly.toFixed(1)}`);
      path.style.strokeDashoffset = (1 - smoothstep(0, 0.3, local)).toFixed(3);
      dot.setAttribute('cx', pt.x.toFixed(1));
      dot.setAttribute('cy', pt.y.toFixed(1));
      g.style.opacity = v.toFixed(3);
      label.style.opacity = (v * smoothstep(0.18, 0.38, local)).toFixed(3);
      label.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0) translate(${side > 0 ? '10px' : 'calc(-100% - 10px)'}, -50%)`;
    });

    if (hpO && hpEl) {
      const v = fade(p, hpO.from, hpO.to);
      const local = clamp((p - hpO.from) / ((hpO.to - hpO.from) * 0.75 || 1e-6));
      const e = 1 - Math.pow(1 - local, 3);
      hpEl.style.opacity = v.toFixed(3);
      hpEl.style.visibility = v > 0.01 ? 'visible' : 'hidden';
      hpNum.textContent = Math.round(hpFrom + (hpTo - hpFrom) * e);
      hpBar.style.transform = `scaleX(${e.toFixed(3)})`;
    }
    if (ctaO && ctaEl) {
      const v = fade(p, ctaO.from, ctaO.to);
      ctaEl.style.opacity = v.toFixed(3);
      ctaEl.style.transform = `translate3d(0, ${((1 - v) * 24).toFixed(1)}px, 0)`;
      ctaEl.classList.toggle('is-live', v > 0.5);
    }
  }

  // ---------- dev panel ----------
  let devPanel = null;
  let lastCam = sampleCamera(kfs, 0);
  if (dev) import('./dev-panel.js').then(({ createDevPanel }) => {
    devPanel = createDevPanel({
      canFree: cfg.mode === '3d' && mode === '3d',
      setFree: (on) => view?.setFree?.(on),
      getState: () => {
        const c = view?.getCamera?.() || lastCam;
        return { mode, p: cur, position: c.position, lookAt: c.lookAt, fov: c.fov };
      },
    });
    kick();
  });

  // ---------- scroll → progress → frame ----------
  let target = 0, cur = 0, visible = true, raf = 0;
  const ease = Math.min(1, Math.max(0.02, Number(cfg.scrollSmoothing) || 0.14)); // config.hero.scrollSmoothing
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => { target = self.progress; kick(); },
    onRefresh: (self) => { target = self.progress; kick(); },
  });
  const glowEl = section.querySelector('.hero__glow');
  const hintEl = section.querySelector('.hero__hint');
  let lastP = -1;
  // The loop sleeps when nothing moves (no scroll, nothing loading) and is woken by kick().
  // Live 3D and the dev panel keep it running because they animate on their own.
  function kick() { if (visible && !raf) raf = requestAnimationFrame(tick); }

  function tick(time) {
    raf = 0;
    if (!visible) return;
    cur += (target - cur) * ease;
    if (Math.abs(target - cur) < 0.0004) cur = target;
    const raw = sampleCamera(kfs, cur);
    lastCam = fitCamera(raw, cur);
    view?.update(cur, lastCam, time / 1000, raw);
    const moved = Math.abs(cur - lastP) > 0.00005;
    if (moved || view?.kind === '3d') {
      lastP = cur;
      // --p drives the glow and the scroll hint; set on those two only so the rest of the hero is not restyled
      const pv = cur.toFixed(3);
      glowEl?.style.setProperty('--p', pv);
      hintEl?.style.setProperty('--p', pv);
      updateOverlays(cur);
    }
    devPanel?.update();
    const settled = cur === target && !moved;
    const live = mode === '3d' || !view || view.busy || !!devPanel;
    if (!settled || live) raf = requestAnimationFrame(tick);
  }

  // render only while the hero is on screen
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    kick();
  }).observe(section);
  window.addEventListener('resize', () => { lastP = -1; kick(); }, { passive: true });
  raf = requestAnimationFrame(tick);
}
