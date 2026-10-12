'use client';
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { tier, reducedMotion } from './tier';
import { hand } from '../hand/handState';

/*
 * Site-wide Laocoon-style backdrop: glowing bronze light ribbons with travelling flashes,
 * plus a 3D field of drifting dust and ember sparks. One fixed canvas behind every section;
 * page scroll morphs the ribbons and lifts the particles (nearer = faster) so the whole
 * site reads as one continuous scene.
 */

const ribbonVert = /* glsl */ `
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const ribbonFrag = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uScroll;
uniform vec2 uRes;

vec3 ribbon(vec2 p, float ang, float freq, float amp, float off, float spd, float ph, vec3 col) {
  float c = cos(ang), s = sin(ang);
  vec2 q = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  float t = uTime * spd + ph + uScroll * 5.0;
  float y = off + amp * sin(q.x * freq + t) + amp * 0.45 * sin(q.x * freq * 2.3 - t * 1.4 + ph);
  float d = abs(q.y - y);
  float core = 0.0035 / (d + 0.0035);
  float halo = exp(-d * 6.5);
  float travel = mod(uTime * spd * 0.5 + ph * 3.0, 6.0) - 3.0;   // a flash running along the ribbon
  float flash = exp(-pow(q.x - travel, 2.0) * 2.5);
  return col * (core * 0.5 + halo * 0.2) * (0.45 + 1.3 * flash);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 col = vec3(0.047, 0.043, 0.039);
  col += ribbon(p,  0.35 + uScroll * 0.9, 1.6, 0.18,  0.15, 0.22, 0.0, vec3(1.0, 0.52, 0.22));
  col += ribbon(p, -0.25 - uScroll * 0.6, 1.2, 0.22, -0.28, 0.16, 2.1, vec3(0.9, 0.42, 0.16)) * 0.75;
  col += ribbon(p,  1.15 + uScroll * 0.7, 2.0, 0.12,  0.45, 0.2, 4.2, vec3(0.75, 0.36, 0.14)) * 0.5;
  col *= mix(0.5, 1.0, smoothstep(1.3, 0.2, length(p * vec2(0.8, 1.0))));
  col = col / (1.0 + col * 0.7);
  gl_FragColor = vec4(col, 1.0);
}
`;

// Hand-ball radius in NDC (screen height = 2), so 0.6 ≈ a ball 60% of the screen tall.
const BALL_R = 0.6;

const dustVert = /* glsl */ `
#define BALL_R ${BALL_R.toFixed(3)}
attribute float aSeed;
attribute vec3 aDir;    // random unit vector: this ember's spot on the hand ball
uniform float uTime;
uniform float uScroll;
uniform float uPx;
uniform vec2 uMouse;   // smoothed pointer, NDC
uniform float uGather; // 0 = free field … 1 = collapsed into the ball (hand-control fist)
uniform vec2 uBall;    // ball centre, NDC
uniform float uAspect;
varying float vAlpha;
varying float vWarm;
void main() {
  vec3 p = position;
  float near = (p.z + 6.0) / 8.0;
  p.y = mod(p.y + uTime * (0.04 + aSeed * 0.1) + uScroll * (3.0 + near * 9.0) + 5.0, 10.0) - 5.0;
  p.x += sin(uTime * 0.3 + aSeed * 20.0) * 0.15;
  // Subtle parallax: the field eases a little *against* the cursor; nearer embers move a bit more.
  p.xy -= uMouse * vec2(0.3, 0.2) * (0.3 + near * 0.7);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  vWarm = step(0.82, aSeed);
  float size = mix(1.2, 2.6, aSeed) * (1.0 + vWarm) * uPx * (6.0 / -mv.z);
  vAlpha = 0.55 + 0.45 * sin(uTime * (1.0 + aSeed * 3.0) + aSeed * 40.0);

  // Hand control: each ember streams (staggered by seed) onto a slowly spinning sphere at the hand.
  float g = clamp(uGather * 1.6 - aSeed * 0.6, 0.0, 1.0);
  g = g * g * (3.0 - 2.0 * g);
  if (g > 0.0) {
    float a = uTime * 0.6;
    vec3 d = vec3(aDir.x * cos(a) + aDir.z * sin(a), aDir.y, -aDir.x * sin(a) + aDir.z * cos(a));
    float r = BALL_R * (0.82 + 0.18 * fract(aSeed * 7.13)); // ~60% of screen height; a little volume, not a hollow shell
    vec2 onBall = uBall + vec2(d.x / uAspect, d.y) * r;
    vec2 ndc = mix(clip.xy / clip.w, onBall, g);
    clip = vec4(ndc * clip.w, clip.z, clip.w);
    float front = 0.55 + 0.45 * d.z; // nearer side of the ball glows brighter
    vAlpha = mix(vAlpha, (0.5 + 0.5 * vAlpha) * (0.35 + front), g);
    size = mix(size, size * (0.9 + 0.6 * front), g);
  }
  gl_Position = clip;
  gl_PointSize = size;
}
`;

