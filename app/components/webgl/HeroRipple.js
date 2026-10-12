'use client';
import { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, useFBO, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { tier, reducedMotion } from './tier';

/*
 * Image Ripple Effect — ported from Componentry (componentry.dev/docs/components/image-ripple-effect).
 * Changes for this site: one transparent cut-out sampled straight in the final shader, laid out like
 * CSS `object-fit: cover; object-position: top` (no second FBO); 8-bit wave buffer; pointer tracked
 * on window (hero text sits on top of the canvas); render paused while the hero is off-screen; and it
 * marks its parent `.has-ripple` once live so the server-rendered <img> can step aside.
 */

// The image is sampled directly here (the original renders it to a second FBO first);
// uRect is the cover-fit image box in drawing-buffer pixels.
const fragmentShader = `
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec2 winResolution;
uniform vec4 uRect;
uniform float uStrength;
const float PI = 3.141592653589793238;
void main() {
  vec2 vUvScreen = gl_FragCoord.xy / winResolution.xy;
  vec4 displacement = texture2D(uDisplacement, vUvScreen);
  float theta = displacement.r * 2.0 * PI;
  vec2 dir = vec2(sin(theta), cos(theta));
  vec2 uv = vUvScreen + dir * displacement.r * uStrength;
  vec2 iuv = (uv * winResolution - uRect.xy) / uRect.zw;
  if (iuv.x < 0.0 || iuv.y < 0.0 || iuv.x > 1.0 || iuv.y > 1.0) { gl_FragColor = vec4(0.0); return; }
  vec4 c = texture2D(uTexture, iuv);
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}
`;

const vertexShader = `
void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const BRUSH = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white" stop-opacity="1"/><stop offset="65%" stop-color="white" stop-opacity="0.55"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient></defs><rect width="128" height="128" fill="url(#g)"/></svg>',
)}`;

function RippleScene({ src, pointer, onReady, distortionStrength = 0.018, waveCount = 24, waveSize = 50, waveRotationSpeed = 0.02, waveFadeMultiplier = 0.9, waveGrowth = 0.12, waveSpawnThreshold = 5 }) {
  const { gl, camera, size } = useThree();
  const [brush, image] = useTexture([BRUSH, src]);
  const rippleScene = useMemo(() => new THREE.Scene(), []);
  // 8-bit target: half-float (drei default) is not renderable on some GPUs, and waves need no more.
  const fboBase = useFBO({ depthBuffer: false, stencilBuffer: false, type: THREE.UnsignedByteType });
  const waves = useRef([]);
  const prev = useRef({ x: 0, y: 0 });
  const current = useRef(0);
  // Material built once in code: R3F clones a `uniforms` JSX prop, which would detach per-frame updates.
  // Outputs premultiplied colour with NoBlending so the cut-out's edges don't darken.
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    blending: THREE.NoBlending,
    uniforms: {
      uDisplacement: { value: null },
      uTexture: { value: image },
      uRect: { value: new THREE.Vector4() },
      winResolution: { value: new THREE.Vector2(1, 1) },
      uStrength: { value: distortionStrength },
    },
  }), [distortionStrength, image]);
  const { uniforms } = material;
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    const meshes = Array.from({ length: waveCount }, () => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(waveSize, waveSize, 1, 1),
        new THREE.MeshBasicMaterial({ transparent: true, map: brush, depthWrite: false }),
      );
      m.visible = false;
      rippleScene.add(m);
      return m;
    });
    waves.current = meshes;
    return () => meshes.forEach((m) => { rippleScene.remove(m); m.geometry.dispose(); m.material.dispose(); });
  }, [brush, rippleScene, waveCount, waveSize]);

  useEffect(onReady, [onReady]);

  useFrame(() => {
    const x = pointer.current.x - size.width / 2;
    const y = -pointer.current.y + size.height / 2;
    const moved = Math.abs(x - prev.current.x) > waveSpawnThreshold || Math.abs(y - prev.current.y) > waveSpawnThreshold;
    if (moved && waves.current.length) {
      const m = waves.current[current.current % waves.current.length];
      m.position.set(x, y, 0);
      m.visible = true;
      m.scale.set(1.75, 1.75, 1);
      m.rotation.z = Math.random() * Math.PI;
      m.material.opacity = 1;
      current.current++;
    }
    prev.current = { x, y };

    for (const m of waves.current) {
      if (!m.visible) continue;
      m.rotation.z += waveRotationSpeed;
      m.scale.x = 0.98 * m.scale.x + waveGrowth;
      m.scale.y = 0.98 * m.scale.y + waveGrowth;
      m.material.opacity *= waveFadeMultiplier;
      if (m.material.opacity <= 0.01) m.visible = false;
    }

    // Cover-fit, top-anchored — mirrors the fallback <img>'s CSS.
    const res = gl.getDrawingBufferSize(uniforms.winResolution.value);
    const aspect = image.image.width / image.image.height;
    const [iw, ih] = res.x / res.y > aspect ? [res.x, res.x / aspect] : [res.y * aspect, res.y];
    uniforms.uRect.value.set((res.x - iw) / 2, res.y - ih, iw, ih);
    uniforms.uDisplacement.value = fboBase.texture;

    gl.setRenderTarget(fboBase);
    gl.clear();
    gl.render(rippleScene, camera);
    gl.setRenderTarget(null);
  });

  return (
    <mesh material={material}>
      <planeGeometry args={[size.width, size.height, 1, 1]} />
    </mesh>
  );
}

class WebGLErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function HeroRipple({ src }) {
  const ref = useRef(null);
  const pointer = useRef({ x: -9999, y: -9999 });
  const [visible, setVisible] = useState(true);
  const enabled = useMemo(() => tier() !== 'static' && !reducedMotion(), []);
  const onReady = useMemo(() => () => ref.current?.parentElement.classList.add('has-ripple'), []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    addEventListener('pointermove', onMove, { passive: true });
    return () => { io.disconnect(); removeEventListener('pointermove', onMove); };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={ref} className="ripple" aria-hidden="true">
      <WebGLErrorBoundary>
        <Canvas dpr={tier() === 'lite' ? [1, 1.5] : [1, 2]} frameloop={visible ? 'always' : 'never'} gl={{ alpha: true, antialias: false }}>
          <OrthographicCamera makeDefault position={[0, 0, 2]} near={-1000} far={1000} />
          <RippleScene src={src} pointer={pointer} onReady={onReady} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
