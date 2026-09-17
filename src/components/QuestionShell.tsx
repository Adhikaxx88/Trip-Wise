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
      className="flex min-h-screen w-full flex-col items-center justify-center bg-surface px-6 py-24 animate-slide-up"
    >
      <div className="w-full max-w-xl">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-ocean-mid">
          {eyebrow}
        </p>
        <h1 className="font-display mt-3 text-center text-3xl font-medium text-ink sm:text-4xl">
          {question}
        </h1>

        <div className="mt-10 space-y-3">{children}</div>

        <div className="mt-10 flex items-center justify-between">
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
