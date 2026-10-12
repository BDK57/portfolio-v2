'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/*
 * Flipping Word Swap — adapted from Componentry (componentry.dev/docs/components/flipping-word-swap).
 * Instead of being its own <button>, it lives inside an existing link and flips when that link is
 * hovered or keyboard-focused. `to` defaults to the same text, re-coloured (the hover colour).
 * The link keeps its accessible name through the sr-only copy of the text.
 */
const chars = (text, layer) =>
  Array.from(text).map((c, i) => (
    <span key={i} data-flip={layer} className="flip__char">{c === ' ' ? ' ' : c}</span>
  ));

export default function FlipText({ text, to = text, duration = 0.4, stagger = 0.044 }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    const host = root.closest('a, button, [data-flip-host]') || root;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const d = reduced ? 0 : duration;
    const s = reduced ? 0 : stagger;
    const ctx = gsap.context(() => {
      gsap.set('[data-flip="a"]', { rotationX: 0, opacity: 1, transformOrigin: 'center top' });
      gsap.set('[data-flip="b"]', { rotationX: -82, opacity: 0, transformOrigin: 'center bottom' });
      const tl = gsap.timeline({ paused: true })
        .to('[data-flip="a"]', { rotationX: 82, opacity: 0, duration: d, stagger: s, ease: 'power2.in' })
        .to('[data-flip="b"]', { rotationX: 0, opacity: 1, duration: d, stagger: s, ease: 'power2.out' }, `<${d * 0.62}`);
      const on = () => tl.play();
      const off = () => tl.reverse();
      const focus = () => host.matches(':focus-visible') && on();
      host.addEventListener('mouseenter', on);
      host.addEventListener('mouseleave', off);
      host.addEventListener('focus', focus);
      host.addEventListener('blur', off);
      return () => {
        host.removeEventListener('mouseenter', on);
        host.removeEventListener('mouseleave', off);
        host.removeEventListener('focus', focus);
        host.removeEventListener('blur', off);
      };
    }, root);
    return () => ctx.revert();
  }, [duration, stagger, text, to]);

  return (
    <span ref={ref} className="flip">
      <span className="sr-only">{text}</span>
      <span className="flip__stack" aria-hidden="true">
        <span className="flip__word">{chars(text, 'a')}</span>
        <span className="flip__word flip__word--to">{chars(to, 'b')}</span>
      </span>
    </span>
  );
}
