import { config, esc, t, has, num, media, icon } from '../core/util.js';

/** Build card used on the homepage gallery and the builds grid. */
export function buildCard(b) {
  const hp = num(b.tuned?.hp);
  const year = has(b.year) ? `${esc(b.year)} ` : '';
  return `<a class="bcard" href="build.html?slug=${encodeURIComponent(b.slug)}" data-brand="${esc(b.brand)}">
    <div class="bcard__media">
      ${media(b.heroMedia, `${b.brand} ${b.model}`.toUpperCase(), { alt: `${b.brand} ${b.model} — ${b.title}` })}
      ${has(b.badge) ? `<span class="tag tag--accent">${t(b.badge)}</span>` : ''}
    </div>
    <div class="bcard__body">
      <p class="bcard__brand">${year}${t(b.brand)} ${t(b.model)}</p>
      <h3 class="bcard__title"><span class="display">${t(b.title)}</span></h3>
      <p class="bcard__hp">${hp !== null ? `<strong>${hp}</strong> ${t(config.ui.hp)}` : `<strong>${t(b.tuned?.hp, '—')}</strong> ${t(config.ui.hp)}`}<span class="link-arrow">${t(config.ui.viewBuild)} ${icon('arrow')}</span></p>
    </div>
  </a>`;
}

/** Stock-vs-tuned horizontal bars (HP at crank, HP at wheel when given). */
export function powerBars(b) {
  const ui = config.ui;
  const rows = [
    { label: `${ui.stock} · ${ui.crank}`, v: b.stock?.hp, cls: '' },
    { label: `${ui.tuned} · ${ui.crank}`, v: b.tuned?.hp, cls: 'is-accent' },
  ];
  if (b.tuned?.wheelHp !== undefined) rows.push({ label: `${ui.tuned} · ${ui.wheel}`, v: b.tuned.wheelHp, cls: 'is-accent is-soft' });
  const max = Math.max(1, ...rows.map((r) => num(r.v) ?? 0));
  const s = num(b.stock?.hp), tn = num(b.tuned?.hp);
  const gain = s && tn ? Math.round(((tn - s) / s) * 100) : null;
  return `
    <div class="pbars">
      ${rows.map((r) => {
        const n = num(r.v);
        return `<div class="pbar ${r.cls} ${n === null ? 'is-unknown' : ''}">
          <span class="pbar__label">${esc(r.label)}</span>
          <span class="pbar__track"><i style="--w:${n !== null ? (n / max) * 100 : 22}%"></i></span>
          <span class="pbar__val"><strong>${t(r.v, '—')}</strong> ${t(ui.hp)}</span>
        </div>`;
      }).join('')}
    </div>
    ${gain !== null ? `<p class="pgain"><span class="display">+${gain}%</span> ${t(ui.gain)}</p>` : ''}`;
}
