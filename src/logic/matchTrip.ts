import { destinations, type DayTemplate, type DestinationTemplate } from '../data/destinations';
import { HOTEL_DISCOUNT_BY_TIER } from '../data/subscriptionTiers';
import type {
  CostBreakdown,
  ItineraryActivity,
  ItineraryDay,
  SubscriptionTierId,
  TripPackage,
  TripPreferences,
} from '../types';

const TIER_RANK: Record<SubscriptionTierId, number> = { free: 0, monthly: 1, yearly: 2 };

function isUnlockedForTier(destTier: SubscriptionTierId, currentTier: SubscriptionTierId): boolean {
  return TIER_RANK[currentTier] >= TIER_RANK[destTier];
}

function scoreDestination(dest: DestinationTemplate, prefs: TripPreferences): number {
  let score = 0;

  if (prefs.vibe && prefs.vibe.length > 0 && prefs.vibe.includes(dest.vibe)) score += 10;

  if (prefs.budget && prefs.durationDays) {
    const estimated = dest.costPerPersonPerDay * prefs.durationDays * (prefs.groupSize ?? 1);
    const { min, max } = prefs.budget;
    if (estimated >= min && estimated <= max) {
      score += 6;
    } else {
      const distance = estimated < min ? min - estimated : estimated - max;
      score -= Math.min(5, distance / Math.max(max, 1) * 5);
    }
  }

  if (prefs.groupType) {
    if (dest.goodFor.includes(prefs.groupType)) score += 3;
    if (prefs.groupType === 'couple' && dest.tags.includes('honeymoon')) score += 1;
    if (prefs.groupType === 'family' && dest.tags.includes('nature')) score += 1;
  }

  if (prefs.activityIntensity) {
    if (prefs.activityIntensity === 'high' && dest.vibe === 'adventurous') score += 2;
    if (prefs.activityIntensity === 'low' && dest.vibe === 'relaxing') score += 2;
  }

  return score;
}

const STOPWORDS = new Set([
  'the', 'of', 'a', 'an', 'and', 'entrance', 'access', 'ticket', 'tickets', 'tour', 'tours', 'cruise', 'excursion',
]);

function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

const TRANSPORT_PATTERN = /\btransfer\b|\bseaplane\b|\bboat to\b|\bland in\b|\bfly\b|\bdrive to\b|\btransport\b/i;
const TRANSPORT_PRICE = 20;

function priceActivity(
  dest: DestinationTemplate,
  activity: ItineraryActivity,
  dayNumber: number,
): ItineraryActivity {
  if (typeof activity.price === 'number') return activity;

  const lowerName = activity.name.toLowerCase();
  const mealIndex = Math.max(0, dayNumber - 1);

  if (/breakfast|brunch/.test(lowerName)) {
    const pool = dest.restaurants.breakfast;
    const option = pool[mealIndex % pool.length];
    return { ...activity, price: option.price, note: activity.note ?? option.name };
  }
  if (/lunch/.test(lowerName)) {
    const pool = dest.restaurants.lunch;
    const option = pool[mealIndex % pool.length];
    return { ...activity, price: option.price, note: activity.note ?? option.name };
  }
  if (/dinner/.test(lowerName)) {
    const pool = dest.restaurants.dinner;
    const option = pool[mealIndex % pool.length];
    return { ...activity, price: option.price, note: activity.note ?? option.name };
  }

  const activityWords = new Set(significantWords(activity.name));
  const matchedTicket = dest.attractionTickets.find((ticket) =>
    significantWords(ticket.name).some((word) => activityWords.has(word)),
  );
  if (matchedTicket) {
    return { ...activity, price: matchedTicket.price, note: activity.note ?? matchedTicket.name };
  }

  if (TRANSPORT_PATTERN.test(lowerName)) {
    return { ...activity, price: TRANSPORT_PRICE };
  }

  return activity;
}

function priceDay(dest: DestinationTemplate, day: DayTemplate, dayNumber: number): ItineraryActivity[] {
  return day.activities.map((activity) => priceActivity(dest, activity, dayNumber));
}

