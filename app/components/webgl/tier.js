// Device budget for WebGL effects:
//   'static' — very weak device: skip live WebGL, keep CSS fallbacks
//   'lite'   — phones / touch: lower resolution, fewer particles
//   'full'   — desktop
export function tier() {
  const n = navigator;
  if ((n.deviceMemory && n.deviceMemory <= 2) || (n.hardwareConcurrency && n.hardwareConcurrency <= 2)) return 'static';
  return matchMedia('(max-width: 767px), (pointer: coarse)').matches ? 'lite' : 'full';
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
