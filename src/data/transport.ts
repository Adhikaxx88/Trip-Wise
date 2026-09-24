import type { TransportOption } from '../types';

function unsplash(keywords: string): string {
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(keywords).replace(/%20/g, '+')}`;
}

export function transportMapsLink(place: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(place)}`;
}

export function routeMapsLink(fromCity: string, toCity: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(`${fromCity} to ${toCity}`)}`;
}

function key(a: string, b: string): string {
  return `${a}-${b}`;
}

const INDONESIA_CITY_NAMES = new Set([
  'Jakarta',
  'Bandung',
  'Yogyakarta',
  'Bali',
  'Lombok',
  'Surabaya',
  'Labuan Bajo',
  'Malang',
]);

function isDomesticIndonesia(a: string, b: string): boolean {
  return INDONESIA_CITY_NAMES.has(a) && INDONESIA_CITY_NAMES.has(b);
}

const BOOKING_URL = {
  train: 'https://kai.id',
  bus: 'https://damri.co.id',
  flightDomesticId: 'https://www.lionair.co.id',
  ferry: 'https://www.pelni.co.id',
  fallback: 'https://www.traveloka.com',
};

/** Resolves the booking URL for a transport option per the domestic-Indonesia / international / ferry / fallback rules. */
function resolveBookingUrl(type: TransportOption['type'], fromCity: string, toCity: string): string {
  if (isDomesticIndonesia(fromCity, toCity)) {
    if (type === 'train') return BOOKING_URL.train;
    if (type === 'bus') return BOOKING_URL.bus;
    if (type === 'flight') return BOOKING_URL.flightDomesticId;
  }
  if (type === 'ferry') return BOOKING_URL.ferry;
  return BOOKING_URL.fallback;
}

/** Builds a transport option, filling in bookingUrl automatically unless one is explicitly provided. */
function option(
  fromCity: string,
  toCity: string,
  opt: Omit<TransportOption, 'bookingUrl'> & { bookingUrl?: string },
): TransportOption {
  return { ...opt, bookingUrl: opt.bookingUrl ?? resolveBookingUrl(opt.type, fromCity, toCity) };
}

export const intercityTransport: Record<string, TransportOption[]> = {
  [key('Jakarta', 'Bandung')]: [
    option('Jakarta', 'Bandung', {
      type: 'train',
      name: 'Whoosh High Speed Train',
      duration: '46 min',
      costPerPerson: 20,
      costLabel: 'Rp 300.000',
      image: unsplash('indonesia high speed train'),
      badge: 'Fastest',
    }),
    option('Jakarta', 'Bandung', {
      type: 'bus',
      name: 'Damri Executive',
      duration: '3 hours',
      costPerPerson: 7,
      costLabel: 'Rp 100.000',
      image: unsplash('indonesia bus terminal'),
      badge: 'Best value',
    }),
  ],
  [key('Jakarta', 'Yogyakarta')]: [
    option('Jakarta', 'Yogyakarta', {
      type: 'train',
      name: 'KAI Argo Lawu',
      duration: '7.5 hours',
      costPerPerson: 24,
      costLabel: 'Rp 370.000',
      image: unsplash('kereta api indonesia station'),
      badge: 'Best value',
    }),
    option('Jakarta', 'Yogyakarta', {
      type: 'flight',
      name: 'Garuda Indonesia',
      duration: '1 hour 15 min',
      costPerPerson: 55,
      costLabel: 'Rp 850.000',
      image: unsplash('small airplane domestic flight'),
      badge: 'Fastest',
    }),
  ],
  [key('Bali', 'Lombok')]: [
    option('Bali', 'Lombok', {
      type: 'ferry',
      name: 'Gili Fast Boat',
      duration: '4-6 hours',
      costPerPerson: 17,
      costLabel: 'Rp 250.000',
      image: unsplash('fast boat bali lombok ocean'),
      badge: 'Best value',
    }),
    option('Bali', 'Lombok', {
      type: 'flight',
      name: 'Wings Air',
      duration: '30 min',
      costPerPerson: 33,
      costLabel: 'Rp 500.000',
      image: unsplash('small airplane domestic flight'),
      badge: 'Fastest',
    }),
  ],
  [key('Jakarta', 'Bali')]: [
    option('Jakarta', 'Bali', {
      type: 'flight',
      name: 'Garuda Indonesia / Lion Air',
      duration: '1 hour 50 min',
      costPerPerson: 65,
      costLabel: 'Rp 1.000.000',
      image: unsplash('airplane airport departure'),
      badge: 'Fastest',
    }),
  ],
  [key('Yogyakarta', 'Bali')]: [
    option('Yogyakarta', 'Bali', {
      type: 'flight',
      name: 'Citilink',
      duration: '1 hour 40 min',
      costPerPerson: 58,
      costLabel: 'Rp 900.000',
      image: unsplash('airplane airport departure'),
      badge: 'Fastest',
    }),
  ],
  [key('Tokyo', 'Osaka')]: [
    option('Tokyo', 'Osaka', {
      type: 'train',
      name: 'Tokaido Shinkansen',
      duration: '2 hours 30 min',
      costPerPerson: 130,
      costLabel: '¥14,000',
      image: unsplash('shinkansen bullet train japan'),
      badge: 'Fastest',
      bookingUrl: 'https://www.jrpass.com',
    }),
    option('Tokyo', 'Osaka', {
      type: 'bus',
      name: 'Willer Express overnight bus',
      duration: '8 hours',
      costPerPerson: 40,
      costLabel: '¥4,500',
      image: unsplash('bus terminal night'),
      badge: 'Best value',
    }),
  ],
  [key('Tokyo', 'Kyoto')]: [
    option('Tokyo', 'Kyoto', {
      type: 'train',
      name: 'Tokaido Shinkansen',
      duration: '2 hours 15 min',
      costPerPerson: 125,
      costLabel: '¥13,500',
      image: unsplash('shinkansen bullet train japan'),
      badge: 'Fastest',
      bookingUrl: 'https://www.jrpass.com',
    }),
  ],
  [key('Osaka', 'Kyoto')]: [
    option('Osaka', 'Kyoto', {
      type: 'train',
      name: 'JR Kyoto Line rapid',
      duration: '30 min',
      costPerPerson: 6,
      costLabel: '¥560',
      image: unsplash('japan local train'),
      badge: 'Best value',
      bookingUrl: 'https://www.jrpass.com',
    }),
  ],
  [key('Dubai', 'Abu Dhabi')]: [
    option('Dubai', 'Abu Dhabi', {
      type: 'bus',
      name: 'E100 Intercity Bus',
      duration: '2 hours',
      costPerPerson: 7,
      costLabel: 'AED 25',
      image: unsplash('intercity bus dubai'),
      badge: 'Best value',
    }),
    option('Dubai', 'Abu Dhabi', {
      type: 'car',
      name: 'Private car / rental',
      duration: '1 hour 20 min',
      costPerPerson: 25,
      costLabel: 'AED 90',
      image: unsplash('private car driver travel'),
      badge: 'Fastest',
    }),
  ],
  [key('Bangkok', 'Chiang Mai')]: [
    option('Bangkok', 'Chiang Mai', {
      type: 'flight',
      name: 'Thai AirAsia',
      duration: '1 hour 20 min',
      costPerPerson: 45,
      costLabel: '฿1,500',
      image: unsplash('small airplane domestic flight'),
      badge: 'Fastest',
    }),
    option('Bangkok', 'Chiang Mai', {
      type: 'train',
      name: 'State Railway overnight sleeper',
      duration: '12 hours',
      costPerPerson: 25,
      costLabel: '฿800',
      image: unsplash('thailand overnight train'),
      badge: 'Best value',
    }),
  ],
  [key('Bangkok', 'Phuket')]: [
    option('Bangkok', 'Phuket', {
      type: 'flight',
      name: 'Bangkok Airways',
      duration: '1 hour 25 min',
      costPerPerson: 55,
      costLabel: '฿1,900',
      image: unsplash('small airplane domestic flight'),
      badge: 'Fastest',
    }),
  ],
  [key('Rome', 'Florence')]: [
    option('Rome', 'Florence', {
      type: 'train',
      name: 'Frecciarossa High Speed',
      duration: '1 hour 30 min',
      costPerPerson: 45,
      costLabel: '€40',
      image: unsplash('italy high speed train'),
      badge: 'Fastest',
      bookingUrl: 'https://www.trenitalia.com',
    }),
  ],
  [key('Florence', 'Venice')]: [
    option('Florence', 'Venice', {
      type: 'train',
      name: 'Italo High Speed',
      duration: '2 hours',
      costPerPerson: 50,
      costLabel: '€45',
      image: unsplash('italy high speed train'),
      badge: 'Fastest',
      bookingUrl: 'https://www.trenitalia.com',
    }),
  ],
  [key('Paris', 'Nice')]: [
    option('Paris', 'Nice', {
      type: 'flight',
      name: 'Air France',
      duration: '1 hour 30 min',
      costPerPerson: 90,
      costLabel: '€85',
      image: unsplash('airplane airport departure'),
      badge: 'Fastest',
    }),
    option('Paris', 'Nice', {
      type: 'train',
      name: 'TGV High Speed',
      duration: '5 hours 30 min',
      costPerPerson: 75,
      costLabel: '€70',
      image: unsplash('france tgv train'),
      badge: 'Best value',
    }),
  ],
};

const NEARBY_COUNTRY_GROUPS: string[][] = [
  ['Japan', 'South Korea', 'Taiwan', 'Hong Kong', 'China', 'Macau'],
  ['Thailand', 'Vietnam', 'Cambodia', 'Myanmar', 'Malaysia', 'Singapore', 'Philippines'],
  ['France', 'Italy', 'Spain', 'Germany', 'Switzerland', 'Austria', 'Belgium', 'Netherlands', 'UK'],
  ['UAE', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Kuwait', 'Oman'],
  ['USA', 'Canada', 'Mexico'],
];

function sameCountryGroup(a: string, b: string): boolean {
  return NEARBY_COUNTRY_GROUPS.some((group) => group.includes(a) && group.includes(b));
}

export function getIntercityOptions(
  fromCity: string,
  toCity: string,
  fromCountry?: string,
  toCountry?: string,
): TransportOption[] {
  const direct = intercityTransport[key(fromCity, toCity)] ?? intercityTransport[key(toCity, fromCity)];
  if (direct) return direct;

  const differentCountries = !!fromCountry && !!toCountry && fromCountry !== toCountry;
  const nearby = !differentCountries || (fromCountry && toCountry && sameCountryGroup(fromCountry, toCountry));

  const options: TransportOption[] = [];

  if (differentCountries) {
    options.push(
      option(fromCity, toCity, {
        type: 'flight',
        name: `International flight, ${fromCity} → ${toCity}`,
        duration: nearby ? '2-4 hours' : '6-12 hours',
        costPerPerson: nearby ? 180 : 550,
        costLabel: nearby ? '$180' : '$550',
        image: unsplash('airplane airport departure'),
        badge: 'Fastest',
      }),
    );
    if (nearby) {
      options.push(
        option(fromCity, toCity, {
          type: 'bus',
          name: `Cross-border coach, ${fromCity} → ${toCity}`,
          duration: '6-10 hours',
          costPerPerson: 45,
          costLabel: '$45',
          image: unsplash('bus terminal'),
          badge: 'Best value',
        }),
      );
    }
  } else {
    options.push(
      option(fromCity, toCity, {
        type: 'flight',
        name: `Domestic flight, ${fromCity} → ${toCity}`,
        duration: '1-2 hours',
        costPerPerson: 70,
        costLabel: '$70',
        image: unsplash('small airplane domestic flight'),
        badge: 'Fastest',
      }),
      option(fromCity, toCity, {
        type: 'train',
        name: `Intercity rail, ${fromCity} → ${toCity}`,
        duration: '3-6 hours',
        costPerPerson: 35,
        costLabel: '$35',
        image: unsplash('intercity train'),
      }),
      option(fromCity, toCity, {
        type: 'bus',
        name: `Intercity coach, ${fromCity} → ${toCity}`,
        duration: '5-8 hours',
        costPerPerson: 18,
        costLabel: '$18',
        image: unsplash('bus terminal'),
        badge: 'Best value',
      }),
    );
  }

  options.push(
    option(fromCity, toCity, {
      type: 'car',
      name: 'Private car rental',
      duration: 'Varies',
      costPerPerson: 40,
      costLabel: '$40/day',
      image: unsplash('private car driver travel'),
    }),
  );

  return options;
}

export interface IntracityTransport {
  primaryLabel: string;
  options: { type: string; costPerTrip: string; image: string }[];
}

export const intracityTransport: Record<string, IntracityTransport> = {
  Bali: {
    primaryLabel: 'Grab/Gojek · Rp 15.000-50.000/trip',
    options: [
      { type: 'Motorbike rental', costPerTrip: 'Rp 80.000/day', image: unsplash('motorbike scooter bali road') },
      { type: 'Private car', costPerTrip: 'Rp 100.000-200.000', image: unsplash('private car driver travel') },
      { type: 'Bicycle', costPerTrip: 'Rp 50.000/day', image: unsplash('bicycle rental travel') },
    ],
  },
  Tokyo: {
    primaryLabel: 'JR Pass / Metro · $10-15/day',
    options: [
      { type: 'IC Card (Suica)', costPerTrip: '$2-5', image: unsplash('mrt singapore station') },
      { type: 'Taxi', costPerTrip: '$15-30', image: unsplash('yellow taxi city') },
      { type: 'Bicycle rental', costPerTrip: '$8/day', image: unsplash('bicycle rental travel') },
    ],
  },
  Dubai: {
    primaryLabel: 'Metro + Taxi · AED 5-40/trip',
    options: [
      { type: 'Dubai Metro', costPerTrip: 'AED 5-8', image: unsplash('metro subway station modern') },
      { type: 'Taxi', costPerTrip: 'AED 20-40', image: unsplash('yellow taxi city') },
      { type: 'Walk', costPerTrip: 'Free', image: unsplash('city walking street') },
    ],
  },
  London: {
    primaryLabel: 'Tube + Oyster · £2-6/trip',
    options: [
      { type: 'London Underground', costPerTrip: '£2-6', image: unsplash('metro subway station modern') },
      { type: 'Black cab', costPerTrip: '£15-30', image: unsplash('yellow taxi city') },
      { type: 'Walk', costPerTrip: 'Free', image: unsplash('city walking street') },
    ],
  },
  Phuket: {
    primaryLabel: 'Grab + Tuk-tuk · ฿50-200/trip',
    options: [
      { type: 'Motorbike rental', costPerTrip: '฿250/day', image: unsplash('motorbike scooter bali road') },
      { type: 'Tuk-tuk', costPerTrip: '฿100-200', image: unsplash('tuk tuk bangkok thailand') },
      { type: 'Grab', costPerTrip: '฿50-150', image: unsplash('grab car indonesia') },
    ],
  },
  Yogyakarta: {
    primaryLabel: 'Becak + Walk · Rp 20.000-50.000/trip',
    options: [
      { type: 'Becak (rickshaw)', costPerTrip: 'Rp 20.000-40.000', image: unsplash('becak yogyakarta indonesia') },
      { type: 'Bicycle rental', costPerTrip: 'Rp 30.000/day', image: unsplash('bicycle rental travel') },
      { type: 'Walk', costPerTrip: 'Free', image: unsplash('city walking street') },
    ],
  },
  'New York': {
    primaryLabel: 'Subway + Uber · $3-25/trip',
    options: [
      { type: 'Subway/Metro', costPerTrip: '$2.90', image: unsplash('subway metro station modern') },
      { type: 'Uber/Lyft', costPerTrip: '$15-30', image: unsplash('yellow taxi city') },
      { type: 'Walk', costPerTrip: 'Free', image: unsplash('city walking street') },
    ],
  },
};

const MAJOR_CITIES = new Set(['Tokyo', 'Dubai', 'London', 'New York', 'Paris', 'Singapore', 'Seoul', 'Bangkok']);
const BEACH_DESTINATIONS = new Set(['Bali', 'Phuket', 'Koh Samui', 'Lombok', 'Maldives', 'Gili Islands', 'Bora Bora', 'Fiji']);
const USA_CITIES = new Set(['New York', 'Los Angeles', 'Miami', 'Las Vegas', 'Chicago', 'San Francisco', 'Hawaii']);

export function getIntracityOptions(cityName: string): IntracityTransport {
  const curated = intracityTransport[cityName];
  if (curated) return curated;

  if (USA_CITIES.has(cityName)) {
    return {
      primaryLabel: 'Uber/Lyft + Metro · $10-25/trip',
      options: [
        { type: 'Uber/Lyft', costPerTrip: '$10-25', image: unsplash('yellow taxi city') },
        { type: 'Metro/Subway', costPerTrip: '$2.50-3', image: unsplash('subway metro station modern') },
        { type: 'Walk', costPerTrip: 'Free', image: unsplash('city walking street') },
      ],
    };
  }
  if (BEACH_DESTINATIONS.has(cityName)) {
    return {
      primaryLabel: 'Motorbike + Grab · $2-10/trip',
      options: [
        { type: 'Motorbike rental', costPerTrip: '$5-8/day', image: unsplash('motorbike scooter bali road') },
        { type: 'Grab/local taxi', costPerTrip: '$3-10', image: unsplash('grab car indonesia') },
        { type: 'Walk', costPerTrip: 'Free', image: unsplash('city walking street') },
      ],
    };
  }
  if (MAJOR_CITIES.has(cityName)) {
    return {
      primaryLabel: 'MRT/Subway + Taxi · $2-20/trip',
      options: [
        { type: 'MRT/Subway', costPerTrip: '$1.50-4', image: unsplash('mrt singapore station') },
        { type: 'Taxi', costPerTrip: '$10-25', image: unsplash('yellow taxi city') },
        { type: 'Walk', costPerTrip: 'Free', image: unsplash('city walking street') },
      ],
    };
  }

  return {
    primaryLabel: 'Tuk-tuk + Walk · $1-8/trip',
    options: [
      { type: 'Tuk-tuk', costPerTrip: '$2-8', image: unsplash('tuk tuk bangkok thailand') },
      { type: 'Bicycle rental', costPerTrip: '$5/day', image: unsplash('bicycle rental travel') },
      { type: 'Walk', costPerTrip: 'Free', image: unsplash('city walking street') },
    ],
  };
}
