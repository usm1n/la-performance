import { config, esc, t, has, num, asset, media, icon, ctaBand, qs, qsa, isPH } from '../core/util.js';
import { applySeo } from '../core/layout.js';

/** Inline SVG: stock vs tuned for HP and torque. Placeholder values draw as dashed "?" bars. */
function chart(b) {
  const ui = config.ui;
  const groups = [
    { label: ui.hp, unit: ui.hp, stock: b.stock?.hp, tuned: b.tuned?.hp },
    { label: `Torque (${ui.torqueUnit})`, unit: ui.torqueUnit, stock: b.stock?.torque, tuned: b.tuned?.torque },
  ];
  const W = 640, H = 340, base = 280, top = 48, bw = 84, gap = 22;
  const gw = W / groups.length;
  let out = '';
  let summary = [];
  groups.forEach((g, gi) => {
    const s = num(g.stock), tn = num(g.tuned);
    const max = Math.max(1, s ?? 0, tn ?? 0);
    const cx = gw * gi + gw / 2;
    [[s, g.stock, 'stock', ui.stock, cx - bw - gap / 2], [tn, g.tuned, 'tuned', ui.tuned, cx + gap / 2]].forEach(([n, rawV, cls, name, x]) => {
      const h = n !== null ? Math.max(6, ((base - top) * n) / max) : (base - top) * 0.34;
      const y = base - h;
      out += `<rect class="chart__bar chart__bar--${cls} ${n === null ? 'is-unknown' : ''}" x="${x}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}"/>`;
      out += `<text class="chart__val" x="${x + bw / 2}" y="${(y - 12).toFixed(1)}" text-anchor="middle">${n !== null ? n : '?'}</text>`;
      out += `<text class="chart__name" x="${x + bw / 2}" y="${base + 22}" text-anchor="middle">${esc(name)}</text>`;
      summary.push(`${name} ${g.unit}: ${n !== null ? n : 'not available'}`);
      void rawV;
    });
    out += `<text class="chart__group" x="${cx}" y="${base + 48}" text-anchor="middle">${esc(g.label)}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(summary.join(', '))}">
    <line class="chart__axis" x1="24" y1="${base}" x2="${W - 24}" y2="${base}"/>
    ${[0.25, 0.5, 0.75, 1].map((f) => `<line class="chart__grid" x1="24" x2="${W - 24}" y1="${base - (base - top) * f}" y2="${base - (base - top) * f}"/>`).join('')}
    ${out}
  </svg>`;
}

export default async function render(main) {
  const slug = new URLSearchParams(location.search).get('slug');
  const b = config.builds.find((x) => x.slug === slug);
  const L = config.pages.build.labels;
  const ui = config.ui;

  if (!b) {
    main.innerHTML = `<section class="phead"><div class="wrap">
        <h1 class="phead__title"><span class="display">${t(ui.notFound)}</span></h1>
        <p class="phead__intro"><a class="btn" href="builds.html">${t(ui.backToBuilds)} ${icon('arrow')}</a></p>
      </div></section>`;
    return;
  }

  applySeo('build', { title: `${b.title} — ${b.brand} ${b.model}`, description: has(b.notes) ? b.notes : undefined, image: has(b.heroMedia) ? b.heroMedia : undefined });

  const s = num(b.stock?.hp), tn = num(b.tuned?.hp);
  const gain = s && tn ? Math.round(((tn - s) / s) * 100) : null;
  const gallery = (b.gallery || []).filter((g) => has(g) || config.devMode);
  const credits = [[L.tuner, b.credits?.tuner], [L.dyno, b.credits?.dyno], [L.video, b.credits?.video]].filter(([, v]) => has(v) || (isPH(v) && config.devMode));
  const facts = [
    [ui.crank + ' ' + ui.hp, b.tuned?.hp],
    b.tuned?.wheelHp !== undefined ? [ui.wheel + ' ' + ui.hp, b.tuned.wheelHp] : null,
    [`Torque (${ui.torqueUnit})`, b.tuned?.torque],
    gain !== null ? [ui.gain, `+${gain}%`] : null,
  ].filter(Boolean);

  main.innerHTML = `
    <section class="bhero">
      <div class="bhero__media">${media(b.heroMedia, `${b.brand} ${b.model}`.toUpperCase(), { alt: `${b.brand} ${b.model} — ${b.title}`, eager: true })}</div>
      <div class="wrap bhero__body">
        <a class="link-arrow link-arrow--back" href="builds.html">${icon('chevL')} ${t(ui.backToBuilds)}</a>
        <p class="kicker">${has(b.year) || config.devMode ? `${t(b.year)} ` : ''}${t(b.brand)} ${t(b.model)}</p>
        <h1 class="bhero__title"><span class="display">${t(b.title)}</span></h1>
        ${has(b.badge) ? `<span class="tag tag--accent">${t(b.badge)}</span>` : ''}
        <dl class="bhero__facts">
          ${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd><span class="display">${t(v, '—')}</span></dd></div>`).join('')}
        </dl>
      </div>
    </section>

    <section class="section">
      <div class="wrap bdetail">
        <div class="bdetail__col">
          <h2 class="h3 reveal">${t(L.notes)}</h2>
          <p class="lead reveal">${t(b.notes)}</p>
          <h2 class="h3 reveal">${t(L.mods)}</h2>
          <ul class="ticks reveal">${(b.mods || []).map((m) => `<li>${t(m)}</li>`).join('')}</ul>
        </div>
        <div class="bdetail__col">
          <div class="panel reveal">
            <h2 class="panel__title">${t(L.power)}</h2>
            ${chart(b)}
            <p class="chart__legend"><span class="sw sw--stock"></span>${t(ui.stock)}<span class="sw sw--tuned"></span>${t(ui.tuned)}</p>
          </div>
          ${credits.length ? `<div class="panel reveal">
            <h2 class="panel__title">${t(L.credits)}</h2>
            <dl class="credits">${credits.map(([k, v]) => `<div><dt>${t(k)}</dt><dd>${t(v)}</dd></div>`).join('')}</dl>
          </div>` : ''}
        </div>
      </div>
    </section>

    ${gallery.length ? `<section class="section section--angled">
      <div class="wrap">
        <h2 class="h3 reveal">${t(L.gallery)}</h2>
        <div class="gallery">
          ${gallery.map((g, i) => `<button type="button" class="gallery__item reveal" data-i="${i}" aria-label="${esc(L.gallery)} ${i + 1}">${media(g, `PHOTO ${i + 1}`, { alt: `${b.title} — ${i + 1}` })}</button>`).join('')}
        </div>
      </div>
    </section>` : ''}

    <dialog class="lightbox" aria-label="${esc(L.gallery)}">
      <button type="button" class="iconbtn lightbox__close" aria-label="${esc(ui.close)}">${icon('close')}</button>
      <button type="button" class="iconbtn lightbox__prev" aria-label="${esc(ui.prev)}">${icon('chevL')}</button>
      <figure><img alt=""><figcaption></figcaption></figure>
      <button type="button" class="iconbtn lightbox__next" aria-label="${esc(ui.next)}">${icon('chevR')}</button>
    </dialog>
    ${ctaBand()}`;

  // ---------- lightbox ----------
  const dlg = qs('.lightbox', main);
  const img = qs('img', dlg);
  const cap = qs('figcaption', dlg);
  const srcs = gallery.map((g) => asset(g)).filter(Boolean);
  let idx = 0;
  const show = (i) => {
    if (!srcs.length) return;
    idx = (i + srcs.length) % srcs.length;
    img.src = srcs[idx];
    img.alt = `${b.title} — ${idx + 1}`;
    cap.textContent = `${idx + 1} / ${srcs.length}`;
  };
  qsa('.gallery__item', main).forEach((btn) =>
    btn.addEventListener('click', () => {
      const src = asset(gallery[+btn.dataset.i]);
      const i = srcs.indexOf(src);
      if (i < 0) return;
      show(i);
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    })
  );
  qs('.lightbox__close', dlg).addEventListener('click', () => dlg.close());
  qs('.lightbox__prev', dlg).addEventListener('click', () => show(idx - 1));
  qs('.lightbox__next', dlg).addEventListener('click', () => show(idx + 1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
}
