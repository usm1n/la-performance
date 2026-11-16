import { initLayout, afterRender } from './core/layout.js';
import { initReveals, initSmoothScroll } from './core/motion.js';

const pages = {
  home: () => import('./pages/home.js'),
  services: () => import('./pages/services.js'),
  builds: () => import('./pages/builds.js'),
  build: () => import('./pages/build.js'),
  dyno: () => import('./pages/dyno.js'),
  about: () => import('./pages/about.js'),
  contact: () => import('./pages/contact.js'),
};

const page = document.body.dataset.page || 'home';
const main = document.getElementById('main');

initLayout(page);
initSmoothScroll();

const mod = await (pages[page] || pages.home)();
await mod.default(main);

initReveals();
afterRender();
document.documentElement.classList.add('is-ready');

if (location.hash) {
  const target = document.getElementById(location.hash.slice(1));
  if (target) requestAnimationFrame(() => target.scrollIntoView());
}
