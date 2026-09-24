import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'scale';

const OFFSETS: Record<RevealVariant, { x?: number; y?: number; scale?: number }> = {
  up: { y: 24 },
  down: { y: -20 },
  left: { x: -32 },
  right: { x: 32 },
  scale: { scale: 0.96 },
};

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}

export default function Reveal({ children, variant = 'up', delay = 0, className = '' }: RevealProps) {
  const offset = OFFSETS[variant];
  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x ?? 0,
      y: offset.y ?? 0,
      scale: offset.scale ?? 0.98,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        delay: delay / 1000,
        default: { type: 'spring', stiffness: 100, damping: 20 },
        opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
