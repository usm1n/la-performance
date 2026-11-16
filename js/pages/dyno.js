import { config, esc, t, num, icon, pageHead, ctaBand, qs, qsa } from '../core/util.js';

export default async function render(main) {
  const C = config.pages.dyno.columns;
  const cols = [
    { key: 'bike', label: C.bike, numeric: false },
    { key: 'mods', label: C.mods, numeric: false },
    { key: 'crankHp', label: C.crankHp, numeric: true },
    { key: 'wheelHp', label: C.wheelHp, numeric: true },
    { key: 'gainPercent', label: C.gainPercent, numeric: true },
  ];
  let sortKey = 'wheelHp';
  let dir = -1; // -1 = high → low

  main.innerHTML = `
    ${pageHead('dyno')}
    <section class="section section--tight">
      <div class="wrap">
        <div class="tablewrap reveal" tabindex="0" role="region" aria-label="${esc(config.pages.dyno.title)}">
          <table class="dtable">
            <thead><tr>
              <th scope="col" class="dtable__rank">${t(C.rank)}</th>
              ${cols.map((c) => `<th scope="col" data-key="${c.key}" class="${c.numeric ? 'is-num' : ''}" aria-sort="none"><button type="button">${t(c.label)} ${icon('sort')}</button></th>`).join('')}
            </tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </section>
    ${ctaBand()}`;

  const tbody = qs('tbody', main);
  const maxWheel = Math.max(1, ...config.dyno.map((r) => num(r.wheelHp) ?? 0));

  const draw = () => {
    const col = cols.find((c) => c.key === sortKey);
    const rows = [...config.dyno].sort((a, b) => {
      if (col.numeric) {
        const x = num(a[sortKey]), y = num(b[sortKey]);
        if (x === null && y === null) return 0;
        if (x === null) return 1; // placeholders always last
        if (y === null) return -1;
        return (x - y) * dir;
      }
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
    tbody.innerHTML = rows.map((r, i) => {
      const w = num(r.wheelHp);
      return `<tr>
        <td class="dtable__rank"><span class="display">${i + 1}</span></td>
        <th scope="row">${t(r.bike)}</th>
        <td class="dtable__mods">${t(r.mods)}</td>
        <td class="is-num">${t(r.crankHp, '—')}</td>
        <td class="is-num dtable__wheel"><strong>${t(r.wheelHp, '—')}</strong><span class="dtable__bar" aria-hidden="true"><i style="width:${w !== null ? (w / maxWheel) * 100 : 0}%"></i></span></td>
        <td class="is-num">${num(r.gainPercent) !== null ? `+${num(r.gainPercent)}%` : t(r.gainPercent, '—')}</td>
      </tr>`;
    }).join('');
    qsa('th[data-key]', main).forEach((th) => th.setAttribute('aria-sort', th.dataset.key === sortKey ? (dir === 1 ? 'ascending' : 'descending') : 'none'));
  };

  qsa('th[data-key] button', main).forEach((btn) =>
    btn.addEventListener('click', () => {
      const key = btn.parentNode.dataset.key;
      const numeric = cols.find((c) => c.key === key).numeric;
      if (key === sortKey) dir = -dir;
      else { sortKey = key; dir = numeric ? -1 : 1; }
      draw();
    })
  );
  draw();
}
