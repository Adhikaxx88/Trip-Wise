import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OptionCard from '../components/OptionCard';
import QuestionShell from '../components/QuestionShell';
import StepIndicator from '../components/StepIndicator';
import { useCurrentTrip } from '../context/CurrentTripContext';
import { useTripPreferences } from '../context/TripPreferencesContext';
import {
  BUDGET_OPTIONS,
  DURATION_PRESETS,
  getVisibleSteps,
  GROUP_SIZE_PRESETS,
  GROUP_TYPE_OPTIONS,
  INTENSITY_OPTIONS,
  VIBE_OPTIONS,
} from '../data/questionOptions';
import { matchTrip } from '../logic/matchTrip';
import type { TripPreferences } from '../types';

export default function Questionnaire() {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = useTripPreferences();
  const { setCurrentTrip } = useCurrentTrip();
  const [draft, setDraft] = useState<TripPreferences>(preferences);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMatching, setIsMatching] = useState(false);
  const [durationInput, setDurationInput] = useState(draft.durationDays?.toString() ?? '');
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

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const finish = () => {
    updatePreferences(draft);
    setIsMatching(true);
    setTimeout(() => {
      const pkg = matchTrip(draft);
      setCurrentTrip(pkg, draft);
      navigate(`/trip/${pkg.id}`);
    }, 1400);
  };

  if (isMatching) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-ocean-deep text-white">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-gold-accent" />
        <p className="font-display mt-8 text-2xl">Matching you a trip…</p>
        <p className="mt-2 text-white/60">Weighing your vibe, budget, and dates</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <StepIndicator current={stepIndex + 1} total={steps.length} />

      {currentStep.id === 'vibe' && (
        <QuestionShell
          stepKey="vibe"
          eyebrow={currentStep.eyebrow}
          question="What's the vibe for this trip?"
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

      {currentStep.id === 'duration' && (
        <QuestionShell
          stepKey="duration"
          eyebrow={currentStep.eyebrow}
          question="How many days do you have?"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={!draft.durationDays}
        >
          <div className="flex flex-wrap justify-center gap-2">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDraft((prev) => ({ ...prev, durationDays: d }));
                  setDurationInput(d.toString());
                }}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                  draft.durationDays === d
                    ? 'bg-ocean-mid text-white'
                    : 'bg-ink/5 text-ink hover:bg-ink/10'
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            max={60}
            placeholder="Or enter a custom number of days"
            value={durationInput}
            onChange={(e) => {
              setDurationInput(e.target.value);
              const n = parseInt(e.target.value, 10);
              setDraft((prev) => ({ ...prev, durationDays: Number.isFinite(n) && n > 0 ? n : null }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.durationDays) goNext();
            }}
            className="mt-2 w-full rounded-2xl border-2 border-ink/10 px-6 py-4 text-center text-lg focus:border-ocean-mid focus:outline-none"
          />
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
    </div>
  );
}
