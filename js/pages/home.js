import { config, esc, t, has, num, media, icon, heading, ctaBand, qs, qsa, isPH } from '../core/util.js';
import { gsap, reduced, countUp } from '../core/motion.js';
import { initHero } from '../hero/hero.js';
import { buildCard, powerBars } from './shared.js';

const price = (s) => (has(s.priceFrom) ? `${t(config.ui.priceFromPrefix)} ${t(s.priceFrom)}` : t(config.ui.contactForQuote));

function statsHTML() {
  return `<section class="stats" aria-label="Key numbers">
    <div class="wrap stats__grid">
      ${config.stats.map((s) => {
        const n = num(s.value);
        const val = n !== null ? `<span data-count="${n}">${n}</span>` : `<span>${t(s.value, '—')}</span>`;
        return `<div class="stat reveal"><p class="stat__num">${val}<small>${t(s.suffix)}</small></p><p class="stat__label">${t(s.label)}</p></div>`;
      }).join('')}
    </div>
  </section>`;
}

function marqueeHTML() {
  const words = [config.business.tagline, ...config.business.taglines].filter(has);
  const run = words.map((w) => `<span>${t(w)}</span><i aria-hidden="true"></i>`).join('');
  return `<div class="marquee" aria-hidden="true"><div class="marquee__track">${run}${run}${run}${run}</div></div>`;
}

function servicesHTML() {
  return `<section class="section" id="services">
    <div class="wrap">
      ${heading(config.home.services)}
      <div class="svc-grid">
        ${config.services.map((s, i) => `
          <a class="svc-card reveal" style="--d:${i * 70}ms" href="services.html#${esc(s.id)}">
            <span class="svc-card__no">${String(i + 1).padStart(2, '0')}</span>
            <span class="svc-card__icon">${icon(s.icon)}</span>
            <h3 class="svc-card__title">${t(s.title)}</h3>
            <p class="svc-card__text">${t(s.short)}</p>
            <span class="svc-card__foot"><span>${price(s)}</span><span class="link-arrow">${t(config.ui.learnMore)} ${icon('arrow')}</span></span>
          </a>`).join('')}
      </div>
    </div>
  </section>`;
}

function featuredHTML() {
  const f = config.home.featured;
  const b = config.builds.find((x) => x.slug === f.buildSlug) || config.builds[0];
  if (!b) return '';
  return `<section class="section section--angled featured" id="featured">
    <div class="wrap featured__grid">
      <div class="featured__media reveal">
        ${media(b.heroMedia, b.title, { alt: `${b.brand} ${b.model} — ${b.title}` })}
        ${has(b.badge) ? `<span class="tag tag--accent">${t(b.badge)}</span>` : ''}
      </div>
      <div class="featured__body">
        ${heading({ kicker: f.kicker, heading: f.heading })}
        <p class="featured__notes reveal">${t(b.notes)}</p>
        <div class="powercard reveal">${powerBars(b)}</div>
        <a class="btn reveal" href="build.html?slug=${encodeURIComponent(b.slug)}">${t(config.ui.viewBuild)} ${icon('arrow')}</a>
      </div>
    </div>
  </section>`;
}

function buildsHTML() {
  const h = config.home.builds;
  return `<section class="hscroll" id="builds">
    <div class="hscroll__pin">
      <div class="wrap hscroll__head">
        ${heading(h)}
        <a class="link-arrow reveal" href="builds.html">${t(config.ui.viewAll)} ${icon('arrow')}</a>
      </div>
      <div class="hscroll__viewport">
        <div class="hscroll__track">
          ${config.builds.map((b) => buildCard(b)).join('')}
          <a class="hscroll__more" href="builds.html"><span class="display">${t(config.ui.viewAll)}</span>${icon('arrow')}</a>
        </div>
      </div>
    </div>
  </section>`;
}

function dynoHTML() {
  const h = config.home.dyno;
  const rows = [...config.dyno]
    .sort((a, b) => (num(b.wheelHp) ?? -1) - (num(a.wheelHp) ?? -1))
    .slice(0, h.count || 3);
  const top = Math.max(1, ...rows.map((r) => num(r.crankHp) ?? 0));
  return `<section class="section" id="dyno">
    <div class="wrap">
      <div class="split-head">
        ${heading(h)}
        <a class="link-arrow reveal" href="dyno.html">${t(config.ui.viewAll)} ${icon('arrow')}</a>
      </div>
      <ol class="podium">
        ${rows.map((r, i) => {
          const c = num(r.crankHp);
          return `<li class="podium__row reveal" style="--d:${i * 90}ms">
            <span class="podium__rank display">${i + 1}</span>
            <div class="podium__bike"><strong>${t(r.bike)}</strong><span>${t(r.mods)}</span></div>
            <div class="podium__bar" aria-hidden="true"><i style="--w:${c !== null ? (c / top) * 100 : 8}%" class="${c === null ? 'is-unknown' : ''}"></i></div>
            <div class="podium__num"><strong>${t(r.crankHp, '—')}</strong><span>${t(config.ui.crank)} ${t(config.ui.hp)}</span></div>
            <div class="podium__num"><strong>${t(r.wheelHp, '—')}</strong><span>${t(config.ui.wheel)} ${t(config.ui.hp)}</span></div>
          </li>`;
        }).join('')}
      </ol>
    </div>
  </section>`;
}

