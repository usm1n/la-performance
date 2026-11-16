/* Procedural 3D backdrop for the hero (config.hero.backdrop).
   type "garage": a dark tuning-bay set built from code — glossy floor with bay markings,
   two walls (behind the bike and behind its side profile) with LED strips and a glowing
   wall sign. No image files needed; colours and texts come from the config. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { buildProps, DEFAULT_PROPS } from './garage-props.js';
import { asset } from '../core/util.js';

const WALL_W = 26;   // metres
const WALL_H = 7;
const SIDE_X = -5.5; // wall seen behind the side-profile shot
const BACK_Z = -6.5; // wall seen behind the nose close-up
const FLOOR = 28;

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function texture(c, srgb = true, aniso = 8) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  return t;
}

function speckle(g, w, h, n, alpha) {
  for (let i = 0; i < n; i++) {
    const v = Math.random() > 0.5 ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${Math.random() * alpha})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

function checker(g, x, y, w, h, cell, a = '#e9e9e9', b = '#0a0a0b') {
  const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    g.fillStyle = (r + c) % 2 ? a : b;
    g.fillRect(x + c * cell, y + r * cell, Math.min(cell, w - c * cell), Math.min(cell, h - r * cell));
  }
}

/* ---------- floor: sealed concrete with a painted bay around the bike ---------- */
function floorTexture(o) {
  const S = 2048, ppm = S / FLOOR; // pixels per metre
  const [c, g] = canvas(S, S);
  const cx = S / 2, cy = S / 2;    // canvas x = world x, canvas y (down) = world +z (towards the nose)
  g.fillStyle = o.floorColor;
  g.fillRect(0, 0, S, S);
  speckle(g, S, S, 26000, 0.05);
  // slab joints
  g.strokeStyle = 'rgba(0,0,0,0.5)';
  g.lineWidth = 2;
  for (let m = -FLOOR / 2; m <= FLOOR / 2; m += 3) {
    g.beginPath(); g.moveTo(cx + m * ppm + 1.5 * ppm, 0); g.lineTo(cx + m * ppm + 1.5 * ppm, S); g.stroke();
    g.beginPath(); g.moveTo(0, cy + m * ppm + 1.5 * ppm); g.lineTo(S, cy + m * ppm + 1.5 * ppm); g.stroke();
  }
  if (o.showBay) {
    const bw = 2.0 * ppm, bh = 3.6 * ppm; // bay around the bike (bike lies along z)
    g.strokeStyle = o.accentColor;
    g.lineWidth = 0.07 * ppm;
    g.globalAlpha = 0.9;
    g.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
    // corner brackets, thicker
    g.lineWidth = 0.14 * ppm;
    const k = 0.45 * ppm;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
      const x = cx + sx * bw / 2, y = cy + sy * bh / 2;
      g.beginPath(); g.moveTo(x - sx * k, y); g.lineTo(x, y); g.lineTo(x, y - sy * k); g.stroke();
    });
    // hazard hatch strip behind the bay
    g.save();
    g.beginPath(); g.rect(cx - bw / 2, cy - bh / 2 - 0.5 * ppm, bw, 0.28 * ppm); g.clip();
    g.lineWidth = 0.1 * ppm;
    for (let x = -bw; x < bw * 2; x += 0.3 * ppm) {
      g.beginPath(); g.moveTo(cx - bw / 2 + x, cy - bh / 2 - 0.5 * ppm); g.lineTo(cx - bw / 2 + x - 0.3 * ppm, cy - bh / 2 - 0.2 * ppm); g.stroke();
    }
    g.restore();
    g.globalAlpha = 1;
    // long guide lines running out of the bay, like a dyno lane
    g.strokeStyle = 'rgba(235,235,235,0.5)';
    g.lineWidth = 0.05 * ppm;
    [-1, 1].forEach((s) => { g.beginPath(); g.moveTo(cx + s * 1.5 * ppm, 0); g.lineTo(cx + s * 1.5 * ppm, S); g.stroke(); });
  }
  if (o.showChecker) {
    g.globalAlpha = 0.85;
    checker(g, cx - 1.5 * ppm, cy + 2.2 * ppm, 3 * ppm, 0.4 * ppm, 0.2 * ppm);
    g.globalAlpha = 1;
  }
  // wear: darker towards the edges, lighter worn patch in the middle
  const grad = g.createRadialGradient(cx, cy, 1 * ppm, cx, cy, S * 0.6);
  grad.addColorStop(0, 'rgba(255,255,255,0.05)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
  grad.addColorStop(1, 'rgba(0,0,0,0.75)');
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  return texture(c);
}

