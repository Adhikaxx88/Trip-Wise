/**
 * One-off generator for src/data/tripwise-master.json.
 * Consolidates the real data already in geography.ts + transport.ts into a
 * single JSON file, and fills in the per-city attraction/restaurant/hero-image
 * fields the spec asks for using clearly-generic, template-based entries
 * (no fabricated specific business names) since we have no verified data
 * source for real attractions/restaurants per city.
 *
 * Images: every image field comes from src/data/images-master.json via
 * getImage.ts (verified Wikimedia Commons files) or is the neutral
 * /images/placeholder-travel.svg — never a random-photo service.
 *
 * Run with: npx tsx scripts/generate-tripwise-master.ts
 */
import { writeFileSync } from 'node:fs';
import { COUNTRIES, INDONESIA_CITIES, type CityOption, type CountryOption } from '../src/data/geography';
import { intercityTransport, getIntracityOptions } from '../src/data/transport';
import { FALLBACK_IMAGE, getActivityImage, getCityImage, isFallbackImage } from '../src/data/getImage';

function mapsLink(place: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(place)}`;
}

const ATTRACTION_TEMPLATES: { suffix: string; category: string; timeSlot: string; costTier: number }[] = [
  { suffix: 'Old Town Walking Tour', category: 'landmark', timeSlot: 'morning', costTier: 0 },
  { suffix: 'National Museum', category: 'culture', timeSlot: 'morning', costTier: 8 },
  { suffix: 'Central Park & Gardens', category: 'nature', timeSlot: 'afternoon', costTier: 0 },
  { suffix: 'Night Market', category: 'market', timeSlot: 'evening', costTier: 5 },
  { suffix: 'Sunset Viewpoint', category: 'viewpoint', timeSlot: 'evening', costTier: 0 },
];

const RESTAURANT_TEMPLATES: { suffix: string; mealType: 'breakfast' | 'lunch' | 'dinner'; priceRange: string }[] = [
  { suffix: 'Local Breakfast Kitchen', mealType: 'breakfast', priceRange: '$' },
  { suffix: 'Downtown Lunch House', mealType: 'lunch', priceRange: '$$' },
  { suffix: 'Rooftop Dinner Spot', mealType: 'dinner', priceRange: '$$$' },
];

function buildCityEntry(city: CityOption, countryName: string) {
  const label = `${city.name}, ${countryName}`;
  const card = getCityImage(city.name, 'card');
  const hero = getCityImage(city.name, 'hero');
  // images-master's activity category photos are specific places (Borobudur,
  // Bali rice terraces, ...), so attractions use this city's own verified photo.
  const attractionImage = isFallbackImage(card) ? FALLBACK_IMAGE : card;
  return {
    name: city.name,
    country: countryName,
    image: card,
    mapsLink: city.mapsLink,
    heroImages: isFallbackImage(hero) ? [] : [hero],
    hotels: {
      area: `Central ${city.name}`,
      image: getCityImage(city.name, 'hotel'),
      mapsLink: mapsLink(`hotels in Central ${city.name} ${countryName}`),
      priceRange: '$$',
    },
    attractions: ATTRACTION_TEMPLATES.map((t) => ({
      name: `${city.name} ${t.suffix}`,
      description: `A popular ${t.category} stop when visiting ${label}.`,
      image: attractionImage,
      mapsLink: mapsLink(`${city.name} ${t.suffix} ${countryName}`),
      cost: t.costTier,
      duration: '2 hours',
      category: t.category,
      timeSlot: t.timeSlot,
    })),
    restaurants: RESTAURANT_TEMPLATES.map((t) => ({
      name: `${city.name} ${t.suffix}`,
      cuisine: 'Local',
      image: getActivityImage('dinner'),
      mapsLink: mapsLink(`${city.name} ${t.suffix} ${countryName}`),
      priceRange: t.priceRange,
      mealType: t.mealType,
    })),
    intracityTransport: getIntracityOptions(city.name),
  };
}

const countriesOut: Record<string, unknown> = {};
for (const country of COUNTRIES as CountryOption[]) {
  countriesOut[country.name] = {
    region: country.region,
    cities: country.cities.map((c) => buildCityEntry(c, country.name)),
  };
}
countriesOut['Indonesia'] = {
  region: 'Asia',
  cities: INDONESIA_CITIES.map((c) => buildCityEntry(c, 'Indonesia')),
};

const routesOut: Record<string, unknown> = {};
for (const [key, options] of Object.entries(intercityTransport)) {
  routesOut[key] = options;
}

const fallbacks = {
  unknownCityImage: FALLBACK_IMAGE,
  unknownCityMapsLink: 'https://maps.google.com/?q=travel+destination',
  unknownAttractionImage: FALLBACK_IMAGE,
  unknownRouteType: 'flight',
  genericBookingUrl: 'https://www.traveloka.com',
};

const master = {
  generatedAt: new Date().toISOString(),
  countries: countriesOut,
  routes: routesOut,
  fallbacks,
};

writeFileSync('src/data/tripwise-master.json', JSON.stringify(master));
const cityCount = Object.values(countriesOut).reduce(
  (sum, c) => sum + (c as { cities: unknown[] }).cities.length,
  0,
);
console.log(
  `Wrote src/data/tripwise-master.json: ${Object.keys(countriesOut).length} countries, ${cityCount} cities, ${Object.keys(routesOut).length} curated routes.`,
);
