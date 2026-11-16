/* Live three.js hero renderer. Loaded only when hero.mode = "3d", WebGL works and the GLB exists. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { smoothstep } from './camera-path.js';
import { buildBackdrop } from './backdrop.js';
import siteConfig from '../site.config.js';

const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

const PRESETS = {
  'studio-dark': { key: 1.6, fill: 0.12, exposure: 1.0, top: 14, side: 7, front: 2.5, room: 0.012 },
  'studio-bright': { key: 2.6, fill: 0.6, exposure: 1.1, top: 18, side: 10, front: 6, room: 0.08 },
};

/* Photo-studio environment for reflections: dark room, one long overhead softbox,
   two side strips, a soft front card and a coloured strip behind the bike.
   This is what gives paint and metal the long clean highlights of a studio shot. */
function studioEnvironment(renderer, preset, rimColor) {
  const env = new THREE.Scene();
  const panel = (w, h, intensity, color = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.material.color.multiplyScalar(intensity);
    env.add(m);
    return m;
  };
  const room = new THREE.Mesh(new THREE.SphereGeometry(30, 24, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide }));
  room.material.color.setScalar(preset.room);
  env.add(room);
  const top = panel(3.2, 9, preset.top);            // long overhead softbox along the bike
  top.position.set(0, 5.5, 0); top.rotation.x = Math.PI / 2;
  const left = panel(7, 2.2, preset.side);          // side strips
  left.position.set(7, 2.2, 0); left.rotation.y = -Math.PI / 2;
  const right = panel(7, 2.2, preset.side * 0.6);
  right.position.set(-7, 2.2, 0); right.rotation.y = Math.PI / 2;
  const front = panel(5, 3, preset.front);          // front fill card
  front.position.set(0, 2.5, 8); front.rotation.y = Math.PI;
  const back = panel(8, 1.2, preset.side * 0.8, new THREE.Color(rimColor)); // coloured kicker behind
  back.position.set(-3, 1.4, -7);
  const floor = panel(30, 30, preset.room * 4);     // faint floor bounce
  floor.position.y = -0.4; floor.rotation.x = -Math.PI / 2;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.015).texture;
  pmrem.dispose();
  env.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  return tex;
}

