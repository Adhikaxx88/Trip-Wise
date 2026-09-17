interface StepIndicatorProps {
  current: number;
  total: number;
}

export default function StepIndicator({ current, total }: StepIndicatorProps) {
  const percent = Math.min(100, Math.round((current / total) * 100));

  return (
    <div
      className="fixed top-0 left-0 right-0 z-20"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-1.5 w-full bg-ink/10">
        <div
          className="h-full bg-gold-accent transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-center gap-1.5 pt-3">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i < current ? 'bg-gold-accent' : 'bg-ocean-light/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
