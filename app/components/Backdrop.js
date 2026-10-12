import { Background, Fog } from './Lazy';

// Site-wide WebGL backdrop (ribbons + particles + fog), shared by every page.
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <Background />
      <div className="fog">
        <Fog colors={['#000000', '#140904', '#4a210c', '#9a4c1f', '#ffc79a']} resolution={0.5} speed={0.8} pointerStrength={0.5} vignette={0} noiseOpacity={0.1} />
      </div>
    </div>
  );
}
