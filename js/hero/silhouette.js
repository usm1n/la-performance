/* Stylised SVG sportbike (side profile, nose to the left).
   Used when the GLB is missing, as the loading poster fallback, and by mode "image"
   when no poster file exists. Drawn in "model millimetres":
     svg x = 1100 − z·1000   (z = towards the nose)
     svg y = 1250 − y·1000   (y = up, ground at 1250)                       */
import { clamp, smoothstep, dist, sampleCamera } from './camera-path.js';

const VB = { w: 2200, h: 1300 };
const toSvg = (v) => [1100 - v[2] * 1000, 1250 - v[1] * 1000];

function wheel(cx) {
  const spokes = [0, 72, 144, 216, 288].map((a) => `<path d="M-14 -48 L-30 -208 L30 -208 L14 -48 Z" transform="rotate(${a})"/>`).join('');
  return `<g transform="translate(${cx} 950)">
    <circle r="300" fill="#08080a" stroke="#1d1d22" stroke-width="8"/>
    <circle r="262" fill="none" stroke="#131317" stroke-width="2"/>
    <circle r="214" fill="#0d0d10" stroke="#3b3b44" stroke-width="12"/>
    <g fill="#24242a">${spokes}</g>
    <circle r="150" fill="none" stroke="#5a5a64" stroke-width="5" stroke-dasharray="16 9"/>
    <circle r="50" fill="#1a1a1f" stroke="#3b3b44" stroke-width="4"/>
  </g>`;
}

export function bikeMarkup(uid = 'hb') {
  return `
  <defs>
    <linearGradient id="${uid}-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34343c"/><stop offset=".55" stop-color="#1b1b20"/><stop offset="1" stop-color="#0f0f12"/></linearGradient>
    <linearGradient id="${uid}-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b6470" stop-opacity=".55"/><stop offset="1" stop-color="#0c0c0f" stop-opacity=".9"/></linearGradient>
    <radialGradient id="${uid}-flare"><stop offset="0" stop-color="#fff"/><stop offset=".18" stop-color="var(--hero-headlight, #dcebff)" stop-opacity=".75"/><stop offset="1" stop-color="var(--hero-headlight, #dcebff)" stop-opacity="0"/></radialGradient>
    <radialGradient id="${uid}-shadow"><stop offset="0" stop-color="#000" stop-opacity=".8"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="1110" cy="1252" rx="1040" ry="34" fill="url(#${uid}-shadow)"/>
  ${wheel(1820)}
  <path d="M1130 790 L1820 922 L1820 978 L1150 862 Z" fill="#1c1c21" stroke="#34343c" stroke-width="4"/>
  <path d="M1080 880 L1560 788 L1626 826 L1604 874 L1120 932 Z" fill="#2c2c33" stroke="#44444d" stroke-width="3"/>
  <path d="M1560 788 L1626 826 L1604 874 L1548 840 Z" fill="#101013"/>
  ${wheel(400)}
  <path d="M190 792 Q380 560 622 762 L586 792 Q380 642 240 816 Z" fill="#1f1f25" stroke="#3a3a42" stroke-width="3"/>
  <path d="M548 500 L400 950" stroke="#4a4a54" stroke-width="30" stroke-linecap="round"/>
  <path d="M500 646 L400 950" stroke="#9a8440" stroke-width="16" stroke-linecap="round" opacity=".55"/>
  <path class="hb-body" d="M265 585 L430 462 L560 190 L640 215 L700 330 C800 290 940 300 1040 400 L1280 430 L1500 340 L1800 270 L1760 330 L1480 440 L1300 520 L1180 600 L1150 780 L1000 900 L720 900 L690 780 L600 690 L470 640 L330 628 Z" fill="url(#${uid}-body)" stroke="#45454e" stroke-width="3" stroke-linejoin="round"/>
  <path d="M430 462 L560 190 L640 215 L700 330 L604 424 Z" fill="url(#${uid}-glass)" stroke="#565660" stroke-width="2"/>
  <path d="M1040 400 L1280 430 L1500 340 L1486 386 L1290 470 L1070 440 Z" fill="#0b0b0d"/>
  <path d="M760 520 L1090 560 L1120 760 L990 860 L760 860 L720 760 Z" fill="#101013" stroke="#2b2b31" stroke-width="3"/>
  <path d="M800 600 h230 M800 660 h250 M800 720 h240 M800 780 h200" stroke="#26262c" stroke-width="10" stroke-linecap="round"/>
  <path d="M452 548 L900 640 L1150 596" fill="none" stroke="var(--color-accent, #e10600)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M470 600 L800 668" fill="none" stroke="var(--color-accent, #e10600)" stroke-width="3" opacity=".6"/>
  <path class="hb-lamp" d="M287 594 L428 496 L452 540 L332 620 Z" fill="var(--hero-headlight, #dcebff)"/>
  <path d="M1716 286 L1800 270 L1770 316 Z" fill="var(--color-accent, #e10600)"/>
  <path class="hb-rim" d="M265 585 L430 462 L560 190 L640 215 L700 330 C800 290 940 300 1040 400 L1280 430 L1500 340 L1800 270" fill="none" stroke="var(--hero-rim, #e10600)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
  <circle class="hb-flare" cx="350" cy="566" r="230" fill="url(#${uid}-flare)" style="mix-blend-mode:screen"/>`;
}

