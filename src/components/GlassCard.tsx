import type { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function GlassCard({ children, className = '', ...props }: GlassCardProps) {
  return (
    <div className={`glass-panel rounded-3xl text-white ${className}`} {...props}>
      {children}
    </div>
  );
}
