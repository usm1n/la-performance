import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion, qsa } from './util.js';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
export const reduced = reducedMotion();

/** Smooth scrolling (desktop, motion allowed). Fails silently if the CDN is unreachable. */
export async function initSmoothScroll() {
  if (reduced || !window.matchMedia('(pointer: fine)').matches) return null;
  try {
    const { default: Lenis } = await import('lenis');
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
    return lenis;
  } catch (e) {
    return null;
  }
}

/** Skewed slide-up reveals: any element with class "reveal" gets "is-in" when it enters the viewport. */
export function initReveals(root = document) {
  const els = qsa('.reveal:not(.is-in)', root);
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  els.forEach((el) => io.observe(el));
}

/** Count a number up when the element scrolls into view. */
export function countUp(el, to, { duration = 1.6, decimals = 0 } = {}) {
  const fmt = (v) => v.toFixed(decimals);
  if (reduced || !('IntersectionObserver' in window)) {
    el.textContent = fmt(to);
    return;
  }
  el.textContent = fmt(0);
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const o = { v: 0 };
      gsap.to(o, { v: to, duration, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)) });
    },
    { threshold: 0.4 }
  );
  io.observe(el);
}
