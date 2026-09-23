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
  price?: number;
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
  tier: SubscriptionTierId;
  hotelDiscountPercent: number;
}

export interface SavedTrip {
  savedId: string;
  package: TripPackage;
  preferences: TripPreferences;
  savedAt: string;
}

export type SubscriptionTierId = 'free' | 'monthly' | 'yearly';

export type SubscriptionBenefitType = 'discount' | 'feature-unlock' | 'priority' | 'quota';

export interface SubscriptionBenefit {
  id: string;
  label: string;
  type: SubscriptionBenefitType;
  value?: string;
}

export interface SubscriptionTier {
  id: SubscriptionTierId;
  name: string;
  price: { amount: number; currency: string; billingPeriod: 'month' | 'year' | null };
  benefits: SubscriptionBenefit[];
  savingsNote?: string;
}

export interface SubscriptionState {
  currentTier: SubscriptionTierId;
  subscribedSince: string | null;
  renewsOn: string | null;
  cancelAtPeriodEnd: boolean;
  regenerationsUsed: number;
  regenerationsResetAt: string;
  displayName: string;
}
