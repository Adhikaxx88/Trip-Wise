import type { ReactNode } from 'react';
import Button from './Button';

interface QuestionShellProps {
  eyebrow: string;
  question: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  stepKey: string;
}

export default function QuestionShell({
  eyebrow,
  question,
  children,
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled,
  stepKey,
}: QuestionShellProps) {
  return (
    <div
      key={stepKey}
      className="flex min-h-dvh w-full flex-col items-center justify-center bg-surface px-4 py-16 animate-slide-up sm:px-6 sm:py-24"
      style={{
        paddingTop: 'max(4rem, calc(2.5rem + env(safe-area-inset-top)))',
        paddingBottom: 'max(4rem, calc(2.5rem + env(safe-area-inset-bottom)))',
      }}
    >
      <div className="w-full max-w-xl">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-ocean-mid sm:text-sm">
          {eyebrow}
        </p>
        <h1 className="font-display mt-3 text-center text-2xl font-medium text-ink sm:text-3xl md:text-4xl">
          {question}
        </h1>

        <div className="mt-8 space-y-3 sm:mt-10">{children}</div>

        <div className="mt-8 flex items-center justify-between sm:mt-10">
          {onBack ? (
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {onNext && (
            <Button variant="primary" onClick={onNext} disabled={nextDisabled}>
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