function radialTexture(stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export async function createScene3D(stage, cfg, { url, onProgress, dev }) {
  const bike = cfg.bike;
  const light = cfg.lighting || {};
  const preset = PRESETS[light.preset] || PRESETS['studio-dark'];
  const mobile = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = preset.exposure;
  renderer.domElement.className = 'hero__canvas';
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', `${bike.name} ${bike.year || ''}`.trim());

  const scene = new THREE.Scene();
  const bg = new THREE.Color(cfg.background || '#0B0B0D');
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 9, 22);

  if (light.environment === 'room') {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  } else {
    scene.environment = studioEnvironment(renderer, preset, light.rimColor || '#E10600');
  }
  scene.environmentIntensity = light.envIntensity ?? 1;
  if (typeof light.exposure === 'number') renderer.toneMappingExposure = light.exposure;

  const shadows = light.shadows !== false;
  if (shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 60);

  // lights
  const key = new THREE.DirectionalLight(0xffffff, preset.key);
  key.position.set(1.6, 5, 2.2);
  if (shadows) {
    key.castShadow = true;
    key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
    const sc = key.shadow.camera;
    sc.left = -1.7; sc.right = 1.7; sc.top = 1.7; sc.bottom = -1.7; sc.near = 1; sc.far = 12;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.012;
    key.shadow.radius = 5;
    const catcher = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: light.shadowStrength ?? 0.6 }));
    catcher.rotation.x = -Math.PI / 2;
    catcher.position.y = 0.002;
    catcher.receiveShadow = true;
    catcher.name = 'shadow-catcher';
    scene.add(catcher);
  }
  const fill = new THREE.HemisphereLight(0xffffff, 0x0b0b0d, preset.fill);
  const rim = new THREE.DirectionalLight(new THREE.Color(light.rimColor || '#E10600'), 0);
  rim.position.set(-4, 2.6, -1.6);
  const rim2 = new THREE.DirectionalLight(new THREE.Color(light.rimColor || '#E10600'), 0);
  rim2.position.set(-1.5, 1.2, -4);
  scene.add(key, fill, rim, rim2);

  // ground glow + contact shadow (cheap, no shadow maps)
  const bgHex = '#' + bg.getHexString();
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(7, 48),
    new THREE.MeshBasicMaterial({ map: radialTexture([[0, 'rgba(255,255,255,0.10)'], [0.35, 'rgba(255,255,255,0.03)'], [1, 'rgba(255,255,255,0)']]), transparent: true, depthWrite: false, color: 0xffffff })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.001;
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 3.0),
    new THREE.MeshBasicMaterial({ map: radialTexture([[0, 'rgba(0,0,0,0.85)'], [0.6, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.004;
  shadow.material.opacity = shadows ? 0.5 : 1; // soft contact darkening under the bike; the real shadow map does the rest
  scene.add(ground, shadow);
  void bgHex;

  // optional 3D set behind the bike (config.hero.backdrop). It brings its own floor,
  // so the plain studio floor glow and shadow catcher are removed.
  const set = await buildBackdrop(scene, cfg, siteConfig);
  if (set.floor) {
    scene.remove(ground);
    const catcher = scene.getObjectByName('shadow-catcher');
    if (catcher) scene.remove(catcher);
    shadow.position.y = 0.006;
    const f = cfg.backdrop?.fog;
    if (Array.isArray(f)) { scene.fog.near = f[0]; scene.fog.far = f[1]; }
  }

  // ---------- load model ----------
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_PATH);
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);

  const gltf = await new Promise((resolve, reject) => {
    loader.load(url, resolve, (e) => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); }, reject);
  });
  draco.dispose();

  // ---------- auto-fit: centre, sit on ground, length = fitLength, nose → +Z ----------
  const model = gltf.scene;
  const adjust = new THREE.Group();
  adjust.add(model);
  const rot = bike.rotation || [0, 0, 0];
  adjust.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
  adjust.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(adjust);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const length = Math.max(size.x, size.z) || 1;
  const s = (bike.fitLength || 2.05) / length;
  const fit = new THREE.Group();
  fit.add(adjust);
  fit.scale.setScalar(s);
  fit.position.set(-centre.x * s, -box.min.y * s, -centre.z * s);
  const user = new THREE.Group();
  user.add(fit);
  user.scale.setScalar(bike.scale || 1);
  const pos = bike.position || [0, 0, 0];
  user.position.set(pos[0] || 0, pos[1] || 0, pos[2] || 0);
  scene.add(user);

  // ---------- material overrides ----------
  const overrides = (bike.materialOverrides || []).filter((o) => o && o.match);
  const names = new Map();
  model.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m, i) => {
      if (!m) return;
      if (bike.ignoreVertexColors && m.vertexColors) { m.vertexColors = false; m.needsUpdate = true; }
      names.set(`${o.name}|${m.name}`, { mesh: o.name, material: m.name });
      const ov = overrides.find((v) => `${o.name} ${m.name}`.toLowerCase().includes(String(v.match).toLowerCase()));
      if (!ov) return;
      const c = m.clone();
      if (ov.color && c.color) c.color.set(ov.color);
      if (ov.emissive && c.emissive) c.emissive.set(ov.emissive);
      if (typeof ov.metalness === 'number' && 'metalness' in c) c.metalness = ov.metalness;
      if (typeof ov.roughness === 'number' && 'roughness' in c) c.roughness = ov.roughness;
      if (typeof ov.opacity === 'number') { c.opacity = ov.opacity; c.transparent = ov.opacity < 1; c.depthWrite = ov.opacity >= 1; }
      else if (ov.color && ov.opaque !== false) { c.transparent = false; c.depthWrite = true; c.opacity = 1; c.alphaTest = 0; } // solid recolour → solid surface
      if (typeof ov.clearcoat === 'number' && 'clearcoat' in c) c.clearcoat = ov.clearcoat;
      if (ov.color && ov.keepTexture !== true && c.map) c.map = null; // a texture would tint the new colour
      if (ov.colorFromSpecularMap) {
        // some exports put the real colour texture in the specular slot → move it back
        const tex = c.specularColorMap || c.specularIntensityMap;
        if (tex) { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true; c.map = tex; }
      }
      if (ov.color || ov.colorFromSpecularMap) {
        // the specular slot never holds real specular data on such models
        if ('specularIntensityMap' in c) { c.specularIntensityMap = null; c.specularColorMap = null; c.specularIntensity = 1; c.specularColor?.set('#ffffff'); }
      }
      if (typeof ov.clearcoatRoughness === 'number' && 'clearcoatRoughness' in c) c.clearcoatRoughness = ov.clearcoatRoughness;
      if (typeof ov.normalScale === 'number' && c.normalScale) c.normalScale.setScalar(ov.normalScale);
      if (typeof ov.envIntensity === 'number') c.envMapIntensity = ov.envIntensity;
      c.needsUpdate = true;
      if (Array.isArray(o.material)) o.material[i] = c; else o.material = c;
    });
  });
  if (shadows) {
    model.traverse((o) => {
      if (!o.isMesh) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      o.castShadow = !(m && m.transparent);
      o.receiveShadow = !(m && m.transparent);
    });
  }

  if (dev) {
    const r = (n) => +n.toFixed(3);
    console.groupCollapsed('%c[hero] model auto-fit', 'color:#E10600;font-weight:bold');
    console.log('raw size (x, y, z):', r(size.x), r(size.y), r(size.z));
    console.log('scale applied:', r(s), '→ normalised size (x, y, z):', r(size.x * s), r(size.y * s), r(size.z * s));
    console.log('normalised bounds: x ±' + r((size.x * s) / 2), ' y 0…' + r(size.y * s), ' z ±' + r((size.z * s) / 2), '(nose should be at +z)');
    if (size.x > size.z) console.warn('[hero] The model is longer along X than Z. Set hero.bike.rotation to [0, Math.PI / 2, 0] (or -Math.PI / 2) so the nose points to +Z.');
    console.log('Mesh / material names — use any part of a name as `match` in hero.bike.materialOverrides:');
    console.table([...names.values()]);
    console.groupEnd();
  }

  // ---------- headlight flares ----------
  const flareTex = radialTexture([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']]);
  const flareCol = new THREE.Color(light.headlightColor || '#DCEBFF');
  const flares = (bike.headlights || []).map((p) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, color: flareCol, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    sp.position.set(p[0], p[1], p[2] + 0.02);
    scene.add(sp);
    return sp;
  });
  const lamp = new THREE.PointLight(flareCol, 0, 4, 2);
  if (bike.headlights?.length) {
    const h = bike.headlights[0];
    lamp.position.set(0, h[1], h[2] + 0.35);
    scene.add(lamp);
  }

  // ---------- sizing ----------
  let W = 1, H = 1;
  const resize = () => {
    W = stage.clientWidth || 1;
    H = stage.clientHeight || 1;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  };
  stage.appendChild(renderer.domElement);
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  const target = new THREE.Vector3();
  const v = new THREE.Vector3();
  let controls = null;
  let free = false;

  return {
    kind: '3d',
    update(p, cam, time) {
      if (!free) {
        camera.position.set(cam.position[0], cam.position[1], cam.position[2]);
        target.set(cam.lookAt[0], cam.lookAt[1], cam.lookAt[2]);
        camera.lookAt(target);
        if (Math.abs(camera.fov - cam.fov) > 0.001) { camera.fov = cam.fov; camera.updateProjectionMatrix(); }
      } else if (controls) {
        controls.update();
      }
      const reveal = smoothstep(0.1, 0.9, p);
      const ri = light.rimIntensity ?? 2;
      rim.intensity = ri * (0.15 + 0.85 * reveal);
      rim2.intensity = ri * 0.5 * reveal;
      const pulse = 0.7 + 0.3 * Math.sin(time * 3.2);
      const fl = (1 - smoothstep(0.12, 0.3, p)) * pulse;
      flares.forEach((sp) => { sp.material.opacity = fl; sp.scale.setScalar((light.flareSize ?? 0.3) * (0.5 + 0.5 * fl)); sp.visible = fl > 0.01; });
      lamp.intensity = fl * (light.flareIntensity ?? 1.2);
      renderer.render(scene, camera);
    },
    project(pt) {
      v.set(pt[0], pt[1], pt[2]).project(camera);
      return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, visible: v.z < 1 };
    },
    /** dev: free orbit camera */
    async setFree(on) {
      free = on;
      if (on && !controls) {
        const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
      }
      if (controls) { controls.enabled = on; if (on) controls.target.copy(target); }
      renderer.domElement.style.pointerEvents = on ? 'auto' : '';
    },
    getCamera() {
      const tg = free && controls ? controls.target : target;
      return { position: camera.position.toArray(), lookAt: tg.toArray(), fov: camera.fov };
    },
    dispose() { ro.disconnect(); renderer.dispose(); renderer.domElement.remove(); },
  };
}
