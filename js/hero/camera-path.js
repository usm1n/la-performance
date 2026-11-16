/* Camera path sampling: Catmull-Rom through config.hero.cameraKeyframes. */

const cr = (p0, p1, p2, p3, t) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

const cr3 = (a, b, c, d, t) => [0, 1, 2].map((i) => cr(a[i], b[i], c[i], d[i], t));

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smoothstep = (a, b, v) => {
  const x = clamp((v - a) / (b - a || 1e-6));
  return x * x * (3 - 2 * x);
};

/** Sorted, validated copy of the keyframes. */
export function prepareKeyframes(kfs) {
  const list = (kfs || [])
    .filter((k) => k && Array.isArray(k.position) && Array.isArray(k.lookAt))
    .map((k) => ({ at: clamp(+k.at || 0), position: k.position.map(Number), lookAt: k.lookAt.map(Number), fov: +k.fov || 35 }))
    .sort((a, b) => a.at - b.at);
  if (!list.length) list.push({ at: 0, position: [4.3, 0.9, 0], lookAt: [0, 0.6, 0], fov: 34 });
  return list;
}

/** → { position:[x,y,z], lookAt:[x,y,z], fov } at scroll progress p (0–1). */
export function sampleCamera(kfs, p) {
  const n = kfs.length;
  if (n === 1 || p <= kfs[0].at) return { position: [...kfs[0].position], lookAt: [...kfs[0].lookAt], fov: kfs[0].fov };
  if (p >= kfs[n - 1].at) return { position: [...kfs[n - 1].position], lookAt: [...kfs[n - 1].lookAt], fov: kfs[n - 1].fov };
  let i = 0;
  while (i < n - 2 && p > kfs[i + 1].at) i++;
  const k0 = kfs[Math.max(i - 1, 0)], k1 = kfs[i], k2 = kfs[i + 1], k3 = kfs[Math.min(i + 2, n - 1)];
  const t = clamp((p - k1.at) / (k2.at - k1.at || 1e-6));
  return {
    position: cr3(k0.position, k1.position, k2.position, k3.position, t),
    lookAt: cr3(k0.lookAt, k1.lookAt, k2.lookAt, k3.lookAt, t),
    fov: k1.fov + (k2.fov - k1.fov) * (t * t * (3 - 2 * t)),
  };
}

export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
