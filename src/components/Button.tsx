import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gold-accent text-ink hover:bg-gold-accent-deep shadow-[0_8px_24px_-8px_rgba(255,218,97,0.6)]',
  secondary:
    'bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm',
  ghost: 'text-ocean-mid hover:text-ocean-deep underline underline-offset-4',
};

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-transform duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
