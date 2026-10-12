'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Volume2, VolumeX } from 'lucide-react';
import { MacKeyboard } from './ui/mac-keyboard';

/*
 * Intro gate: type "i am ready" into the foggy field to enter.
 *  - Desktop shows the Mac keyboard (pressed keys glow, next key pulses). Phones type with their own keyboard.
 *  - Key clicks from /audio/key-press.wav, mute toggle remembered in localStorage.
 *  - Skip link; returning visitors watch it auto-type instead of typing again.
 *  - Then a real loading bar (fonts, hero image, window load), then the forge-seam reveal:
 *    the field collapses into a glowing seam and the screen splits open along it.
 * Tells the page it's done via window.__introDone + an 'intro:reveal' event (Effects plays the hero intro).
 */

const TARGET = 'i am ready';
const SEEN = 'hk-intro-seen';
const MUTED = 'hk-intro-muted';
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};
const codeFor = (ch) => (ch === ' ' ? 'Space' : ch ? `Key${ch.toUpperCase()}` : null);

// Scroll is blocked (wheel / touch / scroll keys) rather than hidden with overflow, so the scrollbar
// stays put and nothing shifts when the site is revealed. The blocker is installed before hydration
// by the inline script in layout.js; lock() re-installs it for client-side visits.
const lock = () => {
  document.documentElement.classList.add('intro-lock');
  window.__introBlock ??= (e) => {
    if (e.type === 'keydown' && (e.target.closest('input, textarea') || !/^(Space|PageUp|PageDown|ArrowUp|ArrowDown|Home|End)$/.test(e.code))) return;
    e.preventDefault();
  };
  ['wheel', 'touchmove', 'keydown'].forEach((t) => addEventListener(t, window.__introBlock, { passive: false }));
};
const unlock = () => {
  document.documentElement.classList.remove('intro-lock');
  if (window.__introBlock) ['wheel', 'touchmove', 'keydown'].forEach((t) => removeEventListener(t, window.__introBlock));
};

function announce() {
  window.__introDone = true;
  window.dispatchEvent(new Event('intro:reveal'));
}

function createSparks(canvas) {
  const ctx = canvas.getContext('2d');
  const ps = [];
  let w = 0, h = 0, emitter = null, raf = 0;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const add = (x, y, vx, vy, life, size, hot) => ps.push({ x, y, vx, vy, life, max: life, size, hot });
  const frame = () => {
    ctx.clearRect(0, 0, w, h);
    if (emitter && ps.length < 140) {
      const r = emitter;
      add(r.left + Math.random() * r.width, r.top + r.height * (0.25 + Math.random() * 0.5),
        (Math.random() - 0.5) * 0.3, -(0.25 + Math.random() * 0.8), 80 + Math.random() * 100, 0.6 + Math.random() * 1.5, Math.random() < 0.35);
    }
    ctx.globalCompositeOperation = 'lighter';
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.vx = p.vx * 0.985 + (Math.random() - 0.5) * 0.05;
      p.vy = p.vy * 0.985 - 0.006;
      p.x += p.vx; p.y += p.vy;
      if (--p.life <= 0) { ps.splice(i, 1); continue; }
      const a = p.life / p.max;
      ctx.fillStyle = p.hot ? `rgba(255,120,40,${a * 0.18})` : `rgba(255,200,160,${a * 0.1})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3.2, 0, 6.283); ctx.fill();
      ctx.fillStyle = p.hot ? `rgba(255,170,90,${a})` : `rgba(255,232,210,${a * 0.8})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  };
  resize();
  addEventListener('resize', resize);
  raf = requestAnimationFrame(frame);
  return {
    setEmitter: (rect) => { emitter = rect; },
    burst(x, y, n, sx = 2.4, sy = 2.4, hot = 0.6) {
      for (let i = 0; i < n; i++) add(x, y, (Math.random() - 0.5) * sx * 2, (Math.random() - 0.5) * sy * 2 - 0.6, 40 + Math.random() * 60, 0.8 + Math.random() * 1.8, Math.random() < hot);
    },
    seam(y, n) {
      for (let i = 0; i < n; i++) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        add(Math.random() * w, y, (Math.random() - 0.5) * 3, dir * (1 + Math.random() * 6), 50 + Math.random() * 70, 0.8 + Math.random() * 2.2, Math.random() < 0.7);
      }
    },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', resize); },
  };
}

