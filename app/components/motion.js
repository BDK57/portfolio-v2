import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Lenis smooth scroll driven by GSAP's ticker (keeps ScrollTrigger in sync). Returns { lenis, destroy }. */
export function smoothScroll() {
  const lenis = new Lenis({ anchors: true, lerp: 0.07, wheelMultiplier: 0.9 }); // longer, softer glide
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (t) => lenis.raf(t * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return {
    lenis,
    destroy() {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
    },
  };
}

/**
 * Scroll reveals shared by every page:
 *   data-split  — heading lines rise in through a mask
 *   data-words  — words light up as you scroll
 *   data-reveal — fade up on enter (batched so neighbours stagger)
 * Call inside a gsap.matchMedia/context so everything reverts on cleanup.
 */
export function scrollReveals() {
  gsap.utils.toArray('[data-split]').forEach((el) =>
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (s) => gsap.from(s.lines, {
        yPercent: 105, duration: 1.1, stagger: 0.09, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }),
    }));

  gsap.utils.toArray('[data-words]').forEach((el) =>
    SplitText.create(el, {
      type: 'words', autoSplit: true,
      onSplit: (s) => gsap.from(s.words, {
        opacity: 0.15, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: true },
      }),
    }));

  gsap.set('[data-reveal]', { autoAlpha: 0, y: 40 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 92%', end: 'max', once: true,
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', overwrite: true }),
  });
}
