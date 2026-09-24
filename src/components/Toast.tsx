interface ToastProps {
  message: string;
  show: boolean;
  variant?: 'success' | 'error';
}

/** A minimal fixed-position toast. Purely presentational — the caller owns visibility state
 * (e.g. show it for a few seconds after a successful action) via the `show` prop. */
export default function Toast({ message, show, variant = 'success' }: ToastProps) {
  const isError = variant === 'error';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <div
        className={`pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg ${
          isError ? 'bg-red-600' : 'bg-ink'
        }`}
      >
        <span className={isError ? 'text-white' : 'text-gold-accent'}>{isError ? '!' : '✓'}</span>
        {message}
      </div>
    </div>
  );
}
