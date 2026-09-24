import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ChatFab from '../components/ChatFab';
import DateRangePicker from '../components/DateRangePicker';
import OptionCard from '../components/OptionCard';
import QuestionShell from '../components/QuestionShell';
import StepIndicator from '../components/StepIndicator';
import { useCurrentTrip } from '../context/CurrentTripContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTripPreferences } from '../context/TripPreferencesContext';
import {
  BUDGET_OPTIONS,
  COUNTRY_OPTIONS,
  DATE_RANGE_PRESETS,
  datesFromPresetDays,
  getVisibleSteps,
  GROUP_SIZE_PRESETS,
  GROUP_TYPE_OPTIONS,
  INDONESIAN_CITY_OPTIONS,
  INTENSITY_OPTIONS,
  TRANSPORT_OPTIONS,
  VIBE_IDK_OPTION,
  VIBE_OPTIONS,
} from '../data/questionOptions';
import { daysBetweenInclusive, formatDateRange, formatFullDate } from '../logic/dates';
import { matchTrip } from '../logic/matchTrip';
import type { TransportMode, TripPreferences, Vibe } from '../types';

const TRANSPORT_ICONS: Record<TransportMode, React.ReactNode> = {
  car: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm14 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3 17V11l2-5h10l4 5v6M3 11h16" />
    </svg>
  ),
  ship: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M3 17c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0M5 14l1-7h4l1 4M12 7V3h3l2 3M4 14h16" />
    </svg>
  ),
  flight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M10.5 21 9 17l-6-2 1.5-1.5L9 14l3-3-8-4 2-2 10 3 3.5-3.5a1.7 1.7 0 0 1 2.5 2.5L18.5 10l3 10-2 2-4-8-3 3 .5 3.5Z" />
    </svg>
  ),
  any: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M17 3 21 7l-4 4M21 7H3M7 21l-4-4 4-4M3 17h18" />
    </svg>
  ),
};

