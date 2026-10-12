// Shared, mutable hand state: written by HandControl (MediaPipe), read every frame by the particle backdrop.
// A plain object (not React state) because it changes ~30×/s and only WebGL reads it.
export const hand = {
  active: false, // tracking is running and a hand is visible
  fist: 0,       // 0 = open hand … 1 = closed fist (smoothed)
  x: 0,          // palm centre in normalised device coords (-1 … 1), mirrored like a selfie
  y: 0,
};

// Dev-only handle so the effect can be exercised without a real hand in front of a camera.
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') window.__hand = hand;
