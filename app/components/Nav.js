'use client';
import { useEffect, useRef, useState } from 'react';
import FlipText from './FlipText';

const links = [
  ['About', '#about'],
  ['Skills', '#skills'],
  ['Work', '#work'],
  ['Services', '#services'],
  ['Testimonials', '#testimonials'],
  ['Contact', '#contact'],
];

// Lenis is created in Effects and exposed on window (absent under reduced motion).
const lenis = () => typeof window !== 'undefined' && window.__lenis;

export default function Nav({ email }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const firstLink = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      lenis() ? lenis().stop() : (document.documentElement.style.overflow = 'hidden');
      firstLink.current?.focus({ preventScroll: true });
    } else if (wasOpen.current) {
      // Only undo our own lock on close — on mount this would restart Lenis under the intro.
      lenis() ? lenis().start() : (document.documentElement.style.overflow = '');
    }
    wasOpen.current = open;
    const onKey = (e) => e.key === 'Escape' && open && (setOpen(false), toggleRef.current?.focus());
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    const l = lenis();
    if (l) { l.start(); l.scrollTo(href, { duration: 1.4 }); }
    else document.querySelector(href)?.scrollIntoView();
  };

  return (
    <>
      <header className="nav">
        <div className="nav__pill">
          <a href="#top" className="nav__logo" onClick={(e) => go(e, '#top')}>
            <span className="nav__mark" aria-hidden="true" />Hassan
          </a>
          <button
            ref={toggleRef}
            className={`nav__toggle ${open ? 'is-open' : ''}`}
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span /><span />
          </button>
        </div>
        <a className="nav__cta" href={`mailto:${email}`}><FlipText text="Let’s talk" /></a>
      </header>

      <div id="menu" className={`menu ${open ? 'is-open' : ''}`} inert={!open} aria-modal="true" role="dialog" aria-label="Site menu">
        <nav className="container menu__inner">
          <ul className="menu__links">
            {links.map(([label, href], i) => (
              <li key={href} style={{ '--i': i }}>
                <a ref={i === 0 ? firstLink : undefined} href={href} onClick={(e) => go(e, href)}>
                  <span className="muted">0{i + 1}</span><FlipText text={label} />
                </a>
              </li>
            ))}
          </ul>
          <a className="menu__mail" href={`mailto:${email}`}><FlipText text={email} stagger={0.015} /></a>
        </nav>
      </div>
    </>
  );
}
