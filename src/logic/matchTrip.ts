import { destinations, type DestinationTemplate } from '../data/destinations';
import type { ItineraryDay, TripPackage, TripPreferences } from '../types';

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

let regenSeed = 0;

export function regenerateDay(dest: DestinationTemplate | undefined, dayNumber: number, totalDays: number): ItineraryDay {
  if (!dest) {
    return { day: dayNumber, title: `Day ${dayNumber}`, activities: [] };
  }
  regenSeed += 1;
  if (dayNumber === 1) {
    return { day: 1, title: dest.arrivalDay.title, activities: dest.arrivalDay.activities };
  }
  if (dayNumber === totalDays && totalDays > 1) {
    return { day: dayNumber, title: dest.departureDay.title, activities: dest.departureDay.activities };
  }
  const pool = dest.coreDays;
  const template = pool[(dayNumber + regenSeed) % pool.length];
  return { day: dayNumber, title: template.title, activities: template.activities };
}

export function matchTrip(prefs: TripPreferences): TripPackage {
  const scored = destinations
    .map((dest) => ({ dest, score: scoreDestination(dest, prefs) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.dest ?? destinations[0];
  const duration = prefs.durationDays ?? 5;
  const groupSize = prefs.groupSize ?? 1;

  const itinerary = buildItinerary(best, duration);
  const estimatedCost = Math.round(best.costPerPersonPerDay * duration * groupSize);

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
  };
}

export function getDestinationTemplate(packageId: string): DestinationTemplate | undefined {
  return destinations.find((d) => d.id === packageId);
}
