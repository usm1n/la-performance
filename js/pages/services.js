import { config, esc, t, has, icon, pageHead, ctaBand } from '../core/util.js';

export default async function render(main) {
  const L = config.pages.services.labels;
  const ui = config.ui;
  const list = (items) => `<ul class="ticks">${(items || []).map((x) => `<li>${t(x)}</li>`).join('')}</ul>`;

  main.innerHTML = `
    ${pageHead('services')}
    <nav class="subnav" aria-label="${esc(config.pages.services.title)}">
      <div class="wrap subnav__in">${config.services.map((s) => `<a href="#${esc(s.id)}">${t(s.title)}</a>`).join('')}</div>
    </nav>
    ${config.services.map((s, i) => `
      <section class="section svc ${i % 2 ? 'section--angled' : ''}" id="${esc(s.id)}">
        <div class="wrap svc__grid">
          <div class="svc__main">
            <span class="svc__no display reveal" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
            <span class="svc__icon reveal">${icon(s.icon)}</span>
            <h2 class="svc__title reveal"><span class="display">${t(s.title)}</span></h2>
            <p class="svc__lead reveal">${t(s.short)}</p>
            <p class="svc__desc reveal">${t(s.description)}</p>
            <dl class="svc__facts reveal">
              <div><dt>${t(L.turnaround)}</dt><dd>${t(s.turnaround, '—')}</dd></div>
              <div><dt>${t(L.price)}</dt><dd>${has(s.priceFrom) ? `${t(ui.priceFromPrefix)} ${t(s.priceFrom)}` : t(ui.contactForQuote)}</dd></div>
            </dl>
            <a class="btn reveal" href="${esc(ui.bookHref)}?service=${encodeURIComponent(s.id)}">${t(ui.bookCta)} ${icon('arrow')}</a>
          </div>
          <div class="svc__side">
            <div class="panel reveal"><h3 class="panel__title">${t(L.includes)}</h3>${list(s.includes)}</div>
            <div class="panel reveal"><h3 class="panel__title">${t(L.suitableFor)}</h3><ul class="chips">${(s.suitableFor || []).map((x) => `<li>${t(x)}</li>`).join('')}</ul></div>
          </div>
        </div>
      </section>`).join('')}
    ${ctaBand()}`;
}
