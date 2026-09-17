export type Vibe = 'relaxing' | 'adventurous' | 'cultural' | 'romantic';

export type GroupType = 'solo' | 'couple' | 'family' | 'friends';

export type ActivityIntensity = 'low' | 'medium' | 'high';

export interface TripPreferences {
  vibe: Vibe | null;
  durationDays: number | null;
  startDate: string | null;
  endDate: string | null;
  budget: { min: number; max: number; currency: string } | null;
  groupSize: number | null;
  activityIntensity?: ActivityIntensity;
  groupType?: GroupType;
}

export const createEmptyPreferences = (): TripPreferences => ({
  vibe: null,
  durationDays: null,
  startDate: null,
  endDate: null,
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

export interface BookableItem {
  name: string;
  cost: number;
  bookingUrl: string;
  details?: { label: string; value: string }[];
}

export interface CostBreakdown {
  hotel: BookableItem;
  flight: BookableItem;
  food: BookableItem;
  attractions: BookableItem;
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
  costBreakdown: CostBreakdown;
}

export interface SavedTrip {
  savedId: string;
  package: TripPackage;
  preferences: TripPreferences;
  savedAt: string;
}
