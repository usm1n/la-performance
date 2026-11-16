import { config, esc, t, has, isPH, media, icon, pageHead, ctaBand } from '../core/util.js';

export default async function render(main) {
  const a = config.about;
  const L = config.pages.about.labels;
  const show = (v) => has(v) || (isPH(v) && config.devMode);
  const story = (Array.isArray(a.story) ? a.story : [a.story]).filter(show);
  const team = config.team.filter((m) => show(m.name));
  const dp = a.dynoPartner || {};

  main.innerHTML = `
    ${pageHead('about')}
    <section class="section">
      <div class="wrap about__grid">
        <div class="about__media reveal">${media(a.image, 'WORKSHOP PHOTO', { alt: config.business.name })}</div>
        <div class="about__story">
          <h2 class="h3 reveal">${t(L.story)}</h2>
          ${story.map((p, i) => `<p class="${i === 0 ? 'lead' : ''} reveal">${t(p)}</p>`).join('')}
          <p class="about__bio reveal">${t(config.business.bio)}</p>
        </div>
      </div>
    </section>

    ${team.length ? `<section class="section section--angled">
      <div class="wrap">
        <h2 class="h3 reveal">${t(L.team)}</h2>
        <div class="team">
          ${team.map((m) => `<figure class="member reveal">
              ${media(m.photo, 'TEAM PHOTO', { alt: has(m.name) ? m.name : '' })}
              <figcaption><strong><span class="display">${t(m.name)}</span></strong><span>${t(m.role)}</span></figcaption>
            </figure>`).join('')}
        </div>
      </div>
    </section>` : ''}

    <section class="section">
      <div class="wrap about__split">
        ${show(dp.name) ? `<div class="panel panel--accent reveal">
          <h2 class="panel__title">${t(L.dynoPartner)}</h2>
          <p class="partner__name"><span class="display">${t(dp.name)}</span></p>
          ${show(dp.description) ? `<p>${t(dp.description)}</p>` : ''}
          ${has(dp.url) ? `<a class="link-arrow" href="${esc(dp.url)}" target="_blank" rel="noopener">${icon('instagram')} ${t(dp.handle || dp.name)} ${icon('arrow')}</a>` : ''}
        </div>` : ''}
        <div class="panel reveal">
          <h2 class="panel__title">${t(L.brands)}</h2>
          <ul class="brandlist">${config.supportedBrands.map((b) => `<li><span class="display">${t(b)}</span></li>`).join('')}</ul>
        </div>
      </div>
    </section>
    ${ctaBand()}`;
}