/* ---------- walls: dark panels (colour map) + LED strips / sign (glow map) ---------- */
function wallTextures(o, { sign }) {
  const W = sign ? 4096 : 2048;
  const H = Math.round(W * WALL_H / WALL_W);
  const ppm = W / WALL_W;
  const yAt = (m) => H - m * ppm; // metres above the floor → canvas y
  const [c, g] = canvas(W, H);
  const [e, eg] = canvas(W, H);

  // colour: panels with seams, darker towards floor and ceiling
  g.fillStyle = o.wallColor;
  g.fillRect(0, 0, W, H);
  speckle(g, W, H, sign ? 30000 : 12000, 0.035);
  for (let m = 0; m <= WALL_W; m += 1.3) {
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.fillRect(m * ppm, 0, Math.max(2, 0.02 * ppm), H);
    g.fillStyle = 'rgba(255,255,255,0.035)';
    g.fillRect(m * ppm + Math.max(2, 0.02 * ppm), 0, Math.max(1, 0.01 * ppm), H);
  }
  // skirting band + accent pinstripe
  g.fillStyle = 'rgba(0,0,0,0.5)';
  g.fillRect(0, yAt(0.9), W, 0.9 * ppm);
  g.fillStyle = o.accentColor;
  g.globalAlpha = 0.85;
  g.fillRect(0, yAt(0.94), W, 0.04 * ppm);
  g.globalAlpha = 1;
  if (o.showChecker) {
    g.globalAlpha = 0.5;
    checker(g, 0, yAt(0.86), W, 0.16 * ppm, 0.08 * ppm, '#cfcfcf', '#0a0a0b');
    g.globalAlpha = 1;
  }
  const shade = g.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, 'rgba(0,0,0,0.8)');
  shade.addColorStop(0.35, 'rgba(0,0,0,0.1)');
  shade.addColorStop(0.8, 'rgba(0,0,0,0.15)');
  shade.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = shade;
  g.fillRect(0, 0, W, H);

  // glow map (black = no light)
  eg.fillStyle = '#000';
  eg.fillRect(0, 0, W, H);
  if (o.lightStrips) {
    const glowLine = (y, thick, color, blur) => {
      eg.save();
      eg.shadowColor = color; eg.shadowBlur = blur * ppm;
      eg.fillStyle = color;
      eg.fillRect(0, y, W, thick * ppm);
      eg.fillRect(0, y, W, thick * ppm); // second pass = stronger halo
      eg.restore();
    };
    glowLine(yAt(o.signHeight + o.signSize * 0.95), 0.04, o.accentColor, 0.45);          // long accent LED line
    glowLine(yAt(5.6), 0.035, o.stripColor, 0.4);           // cool white line above it
    // vertical accent tubes
    for (let m = 1.3 * 2; m < WALL_W; m += 1.3 * 4) {
      eg.save();
      eg.shadowColor = o.accentColor; eg.shadowBlur = 0.35 * ppm;
      eg.fillStyle = o.accentColor;
      eg.fillRect(m * ppm - 0.02 * ppm, yAt(WALL_H), 0.04 * ppm, (WALL_H - o.signHeight - o.signSize * 0.95) * ppm);
      eg.restore();
    }
    // light spilling up the wall from the floor line
    const wash = eg.createLinearGradient(0, yAt(1.6), 0, yAt(0));
    wash.addColorStop(0, 'rgba(0,0,0,0)');
    wash.addColorStop(1, o.accentColor);
    eg.globalAlpha = 0.16;
    eg.fillStyle = wash;
    eg.fillRect(0, yAt(1.6), W, 1.6 * ppm);
    eg.globalAlpha = 1;
  }
  if (sign && o.wallText) {
    // wall sign, centred behind the bike (wall centre = bike centre)
    const text = String(o.wallText).toUpperCase();
    const acc = String(o.wallTextAccent || '').toUpperCase();
    const size = o.signSize * ppm;
    eg.save();
    eg.translate(W / 2, yAt(o.signHeight));
    eg.transform(1, 0, -0.14, 1, 0, 0); // italic skew, like the site headings
    eg.font = `400 ${size}px ${o.font}`;
    eg.textBaseline = 'middle';
    const total = eg.measureText(text).width;
    let x = -total / 2;
    const draw = (str, color) => {
      eg.shadowColor = color; eg.shadowBlur = 0.3 * ppm;
      eg.fillStyle = color;
      eg.fillText(str, x, 0);
      eg.shadowBlur = 0;
      eg.fillText(str, x, 0);
      x += eg.measureText(str).width;
    };
    if (acc && text.startsWith(acc)) { draw(acc, o.accentColor); draw(text.slice(acc.length), '#f1f1f1'); }
    else draw(text, '#f1f1f1');
    eg.restore();
    if (o.wallSubText) {
      eg.save();
      eg.font = `600 ${o.signSize * 0.2 * ppm}px ${o.bodyFont}`;
      eg.textAlign = 'center';
      eg.textBaseline = 'middle';
      eg.fillStyle = 'rgba(235,235,235,0.75)';
      const sub = String(o.wallSubText).toUpperCase().split('').join('  ');
      eg.fillText(sub, W / 2, yAt(o.signHeight - o.signSize * 0.72));
      eg.restore();
    }
  }
  return { map: texture(c), emissiveMap: texture(e) };
}