/** Static inline silhouette (poster fallback). */
export function staticSilhouette(uid = 'hbp') {
  return `<svg class="hero__sil" viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${bikeMarkup(uid)}</svg>`;
}

/** Scroll-driven silhouette renderer with the same interface as the 3D scene. */
export function createSilhouette(stage, cfg, kfs) {
  stage.insertAdjacentHTML('beforeend', `<svg class="hero__sil" viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${cfg.bike.name}"><g class="hb-root">${bikeMarkup('hb')}</g></svg>`);
  const svg = stage.querySelector('svg.hero__sil');
  const root = svg.querySelector('.hb-root');
  const flare = svg.querySelector('.hb-flare');
  const rim = svg.querySelector('.hb-rim');
  const lamp = svg.querySelector('.hb-lamp');

  const d0 = (() => { const c = sampleCamera(kfs, 0); return dist(c.position, c.lookAt); })();
  const d1 = (() => { const c = sampleCamera(kfs, 1); return dist(c.position, c.lookAt); })();
  const maxZoom = 3.3;
  const nose = [345, 560];
  const centre = [VB.w / 2, VB.h / 2];

  return {
    kind: 'silhouette',
    update(p, cam, time, raw) {
      // zoom follows the keyframed camera distance: close camera = big zoom on the nose
      const c = raw || cam;
      const r = d1 > d0 ? smoothstep(d0, d1, dist(c.position, c.lookAt)) : p;
      const zoom = maxZoom + (1 - maxZoom) * r;
      const portrait = stage.clientWidth < stage.clientHeight;
      const lift = portrait ? -60 * r : 0;
      const fx = nose[0] + (centre[0] - nose[0]) * r;
      const fy = nose[1] + (centre[1] + lift - nose[1]) * r;
      root.setAttribute('transform', `translate(${centre[0]} ${centre[1]}) scale(${zoom.toFixed(4)}) translate(${(-fx).toFixed(2)} ${(-fy).toFixed(2)})`);
      const pulse = 0.65 + 0.35 * Math.sin(time * 3.2);
      const flareK = (1 - smoothstep(0.12, 0.3, p)) * pulse;
      flare.style.opacity = flareK.toFixed(3);
      lamp.style.opacity = (0.55 + 0.45 * flareK).toFixed(3);
      rim.style.opacity = (0.12 + 0.88 * smoothstep(0.1, 0.9, p)).toFixed(3);
    },
    /** model-space point → stage pixel position */
    project(v) {
      const m = root.getScreenCTM();
      if (!m) return null;
      const [x, y] = toSvg(v);
      const pt = new DOMPoint(x, y).matrixTransform(m);
      const b = stage.getBoundingClientRect();
      return { x: pt.x - b.left, y: pt.y - b.top, visible: true };
    },
    dispose() { svg.remove(); },
  };
}
