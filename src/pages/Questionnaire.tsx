import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ChatFab from '../components/ChatFab';
import CityCard from '../components/CityCard';
import DateRangePicker from '../components/DateRangePicker';
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
  TRIP_TYPE_OPTIONS,
  VIBE_IDK_OPTION,
  VIBE_OPTIONS,
} from '../data/questionOptions';
import { COUNTRIES, INDONESIA_CITIES, MAX_CITIES, MAX_COUNTRIES, REGION_ORDER } from '../data/geography';
import { daysBetweenInclusive, formatDateRange, formatFullDate } from '../logic/dates';
import { matchTrip } from '../logic/matchTrip';
import type { SelectedCity, TripPreferences, Vibe } from '../types';

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

  const toggleCountry = (country: string) => {
    setDraft((prev) => {
      const current = prev.selectedCountries ?? [];
      const isSelected = current.includes(country);
      let nextCountries: string[];
      if (isSelected) {
        nextCountries = current.filter((c) => c !== country);
      } else {
        if (current.length >= MAX_COUNTRIES) return prev;
        nextCountries = [...current, country];
      }
      const nextCities = (prev.selectedCities ?? []).filter((c) => nextCountries.includes(c.country));
      return { ...prev, selectedCountries: nextCountries, selectedCities: nextCities };
    });
  };

  const toggleCity = (country: string, cityName: string) => {
    setDraft((prev) => {
      const current = prev.selectedCities ?? [];
      const exists = current.some((c) => c.country === country && c.city === cityName);
      let next: SelectedCity[];
      if (exists) {
        next = current.filter((c) => !(c.country === country && c.city === cityName));
      } else {
        if (current.length >= MAX_CITIES) return prev;
        next = [...current, { country, city: cityName }];
      }
      return { ...prev, selectedCities: next };
    });
  };

  const finish = () => {
    if (!canRegenerate) {
      setLimitReached(true);
      return;
    }
    updatePreferences(draft);
    setIsMatching(true);
    setTimeout(async () => {
      const pkg = await matchTrip(draft, subscription.currentTier);
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

      {currentStep.id === 'tripType' && (
        <QuestionShell
          stepKey="tripType"
          eyebrow={currentStep.eyebrow}
          question="Where are you headed?"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={!draft.tripType}
        >
          {TRIP_TYPE_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              description={opt.description}
              selected={draft.tripType === opt.value}
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  tripType: opt.value,
                  selectedCountries: [],
                  selectedCities: [],
                }))
              }
            />
          ))}
        </QuestionShell>
      )}

      {currentStep.id === 'countries' && (
        <QuestionShell
          stepKey="countries"
          eyebrow={currentStep.eyebrow}
          question="Which countries? (Pick up to 3)"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={(draft.selectedCountries?.length ?? 0) === 0}
        >
          <p className="mb-2 text-center text-xs text-ink/50">
            {draft.selectedCountries?.length ?? 0} / {MAX_COUNTRIES} selected
          </p>
          <div className="max-h-[50vh] space-y-5 overflow-y-auto pr-1">
            {REGION_ORDER.map((region) => {
              const regionCountries = COUNTRIES.filter((c) => c.region === region);
              if (regionCountries.length === 0) return null;
              return (
                <div key={region}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">{region}</p>
                  <div className="flex flex-wrap gap-2">
                    {regionCountries.map((c) => {
                      const selected = (draft.selectedCountries ?? []).includes(c.name);
                      const atMax = (draft.selectedCountries?.length ?? 0) >= MAX_COUNTRIES;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          disabled={!selected && atMax}
                          onClick={() => toggleCountry(c.name)}
                          className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                            selected
                              ? 'border-ocean-mid bg-ocean-mid/10 text-ocean-deep'
                              : 'border-ink/10 bg-white text-ink hover:border-ocean-light/60'
                          } ${!selected && atMax ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {(draft.selectedCountries?.length ?? 0) > 0 && (draft.selectedCountries?.length ?? 0) < MAX_COUNTRIES && (
            <p className="mt-3 text-center text-xs font-medium text-ocean-mid">
              + Add another country ({MAX_COUNTRIES - (draft.selectedCountries?.length ?? 0)} more allowed)
            </p>
          )}
        </QuestionShell>
      )}

      {currentStep.id === 'cities' && (
        <QuestionShell
          stepKey="cities"
          eyebrow={currentStep.eyebrow}
          question="Pick your cities (up to 4)"
          onBack={goBack}
          onNext={goNext}
          nextLabel={nextLabel}
          nextDisabled={(draft.selectedCities?.length ?? 0) === 0}
        >
          <p className="mb-2 text-center text-xs text-ink/50">
            {draft.selectedCities?.length ?? 0} / {MAX_CITIES} selected
          </p>
          <div className="max-h-[55vh] space-y-5 overflow-y-auto pr-1">
            {draft.tripType === 'local' ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {INDONESIA_CITIES.map((city) => {
                  const selected = (draft.selectedCities ?? []).some(
                    (c) => c.country === 'Indonesia' && c.city === city.name,
                  );
                  const atMax = (draft.selectedCities?.length ?? 0) >= MAX_CITIES;
                  return (
                    <CityCard
                      key={city.name}
                      name={city.name}
                      imageUrl={city.imageUrl}
                      selected={selected}
                      disabled={atMax}
                      onClick={() => toggleCity('Indonesia', city.name)}
                    />
                  );
                })}
              </div>
            ) : (
              (draft.selectedCountries ?? []).map((countryName) => {
                const country = COUNTRIES.find((c) => c.name === countryName);
                if (!country) return null;
                return (
                  <div key={countryName}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
                      {countryName}
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {country.cities.map((city) => {
                        const selected = (draft.selectedCities ?? []).some(
                          (c) => c.country === countryName && c.city === city.name,
                        );
                        const atMax = (draft.selectedCities?.length ?? 0) >= MAX_CITIES;
                        return (
                          <CityCard
                            key={city.name}
                            name={city.name}
                            imageUrl={city.imageUrl}
                            selected={selected}
                            disabled={atMax}
                            onClick={() => toggleCity(countryName, city.name)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </QuestionShell>
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
