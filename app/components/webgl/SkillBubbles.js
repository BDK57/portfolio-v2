'use client';
import { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { tier, reducedMotion } from './tier';

/*
 * Zero-gravity skill bubbles. A tiny 2D physics sim (drift, soft pull to centre, circle
 * collisions, walls, pointer repulsion) drives glossy 3D spheres in an orthographic scene
 * where 1 unit = 1 CSS pixel. Each sphere carries its tech logo on its face.
 * ponytail: O(n²) collision pass — fine for ~20 bubbles, use a spatial grid past ~200.
 */

const PALETTE = [
  { color: '#ff6b1a', metal: 0.05, logo: '#141414' },
  { color: '#262422', metal: 0.2, logo: '#f3f2ef' },
  { color: '#b8743d', metal: 0.45, logo: '#f3f2ef' },
];

function logoTexture(path, color) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = color;
  x.translate(56, 56);
  x.scale(144 / 24, 144 / 24); // simple-icons paths use a 24×24 viewBox
  x.fill(new Path2D(path));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function step(bodies, w, h, pointer, dt) {
  const k = dt * 60;
  const pr = Math.min(w, h) * 0.16; // pointer influence radius
  for (const b of bodies) {
    b.vx += (-b.x * 0.00022 + Math.sin(b.t += 0.01 * k) * 0.025) * k;
    b.vy += (-b.y * 0.0005 + Math.cos(b.t * 1.3) * 0.025) * k;
    const dx = b.x - pointer.x, dy = b.y - pointer.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < pr + b.r) {
      const push = (1 - d / (pr + b.r)) * (1.4 + pointer.speed * 0.08) * k;
      b.vx += (dx / d) * push;
      b.vy += (dy / d) * push;
    }
    b.vx *= 0.97 ** k;
    b.vy *= 0.97 ** k;
    b.x += b.vx * k;
    b.y += b.vy * k;
    const mx = w / 2 - b.r, my = h / 2 - b.r;
    if (Math.abs(b.x) > mx) { b.x = Math.sign(b.x) * mx; b.vx *= -0.6; }
    if (Math.abs(b.y) > my) { b.y = Math.sign(b.y) * my; b.vy *= -0.6; }
  }
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.01;
      const overlap = a.r + b.r - d;
      if (overlap <= 0) continue;
      const nx = dx / d, ny = dy / d;
      const ma = a.r * a.r, mb = b.r * b.r, total = ma + mb;
      a.x -= nx * overlap * (mb / total);
      a.y -= ny * overlap * (mb / total);
      b.x += nx * overlap * (ma / total);
      b.y += ny * overlap * (ma / total);
      const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (vn < 0) {
        const j2 = (-1.6 * vn) / (1 / ma + 1 / mb);
        a.vx -= (j2 / ma) * nx; a.vy -= (j2 / ma) * ny;
        b.vx += (j2 / mb) * nx; b.vy += (j2 / mb) * ny;
      }
    }
  }
}

function Bubbles({ skills, pointer, still }) {
  const { size } = useThree();
  const groups = useRef([]);
  const textures = useMemo(() => skills.map((s, i) => logoTexture(s.icon, PALETTE[i % 3].logo)), [skills]);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

  const bodies = useMemo(() => skills.map((s, i) => ({ core: s.core, r: 1, x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200, vx: 0, vy: 0, t: i * 1.7 })), [skills]);

  // Size bubbles to the stage; settle the sim so the first frame is already calm.
  useMemo(() => {
    const base = Math.sqrt(size.width * size.height); // keeps ~a third of the stage filled at any size
    for (const b of bodies) b.r = base * (b.core ? 0.095 : 0.068);
    for (let i = 0; i < 240; i++) step(bodies, size.width, size.height, { x: 1e6, y: 1e6, speed: 0 }, 1 / 60);
  }, [bodies, size.width, size.height]);

  useFrame((_, dt) => {
    if (!still) step(bodies, size.width, size.height, pointer.current, Math.min(dt, 1 / 30));
    bodies.forEach((b, i) => {
      const g = groups.current[i];
      g.position.set(b.x, b.y, 0);
      g.scale.setScalar(b.r);
    });
  });

  return skills.map((s, i) => {
    const p = PALETTE[i % 3];
    return (
      <group key={s.name} ref={(el) => (groups.current[i] = el)}>
        <mesh>
          <sphereGeometry args={[1, 48, 48]} />
          <meshPhysicalMaterial color={p.color} metalness={p.metal} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} />
        </mesh>
        <mesh position={[0, 0, 1.01]}>
          <planeGeometry args={[1.05, 1.05]} />
          <meshBasicMaterial map={textures[i]} transparent toneMapped={false} />
        </mesh>
      </group>
    );
  });
}

class WebGLErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function SkillBubbles({ skills }) {
  const ref = useRef(null);
  const pointer = useRef({ x: 1e6, y: 1e6, speed: 0 });
  const [visible, setVisible] = useState(false);
  const level = useMemo(tier, []);
  const still = useMemo(() => reducedMotion() || level === 'static', [level]);

  useEffect(() => {
    const el = ref.current;
    let last = null;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = -(e.clientY - r.top - r.height / 2);
      const inside = Math.abs(x) < r.width / 2 && Math.abs(y) < r.height / 2;
      const speed = last ? Math.hypot(x - last.x, y - last.y) : 0;
      pointer.current = inside ? { x, y, speed } : { x: 1e6, y: 1e6, speed: 0 };
      last = inside ? { x, y } : null;
    };
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onMove, { passive: true });
    return () => { io.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onMove); };
  }, []);

  const fallback = <ul className="skills__chips">{skills.map((s) => <li key={s.name}>{s.name}</li>)}</ul>;

  return (
    <div ref={ref} className="skills__canvas" aria-hidden="true">
      <WebGLErrorBoundary fallback={fallback}>
        <Canvas
          orthographic
          camera={{ zoom: 1, position: [0, 0, 500], near: 1, far: 2000 }}
          dpr={level === 'full' ? [1, 2] : [1, 1.5]}
          frameloop={still ? 'demand' : visible ? 'always' : 'never'}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[300, 400, 500]} intensity={1.6} />
          <Environment resolution={128}>
            <Lightformer form="circle" intensity={4} position={[-2, 3, 5]} scale={1.2} />
            <Lightformer form="rect" intensity={1.5} color="#ffb27a" position={[5, -3, 1]} scale={[3, 8, 1]} />
          </Environment>
          <Bubbles skills={skills} pointer={pointer} still={still} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
