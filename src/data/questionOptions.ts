import type { ActivityIntensity, GroupType, TripPreferences, Vibe } from '../types';

export const VIBE_OPTIONS: { value: Vibe; label: string; description: string }[] = [
  { value: 'relaxing', label: 'Relaxing', description: 'Slow mornings, beaches, spas' },
  { value: 'adventurous', label: 'Adventurous', description: 'Hikes, adrenaline, wild places' },
  { value: 'cultural', label: 'Cultural', description: 'History, food, local traditions' },
  { value: 'romantic', label: 'Romantic', description: 'Sunsets, wine, quiet moments together' },
];

export const DURATION_PRESETS = [3, 5, 7, 10, 14];

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
  id: 'vibe' | 'duration' | 'budget' | 'groupSize' | 'intensity' | 'groupType';
  eyebrow: string;
}

export function getVisibleSteps(prefs: TripPreferences): StepDef[] {
  const steps: StepDef[] = [
    { id: 'vibe', eyebrow: 'Step 1' },
    { id: 'duration', eyebrow: 'Step 2' },
    { id: 'budget', eyebrow: 'Step 3' },
    { id: 'groupSize', eyebrow: 'Step 4' },
  ];
  if (prefs.vibe === 'adventurous') {
    steps.push({ id: 'intensity', eyebrow: 'Almost there' });
  }
  if (prefs.groupSize && prefs.groupSize > 1) {
    steps.push({ id: 'groupType', eyebrow: 'Almost there' });
  }
  return steps;
}
