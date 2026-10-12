'use client';
import { useEffect, useRef } from 'react';

// Progressive blur along the bottom edge: content entering from below arrives soft and sharpens as it rises.
// Fades out at the end of the page so the footer reads clearly.
export default function BlurBar() {
  const el = useRef(null);

  useEffect(() => {
    const update = () => {
      const end = scrollY + innerHeight >= document.documentElement.scrollHeight - 160;
      el.current.classList.toggle('is-end', end);
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    return () => { removeEventListener('scroll', update); removeEventListener('resize', update); };
  }, []);

  return (
    <div ref={el} className="blur-bar" aria-hidden="true">
      <i /><i /><i /><i /><i />
    </div>
  );
}
