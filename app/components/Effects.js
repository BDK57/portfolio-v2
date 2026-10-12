'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { smoothScroll, scrollReveals } from './motion';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const MOTION = '(prefers-reduced-motion: no-preference)';

/**
 * All page motion in one place. Sections opt in with data attributes:
 *   data-hero-name / data-hero-lines / data-hero-pop / data-hero-portrait  — hero reveal
 *   data-split   — heading lines rise in       data-words — scroll-scrubbed word highlight
 *   data-reveal  — fade up on enter           data-magnetic — leans toward the cursor
 *   data-cursor="Label" — cursor label on hover   data-cursor-hide — hide the cursor (carousel has its own)
 * The hero intro waits for the Intro gate ('intro:reveal'); afterwards "Hassan" gets Text Repel.
 * With reduced motion nothing runs and the page renders in its final state.
 */
/*
 * Text Repel — adapted from Componentry (componentry.dev/docs/components/text-repel), built on GSAP
 * instead of framer-motion: each letter is a damped spring pushed away from the cursor (quadratic
 * falloff) with a slight tilt. Radius and strength scale with the font size. Returns a cleanup fn.
 */
function textRepel(el, { stiffness = 180, damping = 14, mass = 0.4 } = {}) {
  const split = SplitText.create(el, { type: 'chars' });
  const fs = parseFloat(getComputedStyle(el).fontSize);
  const radius = fs * 0.8;
  const strength = fs * 0.2; // letters clearly part around the cursor
  const st = split.chars.map(() => ({ ox: 0, oy: 0, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }));
  const measure = () => {
    gsap.set(split.chars, { x: 0, y: 0, rotation: 0 });
    const r = el.getBoundingClientRect();
    split.chars.forEach((c, i) => {
      const b = c.getBoundingClientRect();
      Object.assign(st[i], { ox: b.left - r.left + b.width / 2, oy: b.top - r.top + b.height / 2, x: 0, y: 0, vx: 0, vy: 0 });
    });
  };
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    for (const s of st) {
      const dx = s.ox - mx, dy = s.oy - my, d = Math.hypot(dx, dy);
      const f = d < radius && d > 0 ? (1 - d / radius) ** 2 * strength : 0;
      s.tx = f ? (dx / d) * f : 0;
      s.ty = f ? (dy / d) * f : 0;
    }
  };
  const tick = (_, ms) => {
    const dt = Math.min(ms / 1000, 1 / 30);
    st.forEach((s, i) => {
      s.vx += ((stiffness * (s.tx - s.x) - damping * s.vx) / mass) * dt;
      s.vy += ((stiffness * (s.ty - s.y) - damping * s.vy) / mass) * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      gsap.set(split.chars[i], { x: s.x, y: s.y, rotation: s.x * 0.25 });
    });
  };
  measure();
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('resize', measure);
  gsap.ticker.add(tick);
  return () => {
    removeEventListener('pointermove', onMove);
    removeEventListener('resize', measure);
    gsap.ticker.remove(tick);
    split.revert();
  };
}

/*
 * Centre and radius of the dot of an "i" (in px, relative to the element's top-left), found by
 * drawing the glyph in the element's font on a canvas and scanning for the topmost ink blob.
 * Font metrics alone can't place the dot precisely enough for a ~100× zoom.
 */
function dotOfI(el) {
  const cs = getComputedStyle(el);
  const fs = parseFloat(cs.fontSize);
  const S = 200;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = Math.ceil(S * 1.6);
  const x = c.getContext('2d', { willReadFrequently: true });
  x.font = `${cs.fontStyle} ${cs.fontWeight} ${S}px ${cs.fontFamily}`;
  const ascent = Math.ceil(x.measureText('i').fontBoundingBoxAscent);
  x.fillText('i', 0, ascent);
  const { data } = x.getImageData(0, 0, c.width, c.height);
  const inkRow = (y) => { for (let i = 0; i < c.width; i++) if (data[(y * c.width + i) * 4 + 3] > 128) return true; return false; };
  let top = 0;
  while (top < c.height && !inkRow(top)) top++;
  let bottom = top;
  while (bottom < c.height && inkRow(bottom)) bottom++;
  let left = c.width, right = 0;
  for (let y = top; y < bottom; y++) for (let i = 0; i < c.width; i++) if (data[(y * c.width + i) * 4 + 3] > 128) { left = Math.min(left, i); right = Math.max(right, i); }
  const k = fs / S;
  return { x: ((left + right) / 2) * k, y: ((top + bottom) / 2) * k, r: ((bottom - top) / 2) * k };
}