function reelsHTML() {
  if (!config.reels.length) return '';
  return `<section class="section section--tight" id="reels">
    <div class="wrap">
      <div class="split-head">
        ${heading(config.home.reels)}
        ${has(config.socials.instagram) ? `<a class="link-arrow reveal" href="${esc(config.socials.instagram)}" target="_blank" rel="noopener">${icon('instagram')} Instagram ${icon('arrow')}</a>` : ''}
      </div>
    </div>
    <div class="reels" tabindex="0" role="group" aria-label="${esc(config.home.reels.heading)}">
      ${config.reels.map((r, i) => `
        <a class="reel" href="${esc(has(r.url) ? r.url : config.socials.instagram)}" target="_blank" rel="noopener" aria-label="${esc(config.ui.watchOnInstagram)}${has(r.caption) ? ': ' + esc(r.caption) : ''}">
          ${media(r.thumbnail, `INSTAGRAM REEL ${i + 1}`, { alt: '' })}
          <span class="reel__play">${icon('play')}</span>
          ${has(r.caption) || (isPH(r.caption) && config.devMode) ? `<span class="reel__cap">${t(r.caption)}</span>` : ''}
        </a>`).join('')}
    </div>
  </section>`;
}

function testimonialsHTML() {
  const list = config.devMode ? config.testimonials : config.testimonials.filter((x) => has(x.quote));
  if (!list.length) return '';
  return `<section class="section section--angled quotes" id="testimonials">
    <div class="wrap">
      ${heading(config.home.testimonials)}
      <div class="slider reveal">
        <div class="slider__track" tabindex="0" role="group" aria-label="${esc(config.home.testimonials.heading)}">
          ${list.map((q) => `<figure class="quote">
              <blockquote>${t(q.quote)}</blockquote>
              <figcaption><strong>${t(q.name)}</strong><span>${t(q.bike)}</span></figcaption>
            </figure>`).join('')}
        </div>
        <div class="slider__nav">
          <button type="button" class="iconbtn" data-dir="-1" aria-label="${esc(config.ui.prev)}">${icon('chevL')}</button>
          <span class="slider__count"><b>1</b> / ${list.length}</span>
          <button type="button" class="iconbtn" data-dir="1" aria-label="${esc(config.ui.next)}">${icon('chevR')}</button>
        </div>
      </div>
    </div>
  </section>`;
}

function brandsHTML() {
  return `<section class="brands" aria-label="${esc(config.home.brands.label)}">
    <div class="wrap brands__in">
      <span class="kicker">${t(config.home.brands.label)}</span>
      <ul>${config.supportedBrands.map((b) => `<li><span class="display">${t(b)}</span></li>`).join('')}</ul>
    </div>
  </section>`;
}

export default async function render(main) {
  main.innerHTML = `
    <section id="hero"></section>
    ${statsHTML()}
    ${marqueeHTML()}
    ${servicesHTML()}
    ${featuredHTML()}
    ${buildsHTML()}
    ${dynoHTML()}
    ${reelsHTML()}
    ${testimonialsHTML()}
    ${brandsHTML()}
    ${ctaBand()}`;

  await initHero(qs('#hero', main));

  qsa('[data-count]', main).forEach((el) => countUp(el, +el.dataset.count));

  // horizontal-scroll builds gallery: pinned + scrubbed on desktop, native swipe on touch / reduced motion
  const sec = qs('.hscroll', main);
  if (sec && !reduced) {
    const track = qs('.hscroll__track', sec);
    const viewport = qs('.hscroll__viewport', sec);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (pointer: fine)', () => {
      const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
      if (distance() < 40) return;
      sec.classList.add('is-pinned');
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { trigger: qs('.hscroll__pin', sec), start: 'top top', end: () => '+=' + distance(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      return () => sec.classList.remove('is-pinned');
    });
  }

  // testimonials slider (scroll-snap + buttons)
  const slider = qs('.slider', main);
  if (slider) {
    const track = qs('.slider__track', slider);
    const count = qs('.slider__count b', slider);
    const slides = qsa('.quote', track);
    const index = () => Math.round(track.scrollLeft / (slides[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0) || 1));
    qsa('button', slider).forEach((b) =>
      b.addEventListener('click', () => {
        const i = (index() + +b.dataset.dir + slides.length) % slides.length;
        track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
      })
    );
    track.addEventListener('scroll', () => { count.textContent = Math.min(slides.length, index() + 1); }, { passive: true });
  }
}