function buildItinerary(dest: DestinationTemplate, durationDays: number): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  const totalDays = Math.max(1, durationDays);

  if (totalDays === 1) {
    days.push({ day: 1, title: dest.arrivalDay.title, activities: priceDay(dest, dest.arrivalDay, 1) });
    return days;
  }

  days.push({ day: 1, title: dest.arrivalDay.title, activities: priceDay(dest, dest.arrivalDay, 1) });

  const middleDaysCount = totalDays - 2;
  for (let i = 0; i < middleDaysCount; i++) {
    const template = dest.coreDays[i % dest.coreDays.length];
    const dayNumber = i + 2;
    days.push({ day: dayNumber, title: template.title, activities: priceDay(dest, template, dayNumber) });
  }

  days.push({
    day: totalDays,
    title: dest.departureDay.title,
    activities: priceDay(dest, dest.departureDay, totalDays),
  });

  return days;
}

function buildCostBreakdown(
  dest: DestinationTemplate,
  durationDays: number,
  groupSize: number,
  currentTier: SubscriptionTierId,
): CostBreakdown {
  const nights = Math.max(1, durationDays - 1);
  const rooms = Math.max(1, Math.ceil(groupSize / 2));
  const destinationQuery = encodeURIComponent(dest.destination);
  const hotelDiscount = HOTEL_DISCOUNT_BY_TIER[currentTier] / 100;

  return {
    hotel: {
      name: dest.hotelName,
      cost: Math.round(dest.hotelCostPerNight * nights * rooms * (1 - hotelDiscount)),
      bookingUrl: dest.bookingUrl,
    },
    flight: {
      name: `${dest.airline} round-trip to ${dest.destination}`,
      cost: Math.round(dest.flightEstimatePerPerson * groupSize),
      bookingUrl: `https://www.google.com/travel/flights?q=Flights%20to%20${destinationQuery}`,
    },
  };
}

export function activitiesCostPerPerson(itinerary: ItineraryDay[]): number {
  return itinerary.reduce(
    (sum, day) => sum + day.activities.reduce((daySum, a) => daySum + (a.price ?? 0), 0),
    0,
  );
}

export function dayCostPerPerson(day: ItineraryDay): number {
  return day.activities.reduce((sum, a) => sum + (a.price ?? 0), 0);
}

export function getSuggestedActivities(
  packageId: string,
  existingNames: string[],
  dayNumber: number,
): ItineraryActivity[] {
  const dest = getDestinationTemplate(packageId);
  if (!dest) return [];

  const existing = new Set(existingNames.map((n) => n.toLowerCase()));
  const pool = [dest.arrivalDay, ...dest.coreDays, dest.departureDay].flatMap((d) => d.activities);
  const seen = new Set<string>();
  const suggestions: ItineraryActivity[] = [];

  for (const activity of pool) {
    const key = activity.name.toLowerCase();
    if (existing.has(key) || seen.has(key)) continue;
    seen.add(key);
    suggestions.push(priceActivity(dest, activity, dayNumber));
    if (suggestions.length >= 4) break;
  }

  return suggestions;
}

export function matchTrip(prefs: TripPreferences, currentTier: SubscriptionTierId = 'free'): TripPackage {
  const eligible = destinations.filter((dest) => isUnlockedForTier(dest.tier, currentTier));
  const pool = eligible.length > 0 ? eligible : destinations;

  const scored = pool
    .map((dest) => ({ dest, score: scoreDestination(dest, prefs) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.dest ?? pool[0];
  const duration = prefs.durationDays ?? 5;
  const groupSize = prefs.groupSize ?? 1;

  const itinerary = buildItinerary(best, duration);
  const costBreakdown = buildCostBreakdown(best, duration, groupSize, currentTier);
  const estimatedCost =
    costBreakdown.hotel.cost +
    costBreakdown.flight.cost +
    Math.round(activitiesCostPerPerson(itinerary) * groupSize);

  const destinationLabel =
    best.destination.toLowerCase() === best.country.toLowerCase()
      ? best.destination
      : `${best.destination}, ${best.country}`;

  return {
    id: best.id,
    destination: destinationLabel,
    summary: best.summary,
    coverImageUrl: best.coverImageUrl,
    estimatedCost,
    vibe: best.vibe,
    tags: best.tags,
    itinerary,
    bookingUrl: best.bookingUrl,
    costBreakdown,
    tier: best.tier,
    hotelDiscountPercent: HOTEL_DISCOUNT_BY_TIER[currentTier],
  };
}

export function getDestinationTemplate(packageId: string): DestinationTemplate | undefined {
  return destinations.find((d) => d.id === packageId);
}