const dustFrag = /* glsl */ `
varying float vAlpha;
varying float vWarm;
void main() {
  float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
  vec3 c = mix(vec3(1.0, 0.92, 0.85), vec3(1.0, 0.55, 0.2), vWarm);
  gl_FragColor = vec4(c, a * vAlpha * 0.8);
}
`;

function Scene({ count, scroll, pointer }) {
  // Materials built in code: R3F clones a `uniforms` JSX prop, which would detach per-frame updates.
  const ribbonMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: ribbonVert, fragmentShader: ribbonFrag, depthTest: false, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uRes: { value: new THREE.Vector2() } },
  }), []);
  const dustMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: dustVert, fragmentShader: dustFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uPx: { value: 1 }, uMouse: { value: new THREE.Vector2() }, uGather: { value: 0 }, uBall: { value: new THREE.Vector2() }, uAspect: { value: 1 } },
  }), []);
  const ribbonUniforms = ribbonMat.uniforms;
  const dustUniforms = dustMat.uniforms;

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const dir = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos.set([(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, 2 - Math.random() * 8], i * 3);
      seed[i] = Math.random();
      const z = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2, s = Math.sqrt(1 - z * z);
      dir.set([s * Math.cos(t), s * Math.sin(t), z], i * 3); // uniform on the sphere
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aDir', new THREE.BufferAttribute(dir, 3));
    return g;
  }, [count]);

  useFrame((state, dt) => {
    const s = (ribbonUniforms.uScroll.value += (scroll.current - ribbonUniforms.uScroll.value) * 0.06);
    ribbonUniforms.uTime.value += dt;
    state.gl.getDrawingBufferSize(ribbonUniforms.uRes.value);
    dustUniforms.uTime.value = ribbonUniforms.uTime.value;
    dustUniforms.uScroll.value = s;
    dustUniforms.uPx.value = state.gl.getPixelRatio();
    dustUniforms.uMouse.value.lerp(pointer.current, 0.05); // eased, so the drift feels calm
    // Hand control: gather toward the fist, follow the palm (both eased so tracking jitter disappears).
    const k = 1 - Math.exp(-dt * 6);
    dustUniforms.uGather.value += ((hand.active ? hand.fist : 0) - dustUniforms.uGather.value) * k;
    const aspect = state.size.width / state.size.height;
    dustUniforms.uAspect.value = aspect;
    if (hand.active) {
      // Keep the whole ball on screen while it follows the palm.
      const mx = Math.max(0, 1 - BALL_R / aspect), my = 1 - BALL_R;
      const tx = Math.max(-mx, Math.min(mx, hand.x)), ty = Math.max(-my, Math.min(my, hand.y));
      dustUniforms.uBall.value.lerp({ x: tx, y: ty }, 1 - Math.exp(-dt * 10));
    }
  });

  return (
    <>
      <mesh material={ribbonMat} frustumCulled={false} renderOrder={-1}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <points geometry={geometry} material={dustMat} frustumCulled={false} />
    </>
  );
}

export default function Background() {
  const scroll = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const level = useMemo(tier, []);
  const still = useMemo(reducedMotion, []);

  useEffect(() => {
    const onScroll = () => { scroll.current = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight); };
    const onMove = (e) => { pointer.current = { x: (e.clientX / innerWidth) * 2 - 1, y: -((e.clientY / innerHeight) * 2 - 1) }; };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('pointermove', onMove, { passive: true });
    return () => { removeEventListener('scroll', onScroll); removeEventListener('pointermove', onMove); };
  }, []);

  if (level === 'static') return null;
  const lite = level === 'lite';

  return (
    <Canvas
      dpr={lite ? [0.75, 1] : [1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 5], fov: 50 }}
      frameloop={still ? 'demand' : 'always'}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Scene count={lite ? 2000 : 8000} scroll={scroll} pointer={pointer} />
    </Canvas>
  );
}
