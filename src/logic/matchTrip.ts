import { destinations, type DayTemplate, type DestinationTemplate } from '../data/destinations';
import { COUNTRIES } from '../data/geography';
import { getCityImage } from '../data/getImage';
import { buildFlightOptions, buildHotelOptions, getFlightOption, getHotelOption } from '../data/hotelFlightOptions';
import { HOTEL_DISCOUNT_BY_TIER } from '../data/subscriptionTiers';
import { getIntercityRoute as getIntercityOptions, getIntracityOptions } from '../data/tripwiseMaster';
import type {
  CostBreakdown,
  FlightOption,
  HotelOption,
  ItineraryActivity,
  ItineraryDay,
  SelectedCity,
  SubscriptionTierId,
  TripPackage,
  TripPreferences,
} from '../types';

interface HotelFlightSelection {
  hotelOptions: HotelOption[];
  flightOptions: FlightOption[];
  selectedHotelTier: 'budget' | 'standard' | 'luxury';
  selectedFlightId: string;
  hotel: CostBreakdown['hotel'];
  flight: CostBreakdown['flight'];
}

function buildHotelFlightSelection(
  city: string,
  isDomesticIndonesia: boolean,
  region: string | undefined,
  nights: number,
  rooms: number,
  groupSize: number,
  hotelDiscount: number,
): HotelFlightSelection {
  const hotelOptions = buildHotelOptions(city);
  const flightOptions = buildFlightOptions(isDomesticIndonesia, region);
  const selectedHotelTier = 'standard' as const;
  const selectedFlightId = flightOptions[0].id;
  const hotelOption = getHotelOption(hotelOptions, selectedHotelTier);
  const flightOption = getFlightOption(flightOptions, selectedFlightId);

  return {
    hotelOptions,
    flightOptions,
    selectedHotelTier,
    selectedFlightId,
    hotel: {
      name: hotelOption.name,
      cost: Math.round(hotelOption.pricePerNight * nights * rooms * (1 - hotelDiscount)),
      bookingUrl: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}`,
    },
    flight: {
      name: `${flightOption.airline} round-trip to ${city}`,
      cost: Math.round(flightOption.pricePerPerson * groupSize),
      bookingUrl: flightOption.bookingUrl,
    },
  };
}

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
): HotelFlightSelection {
  const nights = Math.max(1, durationDays - 1);
  const rooms = Math.max(1, Math.ceil(groupSize / 2));
  const hotelDiscount = HOTEL_DISCOUNT_BY_TIER[currentTier] / 100;
  const isDomesticIndonesia = dest.country === 'Indonesia';

  return buildHotelFlightSelection(
    dest.destination,
    isDomesticIndonesia,
    regionForCountry(dest.country),
    nights,
    rooms,
    groupSize,
    hotelDiscount,
  );
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

const VIBE_ACTIVITY_TEMPLATES: Record<string, string[]> = {
  relaxing: [
    'Slow morning at a local café',
    'Spa & wellness afternoon',
    'Sunset by the waterfront',
    'Boat or lake outing',
    'Wander the local market',
    'Poolside or beach afternoon',
  ],
  adventurous: [
    'Hike a scenic trail near {city}',
    'Adrenaline activity (zipline, rafting, or climbing)',
    'Explore a nearby nature park',
    'Bike tour through {city}',
    'Sunset viewpoint hike',
    'Local adventure sports excursion',
  ],
  cultural: [
    'Visit the main landmark in {city}',
    'Explore the old town / historic quarter',
    'Local food market crawl',
    'Museum or heritage site visit',
    'Traditional craft workshop',
    'Evening cultural show',
  ],
  romantic: [
    'Sunset dinner or viewpoint',
    'Couples spa or wine tasting',
    'Romantic stroll through {city}',
    'Candlelit dinner at a scenic spot',
    'Private tour of a landmark',
    'Rooftop evening drinks',
  ],
};

const REGION_DAILY_COST: Record<string, number> = {
  Asia: 70,
  'Middle East': 140,
  Europe: 150,
  Americas: 140,
  Africa: 90,
  Pacific: 160,
  Indonesia: 55,
};

function regionForCountry(country: string): string {
  if (country === 'Indonesia') return 'Indonesia';
  const match = COUNTRIES.find((c) => c.name === country);
  return match?.region ?? 'Asia';
}

function dailyCostForCountry(country: string): number {
  return REGION_DAILY_COST[regionForCountry(country)] ?? 90;
}

function distributeDays(totalDays: number, cityCount: number): number[] {
  const safeDays = Math.max(cityCount, totalDays);
  const base = Math.floor(safeDays / cityCount);
  const remainder = safeDays % cityCount;
  return Array.from({ length: cityCount }, (_, i) => base + (i < remainder ? 1 : 0));
}

async function buildIntracityActivity(cityName: string, name: string, price: number): Promise<ItineraryActivity> {
  const intracity = await getIntracityOptions(cityName);
  const primary = intracity.options[0];
  return {
    name,
    price,
    transport: primary
      ? {
          type: primary.type,
          duration: '15-30 min',
          cost: 0,
          alternatives: intracity.options.map((o) => ({ type: o.type, cost: 0, duration: o.costPerTrip })),
        }
      : undefined,
  };
}

async function buildCityDays(
  selected: SelectedCity,
  startDay: number,
  numDays: number,
  vibe: string | null,
  isFirstCity: boolean,
  isLastCity: boolean,
): Promise<ItineraryDay[]> {
  const cityName = selected.city;
  const template = VIBE_ACTIVITY_TEMPLATES[vibe ?? 'relaxing'] ?? VIBE_ACTIVITY_TEMPLATES.relaxing;
  const dailyCost = dailyCostForCountry(selected.country);
  const days: ItineraryDay[] = [];

  for (let i = 0; i < numDays; i++) {
    const dayNumber = startDay + i;
    const isArrival = isFirstCity && i === 0;
    const isDeparture = isLastCity && i === numDays - 1;
    const activities: ItineraryActivity[] = [];

    if (isArrival) {
      activities.push({ time: '2:00 PM', name: `Arrive in ${cityName} & check in`, price: 0 });
      activities.push({ time: '6:00 PM', name: 'Welcome dinner', price: Math.round(dailyCost * 0.25) });
    } else if (isDeparture) {
      activities.push({ time: '8:00 AM', name: 'Farewell breakfast', price: Math.round(dailyCost * 0.15) });
      activities.push(
        await buildIntracityActivity(cityName, 'Last-minute exploring & souvenirs', Math.round(dailyCost * 0.2)),
      );
      activities.push({ time: '2:00 PM', name: `Transfer for departure from ${cityName}`, price: 0 });
    } else {
      const pick1 = template[(dayNumber - 1) % template.length].replace('{city}', cityName);
      const pick2 = template[(dayNumber + 2) % template.length].replace('{city}', cityName);
      activities.push({ time: '8:00 AM', name: 'Breakfast', price: Math.round(dailyCost * 0.1) });
      activities.push(await buildIntracityActivity(cityName, pick1, Math.round(dailyCost * 0.35)));
      activities.push({ time: '1:00 PM', name: 'Lunch', price: Math.round(dailyCost * 0.15) });
      activities.push(await buildIntracityActivity(cityName, pick2, Math.round(dailyCost * 0.3)));
      activities.push({ time: '7:30 PM', name: 'Dinner', price: Math.round(dailyCost * 0.2) });
    }

    days.push({
      day: dayNumber,
      type: 'city',
      city: cityName,
      title: isArrival
        ? `Arrival in ${cityName}`
        : isDeparture
          ? `Last Day in ${cityName}`
          : `Exploring ${cityName}`,
      activities,
    });
  }

  return days;
}

async function buildTransitionDay(dayNumber: number, from: SelectedCity, to: SelectedCity): Promise<ItineraryDay> {
  const options = await getIntercityOptions(from.city, to.city, from.country, to.country);
  const best = options[0];
  return {
    day: dayNumber,
    type: 'transition',
    title: `Travel Day: ${from.city} → ${to.city}`,
    fromCity: from.city,
    toCity: to.city,
    transportOptions: options,
    selectedTransportIndex: 0,
    activities: best
      ? [{ time: 'All day', name: `${best.name} to ${to.city}`, price: best.costPerPerson }]
      : [],
  };
}

export function activitiesCostPerPersonWithTransition(itinerary: ItineraryDay[]): number {
  return activitiesCostPerPerson(itinerary);
}

async function buildMultiCityItinerary(
  cities: SelectedCity[],
  totalDays: number,
  vibe: string | null,
): Promise<ItineraryDay[]> {
  const perCity = distributeDays(Math.max(1, totalDays), cities.length);
  const itinerary: ItineraryDay[] = [];
  let dayCounter = 1;

  for (let index = 0; index < cities.length; index++) {
    const city = cities[index];
    const cityDays = await buildCityDays(
      city,
      dayCounter,
      perCity[index],
      vibe,
      index === 0,
      index === cities.length - 1,
    );
    itinerary.push(...cityDays);
    dayCounter += perCity[index];

    if (index < cities.length - 1) {
      itinerary.push(await buildTransitionDay(dayCounter, city, cities[index + 1]));
      dayCounter += 1;
    }
  }

  return itinerary.map((day, i) => ({ ...day, day: i + 1 }));
}

function isDomesticIndonesiaTrip(cities: SelectedCity[]): boolean {
  return cities.every((c) => c.country === 'Indonesia');
}

async function matchMultiCityTrip(prefs: TripPreferences, currentTier: SubscriptionTierId): Promise<TripPackage> {
  const cities = prefs.selectedCities ?? [];
  const duration = prefs.durationDays ?? Math.max(cities.length * 2, 4);
  const groupSize = prefs.groupSize ?? 1;
  const primaryVibe = prefs.vibe && prefs.vibe.length > 0 ? prefs.vibe[0] : null;

  const itinerary = await buildMultiCityItinerary(cities, duration, primaryVibe);

  const nights = Math.max(1, itinerary.length - 1);
  const rooms = Math.max(1, Math.ceil(groupSize / 2));
  const hotelDiscount = HOTEL_DISCOUNT_BY_TIER[currentTier] / 100;
  const anchorCity = cities[0];
  const selection = buildHotelFlightSelection(
    anchorCity.city,
    isDomesticIndonesiaTrip(cities),
    regionForCountry(anchorCity.country),
    nights,
    rooms,
    groupSize,
    hotelDiscount,
  );
  const costBreakdown: CostBreakdown = { hotel: selection.hotel, flight: selection.flight };
  const estimatedCost =
    costBreakdown.hotel.cost +
    costBreakdown.flight.cost +
    Math.round(activitiesCostPerPerson(itinerary) * groupSize);

  const cityNames = cities.map((c) => c.city);
  const destinationLabel =
    cityNames.length === 1
      ? `${cityNames[0]}, ${cities[0].country}`
      : cityNames.join(' + ');

  // Verified hero photo of the first city, or the neutral placeholder — never a random stock photo.
  const coverImageUrl = getCityImage(cities[0].city, 'hero');

  const tags = Array.from(new Set(cities.map((c) => c.country)));
  const packageId = `multicity-${cityNames.map((c) => c.toLowerCase().replace(/\s+/g, '-')).join('_')}-${Date.now()}`;

  return {
    id: packageId,
    destination: destinationLabel,
    summary: `A ${itinerary.length}-day journey through ${cityNames.join(', ')}.`,
    coverImageUrl,
    estimatedCost,
    vibe: (primaryVibe ?? 'cultural') as TripPackage['vibe'],
    tags,
    itinerary,
    bookingUrl: costBreakdown.hotel.bookingUrl,
    costBreakdown,
    tier: 'free',
    hotelDiscountPercent: HOTEL_DISCOUNT_BY_TIER[currentTier],
    cities: cityNames,
    hotelOptions: selection.hotelOptions,
    flightOptions: selection.flightOptions,
    selectedHotelTier: selection.selectedHotelTier,
    selectedFlightId: selection.selectedFlightId,
  };
}

export async function matchTrip(
  prefs: TripPreferences,
  currentTier: SubscriptionTierId = 'free',
): Promise<TripPackage> {
  if (prefs.selectedCities && prefs.selectedCities.length > 0) {
    return matchMultiCityTrip(prefs, currentTier);
  }

  const eligible = destinations.filter((dest) => isUnlockedForTier(dest.tier, currentTier));
  const pool = eligible.length > 0 ? eligible : destinations;

  const scored = pool
    .map((dest) => ({ dest, score: scoreDestination(dest, prefs) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.dest ?? pool[0];
  const duration = prefs.durationDays ?? 5;
  const groupSize = prefs.groupSize ?? 1;

  const itinerary = buildItinerary(best, duration);
  const selection = buildCostBreakdown(best, duration, groupSize, currentTier);
  const costBreakdown: CostBreakdown = { hotel: selection.hotel, flight: selection.flight };
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
    cities: [best.destination],
    hotelOptions: selection.hotelOptions,
    flightOptions: selection.flightOptions,
    selectedHotelTier: selection.selectedHotelTier,
    selectedFlightId: selection.selectedFlightId,
  };
}

export function getDestinationTemplate(packageId: string): DestinationTemplate | undefined {
  return destinations.find((d) => d.id === packageId);
}
