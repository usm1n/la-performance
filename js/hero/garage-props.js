/* 3D garage props for the hero backdrop (config.hero.backdrop.props).
   Every prop is real geometry built from code (no files to download), so it has depth,
   catches the studio lights and moves correctly as the camera orbits.

   Each prop is built around its own centre on the floor with its FRONT facing +Z.
   Config places it with position [x, z] (metres) and rotation (degrees, around the vertical axis). */
import * as THREE from 'three';

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* Shared geometry + material cache for one backdrop build. */
function context(o, glow) {
  const cache = new Map();
  return {
    accent: o.accentColor,
    strip: o.stripColor,
    glow,
    wallHeight: o.wallHeight,
    unitBox: new THREE.BoxGeometry(1, 1, 1),
    unitCyl: new THREE.CylinderGeometry(1, 1, 1, 28),
    tyreGeo: new THREE.TorusGeometry(0.2, 0.1, 12, 28), // ~0.6 m sport-bike tyre
    mat(color, roughness = 0.6, metalness = 0.2) {
      const k = `${color}|${roughness}|${metalness}`;
      if (!cache.has(k)) cache.set(k, new THREE.MeshStandardMaterial({ color, roughness, metalness }));
      return cache.get(k);
    },
    glowMat(color, strength = 1) {
      const k = `glow|${color}|${strength}`;
      if (!cache.has(k)) cache.set(k, new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: strength * glow, roughness: 1 }));
      return cache.get(k);
    },
  };
}

function box(g, c, w, h, d, x, y, z, m) {
  const mesh = new THREE.Mesh(c.unitBox, m);
  mesh.scale.set(w, h, d);
  mesh.position.set(x, y, z);
  g.add(mesh);
  return mesh;
}

function cyl(g, c, r, len, x, y, z, m, axis = 'y') {
  const mesh = new THREE.Mesh(c.unitCyl, m);
  mesh.scale.set(r, len, r);
  mesh.position.set(x, y, z);
  if (axis === 'x') mesh.rotation.z = Math.PI / 2;
  if (axis === 'z') mesh.rotation.x = Math.PI / 2;
  g.add(mesh);
  return mesh;
}

/* ---------- roller tool cabinet with a top chest ---------- */
function drawers(g, c, w, h, n, cy, zFront, paint) {
  const dh = h / n;
  const chrome = c.mat('#c9ccd1', 0.25, 1);
  for (let i = 0; i < n; i++) {
    const y = cy - h / 2 + dh * (i + 0.5);
    box(g, c, w, dh - 0.022, 0.014, 0, y, zFront + 0.007, paint);
    box(g, c, w * 0.9, 0.016, 0.022, 0, y + dh * 0.3, zFront + 0.022, chrome);
  }
}

function toolChest(c, p) {
  const g = new THREE.Group();
  const W = 1.05, D = 0.5;
  const paint = c.mat(p.color || c.accent, 0.32, 0.45);
  const shell = c.mat('#0b0b0d', 0.5, 0.6);
  const rubber = c.mat('#050505', 0.9, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => cyl(g, c, 0.05, 0.04, sx * (W / 2 - 0.09), 0.05, sz * (D / 2 - 0.08), rubber, 'x'));
  box(g, c, W, 0.82, D, 0, 0.51, 0, paint);
  box(g, c, W - 0.05, 0.77, 0.01, 0, 0.51, D / 2 + 0.001, shell);       // dark recess behind the drawer fronts
  drawers(g, c, W - 0.09, 0.74, 5, 0.51, D / 2, paint);
  box(g, c, W + 0.02, 0.025, D + 0.02, 0, 0.932, 0, shell);              // rubber work mat
  const TW = 0.98, TD = 0.42, tz = -0.03;
  box(g, c, TW, 0.42, TD, 0, 1.155, tz, paint);
  box(g, c, TW - 0.05, 0.37, 0.01, 0, 1.155, tz + TD / 2 + 0.001, shell);
  drawers(g, c, TW - 0.09, 0.34, 3, 1.155, tz + TD / 2, paint);
  box(g, c, 0.03, 0.03, D * 0.7, W / 2 + 0.04, 0.8, 0, c.mat('#c9ccd1', 0.25, 1)); // push handle
  return { g, foot: [W, D] };
}

