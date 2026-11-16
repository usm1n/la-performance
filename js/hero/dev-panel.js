/* devMode camera helper. Press "D" on the homepage.
   Shows scroll progress + live camera, lets you orbit freely ("Free cam", 3D mode)
   and copies the current camera as a config-ready keyframe line. */

const f = (n) => (Math.round(n * 100) / 100).toString();
const arr = (a) => `[${a.map(f).join(', ')}]`;

export function createDevPanel({ getState, setFree, canFree }) {
  const el = document.createElement('aside');
  el.className = 'devpanel';
  el.hidden = true;
  el.innerHTML = `
    <header><strong>HERO CAMERA</strong><span>press D to hide</span></header>
    <dl>
      <dt>mode</dt><dd data-k="mode"></dd>
      <dt>progress</dt><dd data-k="p"></dd>
      <dt>position</dt><dd data-k="pos"></dd>
      <dt>lookAt</dt><dd data-k="look"></dd>
      <dt>fov</dt><dd data-k="fov"></dd>
    </dl>
    <label class="devpanel__free"><input type="checkbox" ${canFree ? '' : 'disabled'}> Free cam (drag = orbit, wheel = zoom, right-drag = pan)</label>
    <button type="button">Copy keyframe</button>
    <output></output>`;
  document.body.appendChild(el);

  const out = el.querySelector('output');
  const cell = (k) => el.querySelector(`[data-k="${k}"]`);
  const line = () => {
    const s = getState();
    return `{ at: ${s.p.toFixed(2)}, position: ${arr(s.position)}, lookAt: ${arr(s.lookAt)}, fov: ${Math.round(s.fov)} },`;
  };

  el.querySelector('input').addEventListener('change', (e) => setFree(e.target.checked));
  el.querySelector('button').addEventListener('click', async () => {
    const text = line();
    try {
      await navigator.clipboard.writeText(text);
      out.textContent = 'Copied: ' + text;
    } catch (e) {
      out.textContent = text; // clipboard blocked → show it so it can be selected
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'd' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
    el.hidden = !el.hidden;
  });

  return {
    update() {
      if (el.hidden) return;
      const s = getState();
      cell('mode').textContent = s.mode;
      cell('p').textContent = s.p.toFixed(3);
      cell('pos').textContent = arr(s.position);
      cell('look').textContent = arr(s.lookAt);
      cell('fov').textContent = f(s.fov);
    },
  };
}