export default function Effects() {
  const cursor = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MOTION, () => {
      const smooth = smoothScroll();
      const { lenis } = smooth;
      if (!window.__introDone) lenis.scrollTo(0, { immediate: true, force: true });
      lenis.stop();

      // Hero intro, played when the Intro gate splits open.
      const nameEl = document.querySelector('[data-hero-name]');
      const name = SplitText.create(nameEl, { type: 'chars', mask: 'chars' });
      gsap.set(name.chars, { yPercent: 110 });
      // Side copy rises line by line through a mask; badge + CTA pop in last.
      const lines = SplitText.create('[data-hero-lines]', { type: 'lines', mask: 'lines' });
      gsap.set(lines.lines, { yPercent: 105 });
      gsap.set('[data-hero-pop]', { autoAlpha: 0, y: 16, scale: 0.92 });
      // Portrait rises from behind the name, coming out of blur and shadow as if lit by the seam.
      gsap.set('[data-hero-portrait]', { autoAlpha: 0, y: 140, filter: 'blur(12px) brightness(0.35)' });

      let stopRepel = () => {};
      const intro = gsap.timeline({ paused: true, onComplete: () => {
        name.revert(); // drop the masks so repelled letters aren't clipped
        lines.revert(); // back to natural text so it reflows on resize
        gsap.set('[data-hero-portrait]', { clearProps: 'filter' });
        if (matchMedia('(pointer: fine)').matches) stopRepel = textRepel(nameEl);
      } })
        .add(() => lenis.start())
        .to('[data-hero-portrait]', { autoAlpha: 1, y: 0, filter: 'blur(0px) brightness(1)', duration: 1.6, ease: 'expo.out' }, 0)
        .to(name.chars, { yPercent: 0, duration: 1.1, stagger: 0.05, ease: 'expo.out' }, 0.25)
        .to(lines.lines, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, 0.45)
        .to('[data-hero-pop]', { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.6)' }, 0.95);
      // From the intro, wait until the split screen has started to open so the reveal is actually seen.
      const play = (delay) => document.fonts.ready.then(() => { ScrollTrigger.refresh(); gsap.delayedCall(delay, () => intro.play()); });
      const onReveal = () => play(0.45);
      if (window.__introDone) play(0);
      else window.addEventListener('intro:reveal', onReveal, { once: true });

      // Hero parallax
      const hero = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('[data-hero-portrait]', { yPercent: 12, ease: 'none', scrollTrigger: hero });
      gsap.to('[data-hero-name]', { yPercent: -25, ease: 'none', scrollTrigger: hero });

      scrollReveals();

      // Contact: pinned zoom-through. The headline scales into the orange dot of the "i" in
      // "exceptional" until it floods the screen, and the orange CTA screen rises out of it.
      const zoom = document.querySelector('.zoom');
      const zoomTitle = zoom.querySelector('[data-zoom-title]');
      const zoomI = zoom.querySelector('[data-zoom-i]');
      let zoomScale = 120;
      const aimAtDot = () => {
        const s = gsap.getProperty(zoomTitle, 'scale');
        gsap.set(zoomTitle, { scale: 1 });
        const t = zoomTitle.getBoundingClientRect();
        const r = zoomI.getBoundingClientRect();
        const dot = dotOfI(zoomI);
        zoomScale = (Math.hypot(innerWidth, innerHeight) / 2 / dot.r) * 1.15;
        gsap.set(zoomTitle, { transformOrigin: `${r.left + dot.x - t.left}px ${r.top + dot.y - t.top}px`, scale: s });
      };
      zoom.classList.add('is-zoom');
      aimAtDot();
      ScrollTrigger.addEventListener('refreshInit', aimAtDot);
      gsap.timeline({
        scrollTrigger: { trigger: zoom, start: 'top top', end: '+=240%', pin: zoom.querySelector('.zoom__stage'), scrub: 1, invalidateOnRefresh: true },
      })
        .to(zoom.querySelectorAll('.zoom__eyebrow, .zoom__hint'), { autoAlpha: 0, y: -24, duration: 0.12 }, 0)
        .to(zoomTitle, { scale: () => zoomScale, duration: 1, ease: 'power4.in' }, 0.04)
        .fromTo('[data-zoom-cta]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06, ease: 'none' }, 1.02)
        .from(zoom.querySelectorAll('[data-zoom-cta] .zoom__in'), { y: 70, autoAlpha: 0, stagger: 0.05, duration: 0.3, ease: 'power3.out' }, 1.06);

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', aimAtDot);
        zoom.classList.remove('is-zoom');
        window.removeEventListener('intro:reveal', onReveal);
        stopRepel();
        smooth.destroy();
      };
    });

    // Magnetic focal element (contact orb) — mouse/trackpad only.
    mm.add(`${MOTION} and (pointer: fine)`, () => {
      const offs = gsap.utils.toArray('[data-magnetic]').map((el) => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        const move = (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.3);
          yTo((e.clientY - r.top - r.height / 2) * 0.3);
        };
        const leave = () => { xTo(0); yTo(0); };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
      });
      return () => offs.forEach((off) => off());
    });

    // Cursor follower — mouse/trackpad only.
    mm.add(`${MOTION} and (pointer: fine)`, () => {
      const c = cursor.current;
      const label = c.firstChild;
      gsap.set(c, { xPercent: -50, yPercent: -50 });
      const xTo = gsap.quickTo(c, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = gsap.quickTo(c, 'y', { duration: 0.4, ease: 'power3' });
      const move = (e) => { xTo(e.clientX); yTo(e.clientY); c.classList.add('is-on'); };
      const over = (e) => {
        const t = e.target.closest('a, button');
        label.textContent = t?.dataset.cursor || '';
        c.classList.toggle('is-hover', !!t);
        c.classList.toggle('is-hidden', !!e.target.closest('[data-cursor-hide]'));
        c.classList.toggle('has-label', !!t?.dataset.cursor);
      };
      const leave = () => c.classList.remove('is-on');
      window.addEventListener('pointermove', move);
      document.addEventListener('pointerover', over);
      document.documentElement.addEventListener('pointerleave', leave);
      return () => {
        window.removeEventListener('pointermove', move);
        document.removeEventListener('pointerover', over);
        document.documentElement.removeEventListener('pointerleave', leave);
      };
    });
  });

  return (
    <>
      <div className="cursor" ref={cursor} aria-hidden="true"><span /></div>
    </>
  );
}