/* ---------- workbench with pegboard, tuning laptop and a helmet ---------- */
function pegboardTexture(accent) {
  return canvasTexture(1024, 512, (g, w, h) => {
    g.fillStyle = '#1d1e22';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.55)';
    for (let y = 12; y < h; y += 24) for (let x = 12; x < w; x += 24) { g.beginPath(); g.arc(x, y, 2.4, 0, 6.3); g.fill(); }
    // spanners, largest to smallest
    g.strokeStyle = '#9da1a8';
    g.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const x = 70 + i * 46, len = 250 - i * 18;
      g.lineWidth = 13 - i * 0.7;
      g.beginPath(); g.moveTo(x, 120); g.lineTo(x, 120 + len); g.stroke();
      g.lineWidth = 6;
      g.beginPath(); g.arc(x, 108, 15 - i * 0.8, 0.6, 2.55, true); g.stroke();
      g.beginPath(); g.arc(x, 132 + len, 12 - i * 0.6, 0, 6.3); g.stroke();
    }
    // screwdrivers with accent handles
    for (let i = 0; i < 6; i++) {
      const x = 560 + i * 40;
      g.strokeStyle = '#9da1a8'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(x, 220); g.lineTo(x, 380); g.stroke();
      g.strokeStyle = i % 2 ? '#111' : accent; g.lineWidth = 17;
      g.beginPath(); g.moveTo(x, 120); g.lineTo(x, 210); g.stroke();
    }
    // hammer + mallet
    g.strokeStyle = '#3a2a1c'; g.lineWidth = 14;
    g.beginPath(); g.moveTo(850, 150); g.lineTo(850, 400); g.stroke();
    g.beginPath(); g.moveTo(940, 150); g.lineTo(940, 400); g.stroke();
    g.fillStyle = '#9da1a8'; g.fillRect(812, 110, 90, 44);
    g.fillStyle = '#111'; g.fillRect(900, 104, 82, 56);
    // light falling from the LED strip above
    const lit = g.createLinearGradient(0, 0, 0, h);
    lit.addColorStop(0, 'rgba(255,255,255,0.22)');
    lit.addColorStop(0.5, 'rgba(255,255,255,0.03)');
    lit.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = lit;
    g.fillRect(0, 0, w, h);
  });
}

function laptopTexture(accent) {
  return canvasTexture(512, 320, (g, w, h) => {
    g.fillStyle = '#07080a';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = 1;
    for (let x = 40; x < w; x += 48) { g.beginPath(); g.moveTo(x, 30); g.lineTo(x, h - 40); g.stroke(); }
    for (let y = 30; y < h - 30; y += 40) { g.beginPath(); g.moveTo(40, y); g.lineTo(w - 24, y); g.stroke(); }
    const curve = (color, peak, sag) => {
      g.strokeStyle = color; g.lineWidth = 4;
      g.beginPath();
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const y = h - 46 - (Math.sin(t * Math.PI * 0.62) * peak - Math.max(0, t - 0.8) * sag) * (h - 90);
        if (i) g.lineTo(40 + t * (w - 70), y); else g.moveTo(40, y);
      }
      g.stroke();
    };
    curve('#e8e8e8', 0.68, 0.5);  // stock
    curve(accent, 0.95, 0.4);     // tuned
    g.fillStyle = '#e8e8e8';
    g.font = '600 20px system-ui, sans-serif';
    g.fillText('DYNO RUN 03', 44, 24);
  });
}

