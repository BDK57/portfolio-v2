'use client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { smoothScroll, scrollReveals } from './motion';

gsap.registerPlugin(useGSAP);

// Motion for case-study pages: smooth scroll, shared reveals, gentle parallax on the browser shot.
export default function CaseEffects() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const smooth = smoothScroll();
      scrollReveals();
      gsap.fromTo('[data-parallax]', { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: '[data-parallax]', start: 'top bottom', end: 'bottom top', scrub: true },
      });
      return () => smooth.destroy();
    });
  });
  return null;
}
