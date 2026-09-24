import imagesData from './images-master.json';

interface CityImages {
  hero: string;
  card: string;
  hotel: string;
}

interface ImagesMaster {
  cities: Record<string, CityImages>;
  activities: Record<string, string>;
  transport: Record<string, string>;
  hotels: Record<string, string>;
  fallback: {
    city: string;
    activity: string;
    transport: string;
    hotel: string;
    hero: string;
  };
}

const images = imagesData as ImagesMaster;

export const getCityImage = (city: string, type: 'hero' | 'card' | 'hotel' = 'card'): string =>
  images.cities[city]?.[type] ?? images.fallback[type === 'hero' ? 'hero' : 'city'];

export const getActivityImage = (activityName: string): string => {
  const slug = activityName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  if (images.activities[slug]) return images.activities[slug];
  const keywords = [
    'beach',
    'temple',
    'market',
    'food',
    'museum',
    'hiking',
    'spa',
    'sunset',
    'breakfast',
    'lunch',
    'dinner',
    'snorkel',
    'surf',
    'cook',
    'shop',
    'tour',
  ];
  for (const kw of keywords) {
    if (slug.includes(kw) && images.activities[kw]) return images.activities[kw];
  }
  return images.activities.default;
};

export const getTransportImage = (type: string): string =>
  images.transport[type.toLowerCase().replace(/\s+/g, '-')] ?? images.transport.default;

export const getHotelImage = (tier: 'budget' | 'standard' | 'luxury'): string =>
  images.hotels[tier] ?? images.hotels.standard;
