'use client';
import dynamic from 'next/dynamic';

// WebGL layers load after first paint so text and layout never wait on three.js.
export const Background = dynamic(() => import('./webgl/Background'), { ssr: false });
export const Fog = dynamic(() => import('./webgl/AuroraFlow'), { ssr: false });
export const HeroRipple = dynamic(() => import('./webgl/HeroRipple'), { ssr: false });
export const SkillBubbles = dynamic(() => import('./webgl/SkillBubbles'), { ssr: false });
