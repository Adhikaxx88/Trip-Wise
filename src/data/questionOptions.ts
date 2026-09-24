import { addDaysIso, daysBetweenInclusive, todayIsoDate } from '../logic/dates';
import type { ActivityIntensity, GroupType, TripPreferences, TripType, Vibe } from '../types';

export const TRIP_TYPE_OPTIONS: { value: TripType; label: string; description: string }[] = [
  { value: 'local', label: 'Local (Indonesia)', description: 'Explore the best of Indonesia' },
  { value: 'international', label: 'International', description: 'Pick countries and cities abroad' },
];

export const VIBE_OPTIONS: { value: Vibe; label: string; description: string }[] = [
  { value: 'relaxing', label: 'Relaxing', description: 'Slow mornings, beaches, spas' },
  { value: 'adventurous', label: 'Adventurous', description: 'Hikes, adrenaline, wild places' },
  { value: 'cultural', label: 'Cultural', description: 'History, food, local traditions' },
  { value: 'romantic', label: 'Romantic', description: 'Sunsets, wine, quiet moments together' },
];

export const VIBE_IDK_OPTION = {
  label: "I don't know",
  description: "We'll surprise you with our top picks",
};

/**
 * Landing-page "Pick a starting point" presets, passed as `/questionnaire?preset=<id>`.
 * Mapped onto the vibe / trip-type ids the quiz actually knows:
 * - beaches: beach + relaxation -> 'relaxing' ("Slow mornings, beaches, spas"), local (Indonesia)
 * - adventure: adventure + nature -> 'adventurous' ("Hikes, adrenaline, wild places"), international
 * - hidden-gems: offbeat / local discoveries -> 'cultural' ("History, food, local traditions"), trip type left open
 */
export type QuizPresetId = 'beaches' | 'adventure' | 'hidden-gems';

export const QUIZ_PRESETS: Record<QuizPresetId, { vibe: Vibe[]; tripType?: TripType }> = {
  beaches: { vibe: ['relaxing'], tripType: 'local' },
  adventure: { vibe: ['adventurous'], tripType: 'international' },
  'hidden-gems': { vibe: ['cultural'] },
};

function isQuizPresetId(id: string): id is QuizPresetId {
  return Object.prototype.hasOwnProperty.call(QUIZ_PRESETS, id);
}

/** Pre-fill quiz answers from a preset id; unknown / missing ids return prefs unchanged. */
export function applyQuizPreset(prefs: TripPreferences, presetId: string | null): TripPreferences {
  if (!presetId || !isQuizPresetId(presetId)) return prefs;
  const preset = QUIZ_PRESETS[presetId];
  const next: TripPreferences = { ...prefs, vibe: [...preset.vibe] };
  if (preset.tripType && preset.tripType !== prefs.tripType) {
    next.tripType = preset.tripType;
    next.selectedCountries = [];
    next.selectedCities = [];
  }
  return next;
}

export const DATE_RANGE_PRESETS: { label: string; days: number }[] = [
  { label: 'Long weekend', days: 3 },
  { label: '1 week', days: 7 },
  { label: '10 days', days: 10 },
  { label: '2 weeks', days: 14 },
];

export function datesFromPresetDays(days: number): { startDate: string; endDate: string } {
  const startDate = addDaysIso(todayIsoDate(), 7);
  const endDate = addDaysIso(startDate, days - 1);
  return { startDate, endDate };
}

export const BUDGET_OPTIONS: { label: string; description: string; min: number; max: number }[] = [
  { label: 'Budget-friendly', description: '$500 – $1,500 total', min: 500, max: 1500 },
  { label: 'Mid-range', description: '$1,500 – $3,500 total', min: 1500, max: 3500 },
  { label: 'Premium', description: '$3,500 – $7,000 total', min: 3500, max: 7000 },
  { label: 'Luxury', description: '$7,000+ total', min: 7000, max: 15000 },
];

export const GROUP_SIZE_PRESETS = [1, 2, 4, 6];

export const INTENSITY_OPTIONS: { value: ActivityIntensity; label: string; description: string }[] = [
  { value: 'low', label: 'Easygoing', description: 'Light walks, mostly scenic' },
  { value: 'medium', label: 'Balanced', description: 'A mix of active and relaxed days' },
  { value: 'high', label: 'Full throttle', description: 'Push my limits every day' },
];

export const GROUP_TYPE_OPTIONS: { value: GroupType; label: string }[] = [
  { value: 'couple', label: 'A couple' },
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' },
];