export default function Questionnaire() {
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences, updatePreferences } = useTripPreferences();
  const { setCurrentTrip } = useCurrentTrip();
  const { subscription, canRegenerate, regenerationsRemaining, recordRegeneration } = useSubscription();
  const [draft, setDraft] = useState<TripPreferences>(preferences);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMatching, setIsMatching] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [groupSizeInput, setGroupSizeInput] = useState(draft.groupSize?.toString() ?? '');
  const [useCustomBudget, setUseCustomBudget] = useState(false);
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');

  useEffect(() => {
    const presetVibe = (location.state as { presetVibe?: Vibe } | null)?.presetVibe;
    if (presetVibe && draft.vibe === null) {
      setDraft((prev) => ({ ...prev, vibe: [presetVibe] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          nextDisabled={draft.vibe === null}
        >
          {VIBE_OPTIONS.map((opt) => {
            const selected = !!draft.vibe?.includes(opt.value);
            return (
              <OptionCard
                key={opt.value}
                label={opt.label}
                description={opt.description}
                selected={selected}
                onClick={() => {
                  setDraft((d) => {
                    const current = d.vibe ?? [];
                    const next = selected
                      ? current.filter((v) => v !== opt.value)
                      : [...current, opt.value];
                    return { ...d, vibe: next };
                  });
                }}
              />
            );
          })}
          <OptionCard
            label={VIBE_IDK_OPTION.label}
            description={VIBE_IDK_OPTION.description}
            selected={draft.vibe !== null && draft.vibe.length === 0}
            onClick={() => setDraft((d) => ({ ...d, vibe: [] }))}
          />
          {draft.vibe !== null && draft.vibe.length === 0 && (
            <p className="pt-1 text-center text-sm text-ocean-mid">
              {VIBE_IDK_OPTION.description}
            </p>
          )}
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

          <div className="mt-4">
            <DateRangePicker
              startDate={draft.startDate}
              endDate={draft.endDate}
              onChange={setDateRange}
            />
          </div>

          {draft.startDate && draft.endDate && draft.endDate >= draft.startDate && (
            <p className="mt-3 text-center text-sm text-ocean-mid">
              {formatDateRange(draft.startDate, draft.endDate)} · {draft.durationDays} days
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
          {BUDGET_OPTIONS.map((opt) => {
            const selected =
              !useCustomBudget && draft.budget?.min === opt.min && draft.budget?.max === opt.max;
            return (
              <OptionCard
                key={opt.label}
                label={opt.label}
                description={opt.description}
                selected={!!selected}
                onClick={() => {
                  setUseCustomBudget(false);
                  setDraft((prev) => ({
                    ...prev,
                    budget: { min: opt.min, max: opt.max, currency: 'USD' },
                  }));
                }}
              />
            );
          })}

          <OptionCard
            label="Set custom budget"
            description="Type in an exact range (USD)"
            selected={useCustomBudget}
            onClick={() => setUseCustomBudget(true)}
          />

          {useCustomBudget && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="block text-left">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50">
                  Min (USD)
                </span>
                <input
                  type="number"
                  min={0}
                  placeholder="500"
                  value={customMin}
                  onChange={(e) => {
                    setCustomMin(e.target.value);
                    const min = parseInt(e.target.value, 10);
                    const max = parseInt(customMax, 10);
                    if (Number.isFinite(min)) {
                      setDraft((prev) => ({
                        ...prev,
                        budget: {
                          min,
                          max: Number.isFinite(max) ? max : prev.budget?.max ?? min,
                          currency: 'USD',
                        },
                      }));
                    }
                  }}
                  className="w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-base focus:border-ocean-mid focus:outline-none"
                />
              </label>
              <label className="block text-left">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50">
                  Max (USD)
                </span>
                <input
                  type="number"
                  min={0}
                  placeholder="3000"
                  value={customMax}
                  onChange={(e) => {
                    setCustomMax(e.target.value);
                    const max = parseInt(e.target.value, 10);
                    const min = parseInt(customMin, 10);
                    if (Number.isFinite(max)) {
                      setDraft((prev) => ({
                        ...prev,
                        budget: {
                          min: Number.isFinite(min) ? min : prev.budget?.min ?? 0,
                          max,
                          currency: 'USD',
                        },
                      }));
                    }
                  }}
                  className="w-full rounded-2xl border-2 border-ink/10 px-4 py-3 text-base focus:border-ocean-mid focus:outline-none"
                />
              </label>
            </div>
          )}
        </QuestionShell>
      )}

      {currentStep.id === 'destination' && (
        <QuestionShell
          stepKey="destination"
          eyebrow={currentStep.eyebrow}
          question="Any destinations in mind?"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={
            !draft.destinationPreference ||
            (draft.destinationPreference.type === 'international' && !draft.destinationPreference.country) ||
            (draft.destinationPreference.type === 'local' && !draft.destinationPreference.city)
          }
        >
          <div className="flex flex-wrap justify-center gap-2">
            {(
              [
                { type: 'international', label: 'International' },
                { type: 'local', label: 'Local (Indonesia)' },
                { type: 'surprise', label: 'Surprise me' },
              ] as const
            ).map((opt) => {
              const selected = draft.destinationPreference?.type === opt.type;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                    if (opt.type === 'surprise') {
                      setDraft((prev) => ({ ...prev, destinationPreference: { type: 'surprise' } }));
                    } else if (opt.type === 'international') {
                      setDraft((prev) => ({
                        ...prev,
                        destinationPreference: { type: 'international', country: '' },
                      }));
                    } else {
                      setDraft((prev) => ({ ...prev, destinationPreference: { type: 'local', city: '' } }));
                    }
                  }}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                    selected ? 'bg-ocean-mid text-white' : 'bg-ink/5 text-ink hover:bg-ink/10'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {draft.destinationPreference?.type === 'international' && (
            <label className="block pt-3 text-left">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50">
                Country
              </span>
              <select
                value={draft.destinationPreference.country}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    destinationPreference: { type: 'international', country: e.target.value },
                  }))
                }
                className="w-full rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-base focus:border-ocean-mid focus:outline-none"
              >
                <option value="" disabled>
                  Choose a country…
                </option>
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
          )}

          {draft.destinationPreference?.type === 'local' && (
            <label className="block pt-3 text-left">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50">
                City
              </span>
              <select
                value={draft.destinationPreference.city}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    destinationPreference: { type: 'local', city: e.target.value },
                  }))
                }
                className="w-full rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-base focus:border-ocean-mid focus:outline-none"
              >
                <option value="" disabled>
                  Choose a city…
                </option>
                {INDONESIAN_CITY_OPTIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
          )}
        </QuestionShell>
      )}

      {currentStep.id === 'transport' && (
        <QuestionShell
          stepKey="transport"
          eyebrow={currentStep.eyebrow}
          question="How do you plan on getting there?"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={!draft.transportModes || draft.transportModes.length === 0}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRANSPORT_OPTIONS.map((opt) => {
              const selected = !!draft.transportModes?.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => {
                      const current = prev.transportModes ?? [];
                      const next = selected
                        ? current.filter((m) => m !== opt.value)
                        : [...current, opt.value];
                      return { ...prev, transportModes: next };
                    })
                  }
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 transition-all duration-150 cursor-pointer ${
                    selected
                      ? 'border-gold-accent text-gold-accent bg-gold-accent/10'
                      : 'border-ink/10 text-ink hover:border-ocean-light/60 hover:bg-ocean-light/5'
                  }`}
                >
                  {TRANSPORT_ICONS[opt.value]}
                  <span className="text-sm font-semibold">{opt.label}</span>
                </button>
              );
            })}
          </div>
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