function workbench(c, p) {
  const g = new THREE.Group();
  const W = p.width || 2.0, D = 0.65, H = 0.9;
  const steel = c.mat('#1a1b1f', 0.5, 0.7);
  const top = c.mat('#2b2622', 0.75, 0.05);
  box(g, c, W, 0.05, D, 0, H, 0, top);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => box(g, c, 0.05, H, 0.05, sx * (W / 2 - 0.04), H / 2, sz * (D / 2 - 0.04), steel));
  box(g, c, W - 0.1, 0.03, D - 0.1, 0, 0.2, 0, steel);                                          // lower shelf
  box(g, c, 0.5, 0.46, D - 0.08, W / 2 - 0.32, H - 0.26, 0, c.mat(p.color || c.accent, 0.35, 0.45)); // drawer unit
  box(g, c, 0.4, 0.012, 0.02, W / 2 - 0.32, H - 0.12, D / 2 - 0.02, c.mat('#c9ccd1', 0.25, 1));
  box(g, c, 0.4, 0.012, 0.02, W / 2 - 0.32, H - 0.34, D / 2 - 0.02, c.mat('#c9ccd1', 0.25, 1));
  box(g, c, 0.36, 0.26, 0.3, -W / 2 + 0.35, 0.35, 0, c.mat('#101114', 0.6, 0.3));                // crate on the shelf
  // pegboard on the wall behind, lit by an LED strip under a small shelf
  const peg = pegboardTexture(c.accent);
  const board = new THREE.Mesh(c.unitBox, new THREE.MeshStandardMaterial({ map: peg, emissive: 0xffffff, emissiveMap: peg, emissiveIntensity: 0.4 * c.glow, roughness: 0.9, metalness: 0 }));
  board.scale.set(W, 1.0, 0.03);
  board.position.set(0, H + 0.62, -D / 2 + 0.015);
  g.add(board);
  box(g, c, W, 0.03, 0.24, 0, H + 1.16, -D / 2 + 0.12, steel);
  box(g, c, W - 0.12, 0.018, 0.03, 0, H + 1.136, -D / 2 + 0.2, c.glowMat(c.strip, 1.4));
  // tuning laptop
  const lx = -W / 2 + 0.55;
  box(g, c, 0.36, 0.016, 0.25, lx, H + 0.033, 0.05, c.mat('#2a2b30', 0.4, 0.8));
  const lap = laptopTexture(c.accent);
  const screen = new THREE.Mesh(c.unitBox, [0, 1, 2, 3, 4, 5].map((i) => (i === 4
    ? new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: lap, emissiveIntensity: 0.9 * c.glow, roughness: 0.3 })
    : c.mat('#2a2b30', 0.4, 0.8))));
  screen.scale.set(0.36, 0.23, 0.01);
  screen.position.set(lx, H + 0.15, -0.1);
  screen.rotation.x = -0.26;
  g.add(screen);
  // helmet
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.135, 28, 20), new THREE.MeshPhysicalMaterial({ color: p.color || c.accent, roughness: 0.25, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 }));
  helmet.scale.set(1, 0.96, 1.12);
  helmet.position.set(0.12, H + 0.155, 0.02);
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.137, 24, 12, Math.PI / 2 - 0.95, 1.9, 1.05, 0.62), c.mat('#050506', 0.1, 0.9));
  visor.scale.copy(helmet.scale);
  visor.position.copy(helmet.position);
  g.add(helmet, visor);
  // oil bottles + spray cans
  [[0.48, 0.045, 0.2, '#101114'], [0.58, 0.035, 0.17, '#d8d8d8'], [0.66, 0.035, 0.17, c.accent]].forEach(([x, r, h, col]) => cyl(g, c, r, h, x, H + 0.025 + h / 2, -0.12, c.mat(col, 0.4, 0.2)));
  return { g, foot: [W, D] };
}

/* ---------- tyres ---------- */
const TYRE_JITTER = [0.02, -0.03, 0.015, -0.01, 0.025, -0.02, 0.01, -0.025];