export interface StepDef {
  id: 'tripType' | 'countries' | 'cities' | 'vibe' | 'dates' | 'budget' | 'groupSize' | 'intensity' | 'groupType';
  eyebrow: string;
}

export function getVisibleSteps(prefs: TripPreferences, includeGeography = true): StepDef[] {
  const steps: StepDef[] = includeGeography ? [{ id: 'tripType', eyebrow: 'Step 1' }] : [];

  if (includeGeography && prefs.tripType === 'international') {
    steps.push({ id: 'countries', eyebrow: 'Step 2' });
  }
  if (includeGeography && prefs.tripType) {
    steps.push({ id: 'cities', eyebrow: `Step ${steps.length + 1}` });
  }

  steps.push(
    { id: 'vibe', eyebrow: `Step ${steps.length + 1}` },
    { id: 'dates', eyebrow: `Step ${steps.length + 2}` },
    { id: 'budget', eyebrow: `Step ${steps.length + 3}` },
    { id: 'groupSize', eyebrow: `Step ${steps.length + 4}` },
  );
  if (prefs.vibe?.includes('adventurous')) {
    steps.push({ id: 'intensity', eyebrow: 'Almost there' });
  }
  if (prefs.groupSize && prefs.groupSize > 1) {
    steps.push({ id: 'groupType', eyebrow: 'Almost there' });
  }
  return steps;
}

const BUDGET_KEYWORDS: Record<string, string[]> = {
  'Budget-friendly': ['budget', 'cheap', 'affordable', 'low cost'],
  'Mid-range': ['mid', 'moderate', 'medium'],
  Premium: ['premium', 'upscale'],
  Luxury: ['luxury', 'lux', 'expensive', 'high end'],
};

const INTENSITY_KEYWORDS: Record<ActivityIntensity, string[]> = {
  low: ['easy', 'light', 'relaxed', 'chill', 'easygoing'],
  medium: ['medium', 'moderate', 'balanced', 'mix'],
  high: ['high', 'intense', 'extreme', 'full throttle', 'adrenaline'],
};

export type FreeTextMatch = { patch: Partial<TripPreferences> } | null;

export function matchFreeTextToStep(text: string, stepId: StepDef['id']): FreeTextMatch {
  const lower = text.trim().toLowerCase();
  if (!lower) return null;

  switch (stepId) {
    case 'vibe': {
      if (/\b(idk|i don't know|dont know|not sure|surprise me|no idea)\b/.test(lower)) {
        return { patch: { vibe: [] } };
      }
      const matches = VIBE_OPTIONS.filter(
        (o) => lower.includes(o.value) || lower.includes(o.label.toLowerCase()),
      ).map((o) => o.value);
      return matches.length > 0 ? { patch: { vibe: matches } } : null;
    }
    case 'dates': {
      const n = parseInt(lower.replace(/[^0-9]/g, ''), 10);
      if (!Number.isFinite(n) || n <= 0) return null;
      const { startDate, endDate } = datesFromPresetDays(n);
      return { patch: { startDate, endDate, durationDays: daysBetweenInclusive(startDate, endDate) } };
    }
    case 'budget': {
      const match = BUDGET_OPTIONS.find(
        (o) =>
          lower.includes(o.label.toLowerCase()) ||
          (BUDGET_KEYWORDS[o.label] ?? []).some((k) => lower.includes(k)),
      );
      return match ? { patch: { budget: { min: match.min, max: match.max, currency: 'USD' } } } : null;
    }
    case 'groupSize': {
      if (/\b(just me|solo|myself|alone)\b/.test(lower)) return { patch: { groupSize: 1 } };
      const n = parseInt(lower.replace(/[^0-9]/g, ''), 10);
      return Number.isFinite(n) && n > 0 ? { patch: { groupSize: n } } : null;
    }
    case 'intensity': {
      const match = INTENSITY_OPTIONS.find(
        (o) =>
          lower.includes(o.value) ||
          lower.includes(o.label.toLowerCase()) ||
          INTENSITY_KEYWORDS[o.value].some((k) => lower.includes(k)),
      );
      return match ? { patch: { activityIntensity: match.value } } : null;
    }
    case 'groupType': {
      const match = GROUP_TYPE_OPTIONS.find(
        (o) => lower.includes(o.value) || lower.includes(o.label.toLowerCase()),
      );
      return match ? { patch: { groupType: match.value } } : null;
    }
    default:
      return null;
  }
}
