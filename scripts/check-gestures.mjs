// Self-check for the hand-gesture classifier: node scripts/check-gestures.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert';
const src = readFileSync(new URL('../app/components/hand/gestures.js', import.meta.url), 'utf8');
const { classify, pinchRatio } = await import('data:text/javascript,' + encodeURIComponent(src));

// Synthetic right hand, palm facing camera: wrist low, fingers point up (smaller y = higher).
function makeHand(up, thumbOnIndex = false) {
  const lm = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.9, z: 0 }));
  lm[0] = { x: 0.5, y: 0.9, z: 0 };
  const xs = [0.42, 0.48, 0.54, 0.6];           // index, middle, ring, pinky
  const base = [5, 9, 13, 17];
  base.forEach((b, f) => {
    lm[b] = { x: xs[f], y: 0.62, z: 0 };                                   // MCP
    lm[b + 1] = up[f] ? { x: xs[f], y: 0.48, z: 0 } : { x: xs[f], y: 0.55, z: 0 };   // PIP
    lm[b + 2] = up[f] ? { x: xs[f], y: 0.4, z: 0 } : { x: xs[f], y: 0.64, z: 0 };    // DIP
    lm[b + 3] = up[f] ? { x: xs[f], y: 0.33, z: 0 } : { x: xs[f], y: 0.74, z: 0 };   // TIP (curled back toward wrist)
  });
  lm[4] = thumbOnIndex ? { x: lm[8].x + 0.01, y: lm[8].y + 0.01, z: 0 } : { x: 0.3, y: 0.68, z: 0 };
  return lm;
}
const cases = [
  ['open', makeHand([1, 1, 1, 1])],
  ['fist', makeHand([0, 0, 0, 0])],
  ['point', makeHand([1, 0, 0, 0])],
  ['scroll', makeHand([1, 1, 0, 0])],
  ['point', makeHand([0, 0, 0, 0], true)], // pinch: index bent onto thumb, others curled -> still pointer
];
cases[4][1][8] = { x: 0.44, y: 0.5, z: 0 }; cases[4][1][4] = { x: 0.45, y: 0.51, z: 0 }; // index half-bent to meet thumb
for (const [want, lm] of cases) { const got = classify(lm); console.log(want.padEnd(6), '->', got); assert.equal(got, want); }
assert(pinchRatio(cases[4][1]) < 0.3, 'pinch detected');
assert(pinchRatio(cases[2][1]) > 0.45, 'pointing is not a pinch');
console.log('all gesture checks passed');
