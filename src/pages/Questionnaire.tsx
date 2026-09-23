import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatFab from '../components/ChatFab';
import OptionCard from '../components/OptionCard';
import QuestionShell from '../components/QuestionShell';
import StepIndicator from '../components/StepIndicator';
import { useCurrentTrip } from '../context/CurrentTripContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTripPreferences } from '../context/TripPreferencesContext';
import {
  BUDGET_OPTIONS,
  DATE_RANGE_PRESETS,
  datesFromPresetDays,
  getVisibleSteps,
  GROUP_SIZE_PRESETS,
  GROUP_TYPE_OPTIONS,
  INTENSITY_OPTIONS,
  VIBE_OPTIONS,
} from '../data/questionOptions';
import { daysBetweenInclusive, formatDateRange, formatFullDate, todayIsoDate } from '../logic/dates';
import { matchTrip } from '../logic/matchTrip';
import type { TripPreferences } from '../types';

export default function Questionnaire() {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = useTripPreferences();
  const { setCurrentTrip } = useCurrentTrip();
  const { subscription, canRegenerate, regenerationsRemaining, recordRegeneration } = useSubscription();
  const [draft, setDraft] = useState<TripPreferences>(preferences);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMatching, setIsMatching] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [groupSizeInput, setGroupSizeInput] = useState(draft.groupSize?.toString() ?? '');

  const steps = useMemo(() => getVisibleSteps(draft), [draft]);
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const isLastStep = stepIndex === steps.length - 1;
  const nextLabel = isLastStep ? 'See my trip' : 'Next';

  const goNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      finish();
    }
  };

  const setDateRange = (startDate: string | null, endDate: string | null) => {
    setDraft((prev) => ({
      ...prev,
      startDate,
      endDate,
      durationDays: startDate && endDate ? daysBetweenInclusive(startDate, endDate) : null,
    }));
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    } else {
      navigate('/');
    }
  };

  const finish = () => {
    if (!canRegenerate) {
      setLimitReached(true);
      return;
    }
    updatePreferences(draft);
    setIsMatching(true);
    setTimeout(() => {
      const pkg = matchTrip(draft, subscription.currentTier);
      recordRegeneration();
      setCurrentTrip(pkg, draft);
      navigate(`/trip/${pkg.id}`);
    }, 1400);
  };

  if (isMatching) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-ocean-deep text-white">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-gold-accent" />
        <p className="font-display mt-8 text-2xl">Matching you a trip…</p>
        <p className="mt-2 text-white/60">Weighing your vibe, budget, and dates</p>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-ocean-deep px-6 text-center text-white">
        <p className="font-display text-2xl">You've used your free matches for this month</p>
        <p className="mt-3 max-w-sm text-white/60">
          Free plan includes 3 trip matches a month. They reset on{' '}
          {formatFullDate(subscription.regenerationsResetAt)}, or upgrade for unlimited matches plus
          hidden-gem destinations.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setLimitReached(false)}
            className="rounded-full border-2 border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10 cursor-pointer"
          >
            Back
          </button>
          <Link
            to="/profile"
            className="rounded-full bg-gold-accent px-6 py-3 font-semibold text-ink hover:opacity-90"
          >
            View plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <StepIndicator current={stepIndex + 1} total={steps.length} />
      {subscription.currentTier === 'free' && regenerationsRemaining !== null && (
        <p
          className="fixed right-4 z-20 text-xs font-medium text-ink/50 sm:right-8"
          style={{ top: 'max(1.5rem, calc(0.85rem + env(safe-area-inset-top)))' }}
        >
          {regenerationsRemaining} match{regenerationsRemaining === 1 ? '' : 'es'} left this month
        </p>
      )}

      {currentStep.id === 'vibe' && (
        <QuestionShell
          stepKey="vibe"
          eyebrow={currentStep.eyebrow}
          question="What's the vibe for this trip?"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={!draft.vibe}
        >
          {VIBE_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              description={opt.description}
              selected={draft.vibe === opt.value}
              onClick={() => {
                setDraft((d) => ({ ...d, vibe: opt.value }));
              }}
            />
          ))}
        </QuestionShell>
      )}

      {currentStep.id === 'dates' && (
        <QuestionShell
          stepKey="dates"
          eyebrow={currentStep.eyebrow}
          question="When are you going?"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={!draft.startDate || !draft.endDate || draft.endDate < draft.startDate}
        >
          <div className="flex flex-wrap justify-center gap-2">
            {DATE_RANGE_PRESETS.map((preset) => {
              const presetDates = datesFromPresetDays(preset.days);
              const isSelected =
                draft.startDate === presetDates.startDate && draft.endDate === presetDates.endDate;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDateRange(presetDates.startDate, presetDates.endDate)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                    isSelected ? 'bg-ocean-mid text-white' : 'bg-ink/5 text-ink hover:bg-ink/10'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-left">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50">
                Departure
              </span>
              <input
                type="date"
                min={todayIsoDate()}
                value={draft.startDate ?? ''}
                onChange={(e) => setDateRange(e.target.value || null, draft.endDate)}
                className="w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-base focus:border-ocean-mid focus:outline-none"
              />
            </label>
            <label className="block text-left">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50">
                Return
              </span>
              <input
                type="date"
                min={draft.startDate ?? todayIsoDate()}
                value={draft.endDate ?? ''}
                onChange={(e) => setDateRange(draft.startDate, e.target.value || null)}
                className="w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-base focus:border-ocean-mid focus:outline-none"
              />
            </label>
          </div>

          {draft.startDate && draft.endDate && draft.endDate >= draft.startDate && (
            <p className="mt-3 text-center text-sm text-ocean-mid">
              {formatDateRange(draft.startDate, draft.endDate)} · {draft.durationDays} days
            </p>
          )}
          {draft.startDate && draft.endDate && draft.endDate < draft.startDate && (
            <p className="mt-3 text-center text-sm text-red-500">
              Return date needs to be after your departure date.
            </p>
          )}
        </QuestionShell>
      )}

      {currentStep.id === 'budget' && (
        <QuestionShell
          stepKey="budget"
          eyebrow={currentStep.eyebrow}
          question="What's your total budget?"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={!draft.budget}
        >
          {BUDGET_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.label}
              label={opt.label}
              description={opt.description}
              selected={draft.budget?.min === opt.min && draft.budget?.max === opt.max}
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  budget: { min: opt.min, max: opt.max, currency: 'USD' },
                }))
              }
            />
          ))}
        </QuestionShell>
      )}

      {currentStep.id === 'groupSize' && (
        <QuestionShell
          stepKey="groupSize"
          eyebrow={currentStep.eyebrow}
          question="How many people are going?"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={!draft.groupSize}
        >
          <div className="flex flex-wrap justify-center gap-2">
            {GROUP_SIZE_PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setDraft((prev) => ({ ...prev, groupSize: n }));
                  setGroupSizeInput(n.toString());
                }}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                  draft.groupSize === n
                    ? 'bg-ocean-mid text-white'
                    : 'bg-ink/5 text-ink hover:bg-ink/10'
                }`}
              >
                {n === 1 ? 'Just me' : `${n} people`}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            max={20}
            placeholder="Or enter a custom group size"
            value={groupSizeInput}
            onChange={(e) => {
              setGroupSizeInput(e.target.value);
              const n = parseInt(e.target.value, 10);
              setDraft((prev) => ({ ...prev, groupSize: Number.isFinite(n) && n > 0 ? n : null }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.groupSize) goNext();
            }}
            className="mt-2 w-full rounded-2xl border-2 border-ink/10 px-6 py-4 text-center text-lg focus:border-ocean-mid focus:outline-none"
          />
        </QuestionShell>
      )}

      {currentStep.id === 'intensity' && (
        <QuestionShell
          stepKey="intensity"
          eyebrow={currentStep.eyebrow}
          question="How intense should the activities be?"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={!draft.activityIntensity}
        >
          {INTENSITY_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              description={opt.description}
              selected={draft.activityIntensity === opt.value}
              onClick={() => setDraft((prev) => ({ ...prev, activityIntensity: opt.value }))}
            />
          ))}
        </QuestionShell>
      )}

      {currentStep.id === 'groupType' && (
        <QuestionShell
          stepKey="groupType"
          eyebrow={currentStep.eyebrow}
          question="Who's coming with you?"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={!draft.groupType}
        >
          {GROUP_TYPE_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              selected={draft.groupType === opt.value}
              onClick={() => setDraft((prev) => ({ ...prev, groupType: opt.value }))}
            />
          ))}
        </QuestionShell>
      )}

      <ChatFab />
    </div>
  );
}