function tyreStack(c, p) {
  const g = new THREE.Group();
  const rubber = c.mat('#0c0c0d', 0.82, 0);
  const n = Math.max(1, p.count || 4);
  for (let i = 0; i < n; i++) {
    const t = new THREE.Mesh(c.tyreGeo, rubber);
    t.rotation.x = Math.PI / 2;
    t.position.set(TYRE_JITTER[i % 8], 0.1 + i * 0.2, TYRE_JITTER[(i + 3) % 8]);
    g.add(t);
  }
  return { g, foot: [0.62, 0.62] };
}

function tyreRack(c, p) {
  const g = new THREE.Group();
  const W = p.width || 1.7, H = 2.15, D = 0.45;
  const steel = c.mat('#1c1d21', 0.45, 0.75);
  const rubber = c.mat('#0c0c0d', 0.82, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => box(g, c, 0.04, H, 0.04, sx * W / 2, H / 2, sz * D / 2, steel));
  const perShelf = Math.floor((W - 0.12) / 0.215);
  [0.22, 1.1].forEach((y, row) => {
    [-1, 1].forEach((sz) => box(g, c, W, 0.04, 0.04, 0, y, sz * (D / 2 - 0.08), steel));
    for (let i = 0; i < perShelf; i++) {
      const t = new THREE.Mesh(c.tyreGeo, rubber);
      t.rotation.y = Math.PI / 2 + TYRE_JITTER[(i + row * 3) % 8] * 2;
      t.position.set(-((perShelf - 1) * 0.215) / 2 + i * 0.215, y + 0.02 + 0.3, 0);
      g.add(t);
    }
  });
  [-1, 1].forEach((sz) => box(g, c, W, 0.04, 0.04, 0, H, sz * D / 2, steel));
  [-1, 1].forEach((sx) => box(g, c, 0.04, 0.04, D, sx * W / 2, H, 0, steel));
  return { g, foot: [W, D] };
}

/* ---------- oil drum ---------- */
function oilDrum(c, p) {
  const g = new THREE.Group();
  const paint = c.mat(p.color || '#15161a', 0.45, 0.6);
  cyl(g, c, 0.29, 0.88, 0, 0.44, 0, paint);
  [0.02, 0.3, 0.58, 0.86].forEach((y) => cyl(g, c, 0.298, 0.022, 0, y + 0.011, 0, paint));
  cyl(g, c, 0.27, 0.012, 0, 0.872, 0, c.mat('#08080a', 0.5, 0.7));
  cyl(g, c, 0.03, 0.02, 0.17, 0.89, 0.05, c.mat('#c9ccd1', 0.3, 1));
  cyl(g, c, 0.292, 0.12, 0, 0.44, 0, c.mat(p.bandColor || c.accent, 0.5, 0.3)); // painted band
  return { g, foot: [0.6, 0.6] };
}

/* ---------- dyno cooling fan ---------- */
function dynoFan(c, p) {
  const g = new THREE.Group();
  const R = 0.5, cy = 0.8;
  const dark = c.mat('#141518', 0.45, 0.7);
  const chrome = c.mat('#b9bcc2', 0.3, 1);
  const ring = c.mat(p.color || c.accent, 0.35, 0.5);
  const shroud = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.32, 36, 1, true), new THREE.MeshStandardMaterial({ color: '#141518', roughness: 0.45, metalness: 0.7, side: THREE.DoubleSide }));
  shroud.rotation.x = Math.PI / 2;
  shroud.position.y = cy;
  g.add(shroud);
  [0.16, -0.16].forEach((z, i) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(R, 0.025, 10, 40), i ? dark : ring);
    t.position.set(0, cy, z);
    g.add(t);
  });
  [0.78, 0.54, 0.3].forEach((k) => {
    const t = new THREE.Mesh(new THREE.TorusGeometry(R * k, 0.006, 6, 36), chrome);
    t.position.set(0, cy, 0.16);
    g.add(t);
  });
  for (let i = 0; i < 4; i++) {
    const bar = box(g, c, 2 * R, 0.008, 0.008, 0, cy, 0.16, chrome);
    bar.rotation.z = (i * Math.PI) / 4;
  }
  cyl(g, c, 0.09, 0.16, 0, cy, 0, dark, 'z');
  for (let i = 0; i < 6; i++) {
    const arm = new THREE.Group();
    arm.position.y = cy;
    arm.rotation.z = (i * Math.PI) / 3 + 0.2;
    const blade = box(arm, c, 0.17, R * 0.78, 0.012, 0, R * 0.48, 0, c.mat('#2a2c31', 0.35, 0.8));
    blade.rotation.y = 0.55;
    g.add(arm);
  }
  [-1, 1].forEach((sx) => {
    box(g, c, 0.05, cy, 0.05, sx * (R + 0.05), cy / 2, 0, dark);
    box(g, c, 0.05, 0.05, 0.75, sx * (R + 0.05), 0.025, 0, dark);
  });
  box(g, c, 2 * R + 0.15, 0.05, 0.05, 0, 0.22, 0, dark);
  return { g, foot: [1.15, 0.75] };
}

