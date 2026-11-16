/* Pinned CDN library versions — the only place they are defined.
   Loaded as a classic script BEFORE js/main.js so the import map exists
   when the first ES module is resolved. */
(function () {
  var v = { three: '0.165.0', gsap: '3.12.5', lenis: '1.1.13' };
  var cdn = 'https://cdn.jsdelivr.net/npm/';
  var map = {
    imports: {
      'three': cdn + 'three@' + v.three + '/build/three.module.min.js',
      'three/addons/': cdn + 'three@' + v.three + '/examples/jsm/',
      'gsap': cdn + 'gsap@' + v.gsap + '/index.js',
      'gsap/ScrollTrigger': cdn + 'gsap@' + v.gsap + '/ScrollTrigger.js',
      'gsap/Flip': cdn + 'gsap@' + v.gsap + '/Flip.js',
      'lenis': cdn + 'lenis@' + v.lenis + '/dist/lenis.mjs'
    }
  };
  var s = document.createElement('script');
  s.type = 'importmap';
  s.textContent = JSON.stringify(map);
  document.currentScript.after(s);

  // Fetch the animation library files in parallel right away instead of discovering them
  // one after another while the modules load (saves several network round trips).
  ['index.js', 'gsap-core.js', 'CSSPlugin.js', 'ScrollTrigger.js', 'Observer.js'].forEach(function (f) {
    var l = document.createElement('link');
    l.rel = 'modulepreload';
    l.href = cdn + 'gsap@' + v.gsap + '/' + f;
    document.head.appendChild(l);
  });
})();