export default function Intro() {
  const root = useRef(null);
  const field = useRef(null);
  const input = useRef(null);
  const canvas = useRef(null);
  const sparks = useRef(null);
  const sound = useRef({ ctx: null, buf: null, raw: null });
  const busy = useRef(false);
  const [typed, setTyped] = useState('');
  const [wrong, setWrong] = useState(false);
  const [phase, setPhase] = useState('type'); // type → load → reveal → done
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  mutedRef.current = muted;
  const hint = useMemo(() => new Set(phase === 'type' && codeFor(TARGET[typed.length]) ? [codeFor(TARGET[typed.length])] : []), [phase, typed]);

  const click = () => {
    const s = sound.current;
    if (mutedRef.current || !s.raw) return;
    s.ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const play = () => {
      const src = s.ctx.createBufferSource();
      const gain = s.ctx.createGain();
      gain.gain.value = 0.25;
      src.buffer = s.buf;
      src.connect(gain).connect(s.ctx.destination);
      src.start();
    };
    if (s.buf) return play();
    s.ctx.decodeAudioData(s.raw.slice(0)).then((b) => { s.buf = b; play(); }).catch(() => {});
  };

  // Mount: bail out early when the intro shouldn't run, otherwise set up sparks, sound, focus.
  useEffect(() => {
    const el = root.current;
    const fallbackFired = getComputedStyle(el).visibility === 'hidden';
    if (fallbackFired || window.__introDone || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      announce();
      unlock();
      setPhase('done');
      return;
    }
    el.classList.add('is-live');
    lock();
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    setMuted(store.get(MUTED) === '1');
    const behind = document.querySelectorAll('main, footer, .nav');
    behind.forEach((n) => (n.inert = true));

    sparks.current = createSparks(canvas.current);
    const place = () => field.current && sparks.current?.setEmitter(field.current.getBoundingClientRect());
    place();
    addEventListener('resize', place);
    fetch('/audio/key-press.wav').then((r) => r.arrayBuffer()).then((b) => (sound.current.raw = b)).catch(() => {});

    const desktop = matchMedia('(pointer: fine)').matches;
    if (desktop) input.current.focus({ preventScroll: true });
    const onKey = (e) => {
      if (busy.current) return;
      if (!e.repeat) click();
      if (desktop && document.activeElement !== input.current && e.key.length === 1) input.current.focus({ preventScroll: true });
    };
    addEventListener('keydown', onKey);

    // Returning visitors: the field types itself.
    let auto;
    if (store.get(SEEN)) {
      let i = 0;
      auto = setInterval(() => {
        i++;
        accept(TARGET.slice(0, i));
        if (i >= TARGET.length) clearInterval(auto);
      }, 70);
    }

    return () => {
      clearInterval(auto);
      removeEventListener('keydown', onKey);
      removeEventListener('resize', place);
      sparks.current?.destroy();
      behind.forEach((n) => (n.inert = false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rendering null doesn't unmount, so hand the page back explicitly when the intro ends.
  useEffect(() => {
    if (phase !== 'done') return;
    unlock();
    document.querySelectorAll('main, footer, .nav').forEach((n) => (n.inert = false));
    sparks.current?.destroy();
    sparks.current = null;
  }, [phase]);

  function sparkAt(index) {
    const ch = field.current?.querySelectorAll('.intro__char')[index];
    if (!ch || !sparks.current) return;
    const r = ch.getBoundingClientRect();
    sparks.current.burst(r.left + r.width / 2, r.top + r.height / 2, 14);
  }

  function accept(value) {
    if (busy.current) return;
    setTyped(value);
    requestAnimationFrame(() => sparkAt(value.length - 1));
    if (value === TARGET) load();
  }

  function onChange(e) {
    const v = e.target.value.toLowerCase();
    if (TARGET.startsWith(v)) accept(v);
    else setWrong(true);
  }

  // Real loading: fonts, hero image and window load (capped at 6s), shown on the field's progress bar.
  function load() {
    if (busy.current) return;
    busy.current = true;
    setPhase('load');
    input.current?.blur();
    const img = new Image();
    img.src = '/hero.webp';
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => addEventListener('load', r, { once: true }));
    const ready = Promise.race([
      Promise.all([document.fonts.ready, img.decode().catch(() => {}), loaded]),
      new Promise((r) => setTimeout(r, 6000)),
    ]);
    const p = { v: 0 };
    const show = () => setProgress(p.v);
    const first = gsap.to(p, { v: 0.85, duration: 1, ease: 'power2.out', onUpdate: show });
    Promise.all([ready, first.then()]).then(() => gsap.to(p, { v: 1, duration: 0.35, ease: 'power1.in', onUpdate: show, onComplete: reveal }));
  }

  function skip() {
    if (busy.current) return;
    setTyped(TARGET);
    load();
  }

  // Forge seam split.
  function reveal() {
    setPhase('reveal');
    store.set(SEEN, '1');
    const el = root.current;
    const f = field.current.getBoundingClientRect();
    const seamY = f.top + f.height / 2;
    el.style.setProperty('--seam', `${seamY}px`);
    sparks.current.setEmitter(null);
    gsap.timeline({ onComplete: () => setPhase('done') })
      .to(el.querySelectorAll('.intro__fade'), { autoAlpha: 0, y: 12, duration: 0.45, ease: 'power2.in', stagger: 0.03 })
      .to(el.querySelector('.intro__keyboard'), { autoAlpha: 0, y: 80, rotationX: 50, filter: 'blur(6px)', duration: 0.7, ease: 'power3.in' }, 0)
      .to(field.current, { scaleY: 0.04, duration: 0.45, ease: 'power3.in' }, 0.15)
      .set(field.current, { autoAlpha: 0 })
      .fromTo(el.querySelector('.intro__seam'), { scaleX: f.width / innerWidth, autoAlpha: 1 }, { scaleX: 1, duration: 0.5, ease: 'expo.out' })
      .add(() => { sparks.current.seam(seamY, 160); announce(); })
      .to(el.querySelector('.intro__half--top'), { yPercent: -100, duration: 1.15, ease: 'expo.inOut' }, '+=0.05')
      .to(el.querySelector('.intro__half--bottom'), { yPercent: 100, duration: 1.15, ease: 'expo.inOut' }, '<')
      .to(el.querySelector('.intro__seam'), { autoAlpha: 0, scaleY: 6, duration: 0.6, ease: 'power2.out' }, '<')
      .to(canvas.current, { autoAlpha: 0, duration: 0.8 }, '-=0.5');
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    store.set(MUTED, next ? '1' : '0');
  }

  if (phase === 'done') return null;
  const pct = Math.round(progress * 100);

  return (
    <div ref={root} className={`intro is-${phase}`} role="dialog" aria-modal="true" aria-label="Welcome" onPointerDown={() => phase === 'type' && matchMedia('(pointer: fine)').matches && setTimeout(() => input.current?.focus({ preventScroll: true }))}>
      <div className="intro__half intro__half--top" />
      <div className="intro__half intro__half--bottom" />
      <canvas ref={canvas} className="intro__sparks" aria-hidden="true" />
      <div className="intro__seam" aria-hidden="true" />

      <p className="intro__brand intro__fade">Hassan Khan<span>Frontend &amp; Creative Developer</span></p>

      <div className="intro__center">
        <p className="intro__hint intro__fade">
          <span className="intro__hint-desktop">Type</span><span className="intro__hint-touch">Tap below and type</span>{' '}
          <em>“{TARGET}”</em> to visit my portfolio
        </p>
        <label ref={field} className={`intro__field ${wrong ? 'is-wrong' : ''}`} onAnimationEnd={(e) => e.animationName === 'intro-shake' && setWrong(false)}>
          <span className="sr-only">Type “{TARGET}” to enter the portfolio</span>
          <input
            ref={input}
            value={typed}
            onChange={onChange}
            disabled={phase !== 'type'}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            maxLength={TARGET.length}
          />
          <span className="intro__text" aria-hidden="true">
            {Array.from(TARGET).map((c, i) => (
              <span key={i} className={`intro__char ${i < typed.length ? 'is-typed' : ''} ${i === typed.length && phase === 'type' ? 'is-next' : ''}`}>
                {c === ' ' ? ' ' : c}
              </span>
            ))}
          </span>
          <span className="intro__progress" style={{ transform: `scaleX(${progress})` }} />
        </label>
        <p className="intro__status intro__fade" aria-live="polite">
          {phase === 'type' ? `${typed.length} / ${TARGET.length}` : `Loading ${pct}%`}
        </p>
      </div>

      <div className="intro__keyboard" aria-hidden="true">
        <div className="intro__tilt dark">
          <MacKeyboard soundSrc="" hintKeys={hint} />
        </div>
      </div>

      <button type="button" className="intro__mute intro__fade" onClick={toggleMute} aria-pressed={muted}>
        {muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
        <span>{muted ? 'Sound off' : 'Sound on'}</span>
      </button>
      <button type="button" className="intro__skip intro__fade" onClick={skip}>Skip intro →</button>
    </div>
  );
}
