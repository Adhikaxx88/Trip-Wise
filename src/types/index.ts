export type Vibe = 'relaxing' | 'adventurous' | 'cultural' | 'romantic';

export type GroupType = 'solo' | 'couple' | 'family' | 'friends';

export type ActivityIntensity = 'low' | 'medium' | 'high';

export interface TripPreferences {
  vibe: Vibe | null;
  durationDays: number | null;
  budget: { min: number; max: number; currency: string } | null;
  groupSize: number | null;
  activityIntensity?: ActivityIntensity;
  groupType?: GroupType;
}

export const createEmptyPreferences = (): TripPreferences => ({
  vibe: null,
  durationDays: null,
  budget: null,
  groupSize: null,
});

export interface ItineraryActivity {
  time?: string;
  name: string;
  note?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

export interface TripPackage {
  id: string;
  destination: string;
  summary: string;
  coverImageUrl: string;
  estimatedCost: number;
  vibe: Vibe;
  tags: string[];
  itinerary: ItineraryDay[];
  bookingUrl: string;
}

export interface SavedTrip {
  savedId: string;
  package: TripPackage;
  preferences: TripPreferences;
  savedAt: string;
}
