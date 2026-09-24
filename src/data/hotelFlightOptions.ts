import type { FlightOption, HotelOption, HotelTier } from '../types';
import { getAirlineLogo, getHotelImage } from './getImage';

function mapsLink(query: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

/** Deterministic pseudo-random 0..1 value derived from a string. */
function seededFraction(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

const HOTEL_TIER_META: Record<HotelTier, { label: string; min: number; max: number; ratingMin: number; ratingMax: number }> = {
  budget: { label: 'Budget guesthouse', min: 30, max: 60, ratingMin: 3, ratingMax: 3.5 },
  standard: { label: 'Boutique hotel', min: 80, max: 150, ratingMin: 3.8, ratingMax: 4.2 },
  luxury: { label: '5-star resort', min: 200, max: 500, ratingMin: 4.5, ratingMax: 5.0 },
};

export function buildHotelOptions(city: string): HotelOption[] {
  return (Object.keys(HOTEL_TIER_META) as HotelTier[]).map((tier) => {
    const meta = HOTEL_TIER_META[tier];
    const fraction = seededFraction(`${city}-${tier}`);
    const pricePerNight = Math.round(meta.min + fraction * (meta.max - meta.min));
    const rating = Math.round((meta.ratingMin + fraction * (meta.ratingMax - meta.ratingMin)) * 10) / 10;
    return {
      tier,
      name: `${city} ${meta.label}`,
      pricePerNight,
      rating,
      image: getHotelImage(tier),
      mapsLink: mapsLink(`${tier} hotel ${city}`),
    };
  });
}

export function getHotelOption(options: HotelOption[], tier: HotelTier): HotelOption {
  return options.find((o) => o.tier === tier) ?? options[1] ?? options[0];
}

const INDONESIA_DOMESTIC_AIRLINES: FlightOption[] = [
  {
    id: 'garuda',
    airline: 'Garuda Indonesia',
    logo: getAirlineLogo('Garuda Indonesia'),
    pricePerPerson: 115,
    duration: '1-2 hours',
    bookingUrl: 'https://www.garuda-indonesia.com',
  },
  {
    id: 'lionair',
    airline: 'Lion Air',
    logo: getAirlineLogo('Lion Air'),
    pricePerPerson: 60,
    duration: '1-2 hours',
    bookingUrl: 'https://www.lionair.co.id',
  },
  {
    id: 'citilink',
    airline: 'Citilink',
    logo: getAirlineLogo('Citilink'),
    pricePerPerson: 42,
    duration: '1-2 hours',
    bookingUrl: 'https://www.citilink.co.id',
  },
];

const REGION_SECOND_AIRLINE: Record<string, FlightOption> = {
  'Middle East': {
    id: 'emirates',
    airline: 'Emirates',
    logo: getAirlineLogo('Emirates'),
    pricePerPerson: 480,
    duration: '4-8 hours',
    bookingUrl: 'https://www.emirates.com',
  },
  Asia: {
    id: 'singapore-airlines',
    airline: 'Singapore Airlines',
    logo: getAirlineLogo('Singapore Airlines'),
    pricePerPerson: 420,
    duration: '4-8 hours',
    bookingUrl: 'https://www.singaporeair.com',
  },
};

function internationalAirlines(region?: string): FlightOption[] {
  const second = (region ? REGION_SECOND_AIRLINE[region] : undefined) ?? REGION_SECOND_AIRLINE.Asia;
  return [
    {
      id: 'garuda-intl',
      airline: 'Garuda Indonesia',
      logo: getAirlineLogo('Garuda Indonesia'),
      pricePerPerson: 650,
      duration: '6-12 hours',
      bookingUrl: 'https://www.garuda-indonesia.com',
    },
    second,
    {
      id: 'airasia',
      airline: 'AirAsia',
      logo: getAirlineLogo('AirAsia'),
      pricePerPerson: 320,
      duration: '5-10 hours',
      bookingUrl: 'https://www.airasia.com',
    },
  ];
}

export function buildFlightOptions(isDomesticIndonesia: boolean, region?: string): FlightOption[] {
  return isDomesticIndonesia ? INDONESIA_DOMESTIC_AIRLINES : internationalAirlines(region);
}

export function getFlightOption(options: FlightOption[], id: string): FlightOption {
  return options.find((o) => o.id === id) ?? options[0];
}
