import { config, esc, t, pageHead, ctaBand, qs, qsa } from '../core/util.js';
import { gsap, reduced } from '../core/motion.js';
import { buildCard } from './shared.js';

export default async function render(main) {
  const brands = [...new Set(config.builds.map((b) => b.brand))];
  main.innerHTML = `
    ${pageHead('builds')}
    <section class="section section--tight">
      <div class="wrap">
        <div class="filters reveal" role="group" aria-label="Filter by brand">
          <button type="button" class="chipbtn" data-brand="" aria-pressed="true">${t(config.ui.all)}</button>
          ${brands.map((b) => `<button type="button" class="chipbtn" data-brand="${esc(b)}" aria-pressed="false">${t(b)}</button>`).join('')}
        </div>
        <div class="bgrid" aria-live="polite">${config.builds.map((b) => buildCard(b)).join('')}</div>
      </div>
    </section>
    ${ctaBand()}`;

  const cards = qsa('.bgrid .bcard', main);
  const buttons = qsa('.chipbtn', main);
  let Flip = null;
  if (!reduced) {
    try {
      ({ Flip } = await import('gsap/Flip'));
      gsap.registerPlugin(Flip);
    } catch (e) { Flip = null; }
  }

  const apply = (brand) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.brand === brand)));
    const state = Flip ? Flip.getState(cards) : null;
    cards.forEach((c) => c.classList.toggle('is-out', !!brand && c.dataset.brand !== brand));
    if (!state) return;
    Flip.from(state, {
      duration: 0.55,
      ease: 'power3.out',
      absolute: true,
      scale: true,
      stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.25 }),
    });
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.brand)));
  const initial = new URLSearchParams(location.search).get('brand');
  if (initial && brands.includes(initial)) apply(initial);
  void qs;
}