async function fileExists(url) {
  try { return (await fetch(url, { method: 'HEAD' })).ok; } catch (e) { return false; }
}

/* Loads a garage GLB (plain or Meshopt-compressed) and places it from config. */
async function loadGarageModel(url, gm) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  const model = gltf.scene;
  model.name = 'garage-model';
  const pos = gm.position || [0, 0, 0];
  model.position.set(pos[0] || 0, pos[1] || 0, pos[2] || 0);
  model.rotation.y = ((gm.rotation || 0) * Math.PI) / 180;
  model.scale.setScalar(gm.scale || 1);
  model.traverse((n) => {
    if (!n.isMesh) return;
    n.receiveShadow = true; // the bike's shadow lands on the model's floor
    if (n.material && 'envMapIntensity' in n.material && typeof gm.envIntensity === 'number') n.material.envMapIntensity = gm.envIntensity;
  });
  return model;
}

export async function buildBackdrop(scene, cfg, site) {
  const b = cfg.backdrop || {};
  if ((b.type || 'none') !== 'garage') return { floor: false };

  const displayFont = `"${site.theme.fonts.display}", Impact, "Arial Narrow", sans-serif`;
  const bodyFont = `"${site.theme.fonts.body}", system-ui, sans-serif`;
  // the sign is drawn to a canvas, so the web font must be ready first (falls back after 2.5 s)
  try {
    await Promise.race([
      document.fonts.load(`400 80px "${site.theme.fonts.display}"`),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch (e) { /* use fallback font */ }

  const o = {
    accentColor: b.accentColor || site.theme.colors.accent,
    wallColor: b.wallColor || '#121216',
    floorColor: b.floorColor || '#101013',
    stripColor: b.stripColor || '#DDE8FF',
    wallText: b.wallText ?? site.business.name,
    wallTextAccent: b.wallTextAccent ?? site.business.logoAccent,
    wallSubText: b.wallSubText ?? site.business.tagline,
    showBay: b.showBay !== false,
    showChecker: b.showChecker ?? site.theme.showCheckeredAccents,
    lightStrips: b.lightStrips !== false,
    signHeight: b.signHeight ?? 1.98,
    signSize: b.signSize ?? 0.5,
    font: displayFont,
    bodyFont,
  };
  const glow = b.glow ?? 1;
  const group = new THREE.Group();
  group.name = 'backdrop';
  o.wallHeight = WALL_H;

  // Optional downloaded garage model (backdrop.garageModel.url). When the file exists and
  // replaceBuiltIn is on, it stands in for the whole built-in set (floor, walls and props).
  const gm = b.garageModel || {};
  const gmUrl = gm.url && !/^\[PLACEHOLDER/i.test(gm.url) ? asset(gm.url) : '';
  if (gmUrl && await fileExists(gmUrl)) {
    try {
      const model = await loadGarageModel(gmUrl, gm);
      group.add(model);
      if (gm.replaceBuiltIn !== false) {
        scene.add(group);
        return { floor: true, group };
      }
    } catch (e) {
      console.warn('[hero.backdrop.garageModel] could not load, using the built-in garage instead:', e);
    }
  }

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR, FLOOR),
    new THREE.MeshPhysicalMaterial({ map: floorTexture(o), roughness: 1 - Math.min(0.95, Math.max(0, b.floorGloss ?? 0.65)), metalness: 0, specularIntensity: b.floorReflection ?? 0.3 }) // specularIntensity tames the sheen from the coloured rim lights
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const wall = (sign) => {
    const t = wallTextures(o, { sign });
    return new THREE.Mesh(
      new THREE.PlaneGeometry(WALL_W, WALL_H),
      new THREE.MeshStandardMaterial({ ...t, emissive: 0xffffff, emissiveIntensity: glow, roughness: 0.85, metalness: 0.1 })
    );
  };
  const side = wall(true);              // behind the side profile: carries the sign
  side.position.set(SIDE_X, WALL_H / 2, 0);
  side.rotation.y = Math.PI / 2;
  const back = wall(false);             // behind the nose close-up
  back.position.set(0, WALL_H / 2, BACK_Z);
  group.add(side, back);

  // 3D props: tool chest, workbench, tyres… (backdrop.props; [] = empty garage)
  buildProps(group, Array.isArray(b.props) ? b.props : DEFAULT_PROPS, o, glow);

  scene.add(group);
  return { floor: true, group };
}
