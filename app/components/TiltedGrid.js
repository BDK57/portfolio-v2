'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

/*
 * Scroll Tilted Grid — adapted from Componentry (componentry.dev/docs/components/scroll-tilted-grid).
 * Same per-tile math (tilt, roll, skew, depth, blur and dim as a card nears the viewport edges), but in
 * plain JS + site CSS: no framer-motion, no second Lenis (the site already runs one), one rAF loop for all
 * tiles. Cards link to their case study and keep the site's hover (image zoom + "View project" pill).
 */
const MAX_TILT = 62;
const MAX_BLUR = 7;
const clamp = (v) => Math.min(1, Math.max(0, v));

export default function TiltedGrid({ projects }) {
  const ref = useRef(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tiles = [...ref.current.querySelectorAll('[data-tilt]')];
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = innerHeight;
      tiles.forEach((tile, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const r = tile.getBoundingClientRect();
        const position = clamp((vh - r.top) / (vh + r.height));
        const signed = (position - 0.5) * 2;
        const d = Math.abs(signed);
        const eased = d * d * (3 - 2 * d);
        const s = tile.style;
        s.setProperty('--tile-blur', `${eased * MAX_BLUR}px`);
        s.setProperty('--tile-brightness', String(1 - eased * 0.5));
        s.setProperty('--tile-saturation', String(1 - eased * 0.5));
        s.setProperty('--tile-image-scale', String(1.03 + eased * 0.15));
        s.setProperty('--tile-transform',
          `translate3d(${side * eased * 18}%, ${-signed * eased * 24}%, ${eased * 180}px) rotateX(${-signed * MAX_TILT}deg) rotateZ(${side * signed * 3}deg) skewX(${-side * signed * 7}deg)`);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => {
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <ul ref={ref} className="tgrid">
      {projects.map((p, i) => (
        <li key={p.slug} className="tgrid__item" data-tilt>
          <Link href={`/work/${p.slug}`} className="tgrid__card" data-cursor="View">
            <div className="tgrid__media">
              <img src={p.img} alt={`${p.title} website preview`} width="900" height="1273" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" draggable={false} />
              <span className="tgrid__visit">
                View project
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={{ transform: 'rotate(-45deg)' }}><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>
            <div className="tgrid__meta">
              <span className="tgrid__num">({String(i + 1).padStart(2, '0')})</span>
              <div>
                <h3>{p.title}</h3>
                <p className="muted">{p.kind} · {p.tags.join(' · ')}</p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
