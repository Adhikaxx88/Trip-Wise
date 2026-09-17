import type { Vibe } from '../types';

interface VibeTheme {
  base: string;
  blobs: [string, string, string];
}

const VIBE_THEMES: Record<Vibe, VibeTheme> = {
  relaxing: {
    base: 'linear-gradient(135deg, #04293A 0%, #0A466B 50%, #17678A 100%)',
    blobs: ['#2EC4B6', '#FFDA61', '#3F7194'],
  },
  adventurous: {
    base: 'linear-gradient(135deg, #0B1F1B 0%, #1F4E3D 50%, #3F7194 100%)',
    blobs: ['#74C69D', '#FFB454', '#2573A4'],
  },
  cultural: {
    base: 'linear-gradient(135deg, #2B1B12 0%, #7A4B23 50%, #B9762F 100%)',
    blobs: ['#FFDA61', '#FF7A59', '#C97B3D'],
  },
  romantic: {
    base: 'linear-gradient(135deg, #250F2E 0%, #6B2F5E 50%, #A6416B 100%)',
    blobs: ['#FF7A59', '#FFB454', '#8C4B8C'],
  },
};

interface GradientBackdropProps {
  vibe: Vibe;
  className?: string;
}

export default function GradientBackdrop({ vibe, className = '' }: GradientBackdropProps) {
  const theme = VIBE_THEMES[vibe];
  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ background: theme.base }}
    >
      <div
        className="absolute -left-12 -top-12 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: theme.blobs[0] }}
      />
      <div
        className="absolute right-0 top-1/4 h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{ background: theme.blobs[1] }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: theme.blobs[2] }}
      />
    </div>
  );
}