/* ---------- roller shutter door (sits flat against a wall) ---------- */
function shutterDoor(c, p) {
  const g = new THREE.Group();
  const W = p.width || 3.4, H = p.height || 3.0;
  const slats = canvasTexture(64, 1024, (x, w, h) => {
    const n = Math.round(H / 0.09), sh = h / n;
    for (let i = 0; i < n; i++) {
      const gr = x.createLinearGradient(0, i * sh, 0, (i + 1) * sh);
      gr.addColorStop(0, '#53565d');
      gr.addColorStop(0.45, '#2c2e33');
      gr.addColorStop(0.9, '#16171a');
      gr.addColorStop(1, '#050506');
      x.fillStyle = gr;
      x.fillRect(0, i * sh, w, sh + 1);
    }
    const shade = x.createLinearGradient(0, 0, 0, h);
    shade.addColorStop(0, 'rgba(0,0,0,0.1)');
    shade.addColorStop(1, 'rgba(0,0,0,0.55)');
    x.fillStyle = shade;
    x.fillRect(0, 0, w, h);
  });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: slats, color: p.color || '#ffffff', roughness: 0.5, metalness: 0.65 }));
  door.position.set(0, H / 2, 0.03);
  g.add(door);
  const steel = c.mat('#131417', 0.5, 0.7);
  [-1, 1].forEach((sx) => box(g, c, 0.14, H, 0.14, sx * (W / 2 + 0.07), H / 2, 0.07, steel));
  box(g, c, W + 0.3, 0.36, 0.32, 0, H + 0.18, 0.16, steel);                    // roller housing
  box(g, c, W, 0.08, 0.06, 0, 0.04, 0.05, c.mat(c.accent, 0.5, 0.3));          // bottom rail
  box(g, c, W * 0.7, 0.025, 0.04, 0, H - 0.02, 0.3, c.glowMat(c.strip, 1.2));  // work light under the housing
  return { g, foot: null };
}

/* ---------- steel lockers ---------- */
function locker(c, p) {
  const g = new THREE.Group();
  const n = Math.max(1, p.count || 2), w = 0.45, H = 1.95, D = 0.45;
  const W = n * w;
  const body = c.mat(p.color || '#17181c', 0.5, 0.6);
  const dark = c.mat('#060607', 0.6, 0.4);
  const chrome = c.mat('#c9ccd1', 0.25, 1);
  box(g, c, W, H, D, 0, H / 2, 0, body);
  for (let i = 0; i < n; i++) {
    const x = -W / 2 + w * (i + 0.5);
    box(g, c, w - 0.03, H - 0.08, 0.012, x, H / 2, D / 2 + 0.006, body);
    box(g, c, w - 0.03, H - 0.08, 0.004, x, H / 2, D / 2 + 0.001, dark).scale.x = w - 0.01; // seam shadow
    for (let v = 0; v < 4; v++) box(g, c, w * 0.5, 0.012, 0.004, x, H - 0.2 - v * 0.04, D / 2 + 0.014, dark);
    box(g, c, 0.02, 0.12, 0.025, x + w * 0.3, H * 0.52, D / 2 + 0.024, chrome);
  }
  box(g, c, W, 0.03, 0.012, 0, H * 0.7, D / 2 + 0.013, c.mat(c.accent, 0.4, 0.4)); // accent stripe
  return { g, foot: [W, D] };
}

