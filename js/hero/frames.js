/* Image-sequence hero renderer (hero.mode = "frames").

   Built for smooth slow scrolling:
   - The canvas keeps the frames' own pixel size and is scaled by CSS, so the GPU does the
     resizing instead of JavaScript.
   - Frames around the current scroll position are kept pre-decoded (ImageBitmap) so drawing
     never waits for an image to decode. Frames far away are released again to save memory.
   - Neighbouring frames are cross-faded, so motion stays fluid between two real frames. */
import { asset } from '../core/util.js';

const frameUrl = (pattern, i) => asset(pattern).replace(/#+/, (m) => String(i).padStart(m.length, '0'));

// Frames are kept as compressed blobs and decoded with createImageBitmap(blob), which the browser
// does off the main thread, so decoding never stalls the scroll, however fast it is.
const loadImg = async (src, priority = 'low') => {
  // bulk frames are low priority: they must not compete with CSS, fonts and the first frame
  const res = await fetch(src, { priority });
  if (!res.ok) throw new Error(`frame missing: ${src}`);
  return res.blob();
};

const toBitmap = (blob) => {
  if (window.createImageBitmap) return createImageBitmap(blob);
  return new Promise((resolve, reject) => { // very old browsers: plain image element
    const im = new Image();
    const url = URL.createObjectURL(blob);
    im.onload = () => { URL.revokeObjectURL(url); resolve(im); };
    im.onerror = reject;
    im.src = url;
  });
};

/** Resolves to a renderer, or throws if the first frame does not exist. */
export async function createFrames(stage, cfg, { onProgress }) {
  const f = cfg.frames || {};
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const pattern = (mobile && f.mobile) || f.desktop;
  const total = Math.max(1, f.count | 0);                      // files on disk
  const step = Math.max(1, (mobile ? f.mobileStep : f.desktopStep) | 0 || 1); // use every Nth file (lighter download)
  const count = Math.ceil(total / step);                       // frames actually used
  const fileNo = (i) => Math.min(total, 1 + i * step);
  if (!pattern) throw new Error('hero.frames pattern missing');
  const view = (f.view && (mobile ? f.view.mobile : f.view.desktop)) || {};
  const blend = f.blend !== false;
  const radius = Math.max(2, Math.min(f.preload | 0 || 12, mobile ? 8 : 40)); // decoded frames kept on each side of the current one

  const imgs = new Array(count);          // downloaded (still compressed) frames
  const bitmaps = new Map();              // frame index → decoded bitmap, only near the current position
  const pending = new Set();
  imgs[0] = await loadImg(frameUrl(pattern, 1), 'high'); // throws → caller falls back
  bitmaps.set(0, await toBitmap(imgs[0]));
  const first = bitmaps.get(0);
  const FW = first.naturalWidth || first.width, FH = first.naturalHeight || first.height;

  // Two stacked layers: A (bottom) shows even frames, B (top) shows odd frames. The blend between
  // two frames is just B's CSS opacity, so the GPU does it and each frame is drawn only once.
  const canvas = document.createElement('div');
  canvas.className = 'hero__canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', cfg.bike.name);
  canvas.style.position = 'absolute';
  canvas.style.maxWidth = 'none';
  const makeLayer = () => {
    const c = document.createElement('canvas');
    c.width = FW;
    c.height = FH;
    Object.assign(c.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
    canvas.appendChild(c);
    return { ctx: c.getContext('2d', { alpha: false }), el: c, idx: -1 };
  };
  const A = makeLayer(), B = makeLayer();
  B.el.style.opacity = '0';
  B.el.style.willChange = 'opacity';
  stage.appendChild(canvas);

  let last = -1, dirty = true, centre = 0;
  A.ctx.drawImage(bitmaps.get(0), 0, 0, FW, FH); // first frame straight away
  A.idx = 0;

  // framing from config (hero.frames.view): cover/contain, zoom, focus point, vertical offset
  const layout = () => {
    const W = stage.clientWidth || 1, H = stage.clientHeight || 1;
    const fit = view.fit === 'contain' ? Math.min : Math.max;
    const s = fit(W / FW, H / FH) * (view.zoom || 1);
    const w = FW * s, h = FH * s;
    const focus = view.focus || [0.5, 0.5];
    let x = W / 2 - focus[0] * w;
    let y = H / 2 + (view.offsetY || 0) * H - focus[1] * h;
    if (w >= W) x = Math.min(0, Math.max(W - w, x)); // never show a gap where the image could cover
    if (h >= H) y = Math.min(0, Math.max(H - h, y));
    Object.assign(canvas.style, { width: `${w}px`, height: `${h}px`, left: `${x}px`, top: `${y}px` });
    // image is a band (e.g. phones): melt its top and bottom edges into the page background
    const mask = h < H - 1 ? 'linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)' : '';
    canvas.style.maskImage = mask;
    canvas.style.webkitMaskImage = mask;
  };
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(stage);

  // download the rest in the background, a few at a time
  let loaded = 1;
  (async () => {
    const queue = Array.from({ length: count - 1 }, (_, i) => i + 1);
    const worker = async () => {
      while (queue.length) {
        const i = queue.shift();
        try { imgs[i] = await loadImg(frameUrl(pattern, fileNo(i))); } catch (e) { /* missing frame: nearest decoded one is used */ }
        loaded++;
        onProgress?.(loaded / count);
        dirty = true;
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
  })();

  const release = (b) => { if (b && b.close) b.close(); };

  // keep frames around `centre` decoded, nearest first, a few at a time
  const warm = () => {
    for (const [k, b] of bitmaps) {
      if (Math.abs(k - centre) > radius + 3 && k !== 0) { release(b); bitmaps.delete(k); }
    }
    for (let d = 0; d <= radius && pending.size < 4; d++) {
      for (const i of d ? [centre + d, centre - d] : [centre]) {
        if (i < 0 || i >= count || !imgs[i] || bitmaps.has(i) || pending.has(i) || pending.size >= 4) continue;
        pending.add(i);
        toBitmap(imgs[i]).then((b) => {
          pending.delete(i);
          if (Math.abs(i - centre) > radius + 3) release(b); else { bitmaps.set(i, b); dirty = true; }
        }, () => pending.delete(i));
      }
    }
  };

  const nearest = (i) => {
    for (let d = 1; d < count; d++) {
      if (bitmaps.has(i - d)) return bitmaps.get(i - d);
      if (bitmaps.has(i + d)) return bitmaps.get(i + d);
    }
    return null;
  };

  return {
    kind: 'frames',
    get busy() { return dirty || pending.size > 0; }, // still decoding → hero loop keeps ticking
    update(p) {
      const pos = Math.min(count - 1, Math.max(0, p * (count - 1)));
      const i = blend ? Math.min(count - 1, Math.floor(pos)) : Math.round(pos);
      const mix = blend ? pos - i : 0;
      centre = i;
      warm();
      const key = Math.round(pos * 40); // opacity steps between two frames
      if (key === last && !dirty) return;
      last = key;
      dirty = false;
      // which frame each layer should hold: A = the even one of (i, i+1), B = the odd one
      const even = i % 2 === 0 ? i : i + 1;
      const odd = i % 2 === 1 ? i : i + 1;
      const paint = (layer, idx, isBase) => {
        if (idx > count - 1) return false;
        if (layer.idx === idx) return true;
        const bm = bitmaps.get(idx) || (isBase && layer.idx < 0 ? nearest(idx) : null);
        if (!bm) { dirty = true; return false; } // still decoding → try again next tick
        layer.ctx.drawImage(bm, 0, 0, FW, FH);
        layer.idx = bitmaps.has(idx) ? idx : -1;
        if (layer.idx < 0) dirty = true;
        return true;
      };
      const baseIsA = i % 2 === 0;
      const okA = paint(A, even, baseIsA);
      const okB = paint(B, odd, !baseIsA);
      // B sits on top: its opacity is how much of the odd frame shows
      let opB = baseIsA ? mix : 1 - mix;
      if (!okB || B.idx !== odd) opB = 0; // odd frame not ready → show A only
      if ((!okA || A.idx !== even) && B.idx === odd) opB = 1; // even frame not ready → show B only
      const o = opB.toFixed(3);
      if (B.el.style.opacity !== o) B.el.style.opacity = o;
    },
    project: null, // no 3D data → callouts are shown as a list
    dispose() {
      ro.disconnect();
      bitmaps.forEach(release);
      bitmaps.clear();
      canvas.remove();
    },
  };
}
