import { destinations, type DestinationTemplate } from '../data/destinations';
import type { CostBreakdown, ItineraryActivity, ItineraryDay, TripPackage, TripPreferences } from '../types';

function scoreDestination(dest: DestinationTemplate, prefs: TripPreferences): number {
  let score = 0;

  if (prefs.vibe && dest.vibe === prefs.vibe) score += 10;

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

function buildItinerary(dest: DestinationTemplate, durationDays: number): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  const totalDays = Math.max(1, durationDays);

  if (totalDays === 1) {
    days.push({ day: 1, title: dest.arrivalDay.title, activities: dest.arrivalDay.activities });
    return days;
  }

  days.push({ day: 1, title: dest.arrivalDay.title, activities: dest.arrivalDay.activities });

  const middleDaysCount = totalDays - 2;
  for (let i = 0; i < middleDaysCount; i++) {
    const template = dest.coreDays[i % dest.coreDays.length];
    days.push({ day: i + 2, title: template.title, activities: template.activities });
  }

  days.push({
    day: totalDays,
    title: dest.departureDay.title,
    activities: dest.departureDay.activities,
  });

  return days;
}

function buildCostBreakdown(
  dest: DestinationTemplate,
  durationDays: number,
  groupSize: number,
): CostBreakdown {
  const nights = Math.max(1, durationDays - 1);
  const rooms = Math.max(1, Math.ceil(groupSize / 2));
  const destinationQuery = encodeURIComponent(dest.destination);

  return {
    hotel: {
      name: dest.hotelName,
      cost: Math.round(dest.hotelCostPerNight * nights * rooms),
      bookingUrl: dest.bookingUrl,
    },
    flight: {
      name: `Round-trip flights to ${dest.destination}`,
      cost: Math.round(dest.flightEstimatePerPerson * groupSize),
      bookingUrl: `https://www.google.com/travel/flights?q=Flights%20to%20${destinationQuery}`,
    },
    food: {
      name: 'Meals & dining',
      cost: Math.round(dest.foodPerPersonPerDay * durationDays * groupSize),
      bookingUrl: `https://www.tripadvisor.com/Search?q=${destinationQuery}%20restaurants`,
    },
  };
}

export function getSuggestedActivities(packageId: string, existingNames: string[]): ItineraryActivity[] {
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
    suggestions.push(activity);
    if (suggestions.length >= 4) break;
  }

  return suggestions;
}

export function matchTrip(prefs: TripPreferences): TripPackage {
  const scored = destinations
    .map((dest) => ({ dest, score: scoreDestination(dest, prefs) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.dest ?? destinations[0];
  const duration = prefs.durationDays ?? 5;
  const groupSize = prefs.groupSize ?? 1;

  const itinerary = buildItinerary(best, duration);
  const costBreakdown = buildCostBreakdown(best, duration, groupSize);
  const estimatedCost = costBreakdown.hotel.cost + costBreakdown.flight.cost + costBreakdown.food.cost;

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
  };
}

export function getDestinationTemplate(packageId: string): DestinationTemplate | undefined {
  return destinations.find((d) => d.id === packageId);
}