/* ---------- structural column with a hazard-striped base ---------- */
function pillar(c, p) {
  const g = new THREE.Group();
  const S = p.size || 0.35, H = p.height || c.wallHeight;
  box(g, c, S, H, S, 0, H / 2, 0, c.mat('#191a1e', 0.6, 0.6));
  const hazard = canvasTexture(128, 256, (x, w, h) => {
    x.fillStyle = '#0a0a0b';
    x.fillRect(0, 0, w, h);
    x.strokeStyle = c.accent;
    x.lineWidth = 22;
    for (let y = -w; y < h + w; y += 64) { x.beginPath(); x.moveTo(-10, y + w); x.lineTo(w + 10, y); x.stroke(); }
  });
  const base = new THREE.Mesh(c.unitBox, new THREE.MeshStandardMaterial({ map: hazard, roughness: 0.7, metalness: 0.1 }));
  base.scale.set(S + 0.02, 1.1, S + 0.02);
  base.position.y = 0.55;
  g.add(base);
  return { g, foot: [S, S] };
}

const BUILDERS = { toolChest, workbench, tyreStack, tyreRack, oilDrum, dynoFan, shutterDoor, locker, pillar };

export const PROP_TYPES = Object.keys(BUILDERS);

/* Used when config.hero.backdrop.props is missing. Side wall is at x = -5.5, back wall at z = -6.5. */
export const DEFAULT_PROPS = [
  { type: 'tyreStack', position: [-4.9, 2.7] },
  { type: 'toolChest', position: [-5.15, 3.9], rotation: 90 },
  { type: 'oilDrum', position: [-5.05, 5.2] },
  { type: 'oilDrum', position: [-4.75, 5.9] },
  { type: 'workbench', position: [-5.1, -4.1], rotation: 90 },
  { type: 'tyreRack', position: [-4.2, -6.2] },
  { type: 'locker', position: [-2.2, -6.22] },
  { type: 'shutterDoor', position: [2.7, -6.48] },
  { type: 'dynoFan', position: [1.5, -3.8], rotation: 15 },
];

/* Adds the props to `group`. Returns how many were built. */
export function buildProps(group, list, o, glow) {
  const c = context(o, glow);
  const shadowTex = canvasTexture(128, 128, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, 'rgba(0,0,0,0.8)');
    r.addColorStop(0.55, 'rgba(0,0,0,0.5)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, w, h);
  });
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  let built = 0;
  (list || []).forEach((p) => {
    const make = BUILDERS[p && p.type];
    if (!make) {
      if (p && p.type) console.warn(`[hero.backdrop.props] unknown type "${p.type}". Known: ${PROP_TYPES.join(', ')}`);
      return;
    }
    const { g, foot } = make(c, p);
    const holder = new THREE.Group();
    holder.name = `prop-${p.type}`;
    holder.add(g);
    if (foot) { // soft contact shadow so the prop sits on the floor instead of floating
      const s = new THREE.Mesh(new THREE.PlaneGeometry(foot[0] + 0.7, foot[1] + 0.7), shadowMat);
      s.rotation.x = -Math.PI / 2;
      s.position.y = 0.008;
      s.renderOrder = 1;
      holder.add(s);
    }
    const pos = p.position || [0, 0];
    holder.position.set(pos[0] || 0, p.y || 0, pos[1] || 0);
    holder.rotation.y = ((p.rotation || 0) * Math.PI) / 180;
    if (p.scale) holder.scale.setScalar(p.scale);
    group.add(holder);
    built++;
  });
  return built;
}
