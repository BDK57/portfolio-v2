'use client';
import { useEffect, useRef, useState } from 'react';
import { tier } from '../webgl/tier';
import { hand } from './handState';

/*
 * Hand control (desktop only): MediaPipe Hand Landmarker tracks one hand from the webcam, on-device.
 * A closed fist pulls the background embers into a glowing ball that follows the palm; opening the hand
 * releases them. The WASM runtime and model load from the official CDNs only after the visitor opts in,
 * so nobody else downloads anything.
 */
const MP_VERSION = '1.1.0'; // keep in sync with @mediapipe/tasks-vision in package.json
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const TIPS = [8, 12, 16, 20];
const MCPS = [5, 9, 13, 17];
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z - b.z) * 0.5);

/** 0 = open hand … 1 = fist: how far each fingertip has curled back toward the wrist. */
function fistAmount(lm) {
  const w = lm[0];
  const reach = TIPS.reduce((s, t, i) => s + dist(lm[t], w) / dist(lm[MCPS[i]], w), 0) / 4; // ~1.9 open, ~1.0 fist
  return Math.min(1, Math.max(0, (1.65 - reach) / 0.5));
}

export default function HandControl() {
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState('off'); // off | loading | on | error
  const [error, setError] = useState('');
  const [gesture, setGesture] = useState('none'); // none | open | fist
  const [showPreview, setShowPreview] = useState(true);
  const dialog = useRef(null);
  const video = useRef(null);
  const overlay = useRef(null);
  const run = useRef(null); // { stream, landmarker, stop }

  useEffect(() => {
    const ok = matchMedia('(pointer: fine) and (min-width: 1024px)').matches && !!navigator.mediaDevices?.getUserMedia && tier() !== 'static';
    setAvailable(ok);
    return () => stop();
  }, []);

  const open = () => { dialog.current.showModal(); window.__lenis?.stop(); };
  const close = () => dialog.current.close();
  const onClose = () => window.__lenis?.start();

  async function start() {
    setStatus('loading');
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numHands: 1,
      });
      const v = video.current;
      v.srcObject = stream;
      await v.play();
      run.current = { stream, landmarker, alive: true };
      setStatus('on');
      close();
      loop(HandLandmarker.HAND_CONNECTIONS);
    } catch (e) {
      stop();
      setStatus('error');
      setError(e?.name === 'NotAllowedError'
        ? 'Camera access was blocked. Allow the camera for this site in your browser’s address bar, then try again.'
        : e?.name === 'NotFoundError'
          ? 'No camera was found on this device.'
          : 'Hand tracking couldn’t start. Check your connection and try again.');
    }
  }

  function loop(connections) {
    const r = run.current;
    const v = video.current;
    const cv = overlay.current;
    const ctx = cv.getContext('2d');
    let smoothFist = 0;
    let lastGesture = 'none';
    let lastTime = -1;
    const frame = () => {
      if (!r.alive) return;
      if (v.readyState >= 2 && v.currentTime !== lastTime) {
        lastTime = v.currentTime;
        const res = r.landmarker.detectForVideo(v, performance.now());
        const lm = res.landmarks?.[0];
        cv.width = v.videoWidth;
        cv.height = v.videoHeight;
        ctx.clearRect(0, 0, cv.width, cv.height);
        if (lm) {
          smoothFist += (fistAmount(lm) - smoothFist) * 0.35;
          const palm = [0, 5, 9, 13, 17].reduce((p, i) => ({ x: p.x + lm[i].x / 5, y: p.y + lm[i].y / 5 }), { x: 0, y: 0 });
          const clampN = (n) => Math.max(-1, Math.min(1, n));
          // Mirror x (selfie view) and stretch a little so the ball can reach the screen edges.
          Object.assign(hand, { active: true, fist: smoothFist, x: clampN((1 - 2 * palm.x) * 1.3), y: clampN((1 - 2 * palm.y) * 1.3) });
          drawHand(ctx, lm, connections, cv.width, cv.height, smoothFist);
        } else {
          hand.active = false;
        }
        const g = !lm ? 'none' : smoothFist > 0.6 ? 'fist' : smoothFist < 0.4 ? 'open' : lastGesture;
        if (g !== lastGesture) setGesture((lastGesture = g));
      }
      r.raf = requestAnimationFrame(frame);
    };
    frame();
  }

  function stop() {
    const r = run.current;
    if (r) {
      r.alive = false;
      cancelAnimationFrame(r.raf);
      r.stream?.getTracks().forEach((t) => t.stop());
      r.landmarker?.close();
    }
    run.current = null;
    Object.assign(hand, { active: false, fist: 0 });
    if (video.current) video.current.srcObject = null;
    setStatus('off');
    setGesture('none');
  }

  if (!available) return null;
  const on = status === 'on';

  return (
    <>
      <button type="button" className={`hand-fab ${on ? 'is-on' : ''}`} onClick={on ? stop : open} aria-haspopup="dialog">
        <HandIcon />
        <span>{on ? 'Stop hand control' : 'Hand control'}</span>
      </button>

      <div className={`hand-panel ${on ? 'is-on' : ''} ${showPreview ? '' : 'is-collapsed'}`} aria-hidden={!on}>
        <div className="hand-panel__view">
          <video ref={video} muted playsInline aria-hidden="true" />
          <canvas ref={overlay} aria-hidden="true" />
        </div>
        <div className="hand-panel__bar">
          <p className={`hand-pill is-${gesture}`} aria-live="polite">
            <span className="dot" />
            {gesture === 'fist' ? 'Fist: gathering' : gesture === 'open' ? 'Open hand' : 'Show your hand'}
          </p>
          <button type="button" className="hand-panel__toggle" onClick={() => setShowPreview((s) => !s)} tabIndex={on ? 0 : -1}>
            {showPreview ? 'Hide preview' : 'Show preview'}
          </button>
        </div>
      </div>

      <dialog ref={dialog} className="hand-modal" onClose={onClose} aria-labelledby="hand-title">
        <button type="button" className="hand-modal__x" onClick={close} aria-label="Close">×</button>
        <p className="eyebrow"><span>(✦)</span> Experimental</p>
        <h2 id="hand-title" className="hand-modal__title">Move the embers with your hand</h2>
        <p className="lead">Turn on your camera and the glowing particles in the background respond to your hand in real time.</p>
        <ol className="hand-steps">
          <li><span>01</span><div><strong>Allow the camera</strong><p className="muted">Your browser will ask for permission. Hold one hand up, about an arm’s length away.</p></div></li>
          <li><span>02</span><div><strong>Close your fist</strong><p className="muted">Every particle collapses into a spinning ball of light that follows your hand around the screen.</p></div></li>
          <li><span>03</span><div><strong>Open your hand</strong><p className="muted">The ball bursts and the particles drift back to their places.</p></div></li>
        </ol>
        <p className="hand-privacy">
          <LockIcon />
          <span>Runs entirely on your device with Google’s MediaPipe. Nothing is recorded, stored or uploaded. The first start downloads the hand model (about 8&nbsp;MB). Works best in good light.</span>
        </p>
        {status === 'error' && <p className="hand-error" role="alert">{error}</p>}
        <div className="hand-modal__actions">
          <button type="button" className="btn" onClick={start} disabled={status === 'loading'}>
            <span className="btn__icon"><HandIcon /></span>
            <span>{status === 'loading' ? 'Starting…' : 'Enable camera'}</span>
          </button>
          <button type="button" className="hand-modal__later" onClick={close}>Not now</button>
        </div>
      </dialog>
    </>
  );
}

function drawHand(ctx, lm, connections, w, h, fist) {
  const color = `rgba(255, ${Math.round(160 - fist * 70)}, ${Math.round(90 - fist * 60)}, 0.95)`;
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 220, 190, 0.55)';
  ctx.beginPath();
  for (const { start, end } of connections) {
    ctx.moveTo(lm[start].x * w, lm[start].y * h);
    ctx.lineTo(lm[end].x * w, lm[end].y * h);
  }
  ctx.stroke();
  ctx.fillStyle = color;
  for (const p of lm) {
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

const HandIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
