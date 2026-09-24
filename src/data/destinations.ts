import type { GroupType, ItineraryActivity, SubscriptionTierId, Vibe } from '../types';
import { getCityImage } from './getImage';

export interface DayTemplate {
  title: string;
  activities: ItineraryActivity[];
}

export interface RestaurantOption {
  name: string;
  price: number;
}

export interface RestaurantPools {
  breakfast: RestaurantOption[];
  lunch: RestaurantOption[];
  dinner: RestaurantOption[];
}

export interface AttractionTicket {
  name: string;
  price: number;
}

export interface DestinationTemplate {
  id: string;
  destination: string;
  country: string;
  summary: string;
  coverImageUrl: string;
  vibe: Vibe;
  tags: string[];
  goodFor: GroupType[];
  tier: SubscriptionTierId;
  costPerPersonPerDay: number;
  bookingUrl: string;
  hotelName: string;
  hotelCostPerNight: number;
  airline: string;
  flightEstimatePerPerson: number;
  restaurants: RestaurantPools;
  attractionTickets: AttractionTicket[];
  arrivalDay: DayTemplate;
  coreDays: DayTemplate[];
  departureDay: DayTemplate;
}

/**
 * Cover images come from the verified images-master.json via getCityImage.
 * Destinations without a verified photo yet (Maldives/Malé, Queenstown,
 * Patagonia, Marrakech) resolve to the neutral placeholder rather than an
 * unverified stock photo, and pick up a real photo automatically once one is
 * added to images-master.json.
 */
export const destinations: DestinationTemplate[] = [
  {
    id: 'bali-relaxing',
    destination: 'Bali',
    country: 'Indonesia',
    summary:
      'Sink into slow mornings, cliffside infinity pools, and warm turquoise water. Bali is built for travelers who want to do absolutely nothing, beautifully.',
    coverImageUrl: getCityImage('Bali', 'hero'),
    vibe: 'relaxing',
    tags: ['beach', 'spa', 'slow travel', 'nature'],
    goodFor: ['solo', 'couple', 'family', 'friends'],
    tier: 'free',
    costPerPersonPerDay: 95,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Bali',
    hotelName: 'Ubud jungle boutique villa',
    hotelCostPerNight: 70,
    flightEstimatePerPerson: 650,
    airline: 'Garuda Indonesia',
    restaurants: {
      breakfast: [
      { name: 'Clear Café, Ubud', price: 6 },
      { name: 'Warung local breakfast', price: 4 },
      { name: 'Seniman Coffee Studio', price: 7 },
      ],
      lunch: [
      { name: 'Locavore', price: 20 },
      { name: 'Kismet Kitchen', price: 10 },
      { name: 'Bebek Bengil (Dirty Duck)', price: 12 },
      ],
      dinner: [
      { name: 'Sarong Restaurant', price: 35 },
      { name: 'Mozaic Restaurant', price: 50 },
      { name: 'Beach BBQ at Jimbaran Bay', price: 25 },
      ],
    },
    attractionTickets: [
      { name: 'Tirta Empul Temple entrance', price: 3 },
      { name: 'Tegallalang Rice Terrace entrance', price: 2 },
      { name: 'Uluwatu Temple entrance', price: 4 },
    ],
    arrivalDay: {
      title: 'Arrival & Settle In',
      activities: [
        { time: '2:00 PM', name: 'Land in Denpasar & transfer to Ubud or Seminyak' },
        { time: '5:00 PM', name: 'Sunset welcome drink by the pool' },
        { time: '7:30 PM', name: 'Dinner at a local warung' },
      ],
    },
    coreDays: [
      {
        title: 'Rice Terraces & Temples',
        activities: [
          { time: '8:00 AM', name: 'Sunrise walk through Tegallalang Rice Terraces' },
          { time: '11:00 AM', name: 'Visit Tirta Empul water temple' },
          { time: '3:00 PM', name: 'Balinese massage & spa afternoon' },
        ],
      },
      {
        title: 'Beach Day',
        activities: [
          { time: '9:00 AM', name: 'Beach club morning at Padang Padang' },
          { time: '1:00 PM', name: 'Fresh seafood lunch on the sand' },
          { time: '5:00 PM', name: 'Sunset at Uluwatu cliffs' },
        ],
      },
      {
        title: 'Waterfalls & Wellness',
        activities: [
          { time: '9:00 AM', name: 'Swim at Tegenungan Waterfall' },
          { time: '1:00 PM', name: 'Yoga & meditation session' },
          { time: '6:00 PM', name: 'Rooftop dinner overlooking the jungle' },
        ],
      },
      {
        title: 'Island Escape',
        activities: [
          { time: '8:00 AM', name: 'Boat to Nusa Penida' },
          { time: '11:00 AM', name: 'Snorkel at Crystal Bay' },
          { time: '4:00 PM', name: 'Relax at Kelingking Beach viewpoint' },
        ],
      },
      {
        title: 'Art & Craft Villages',
        activities: [
          { time: '9:00 AM', name: 'Explore the silver workshops of Celuk' },
          { time: '12:00 PM', name: 'Lunch at a jungle-view café' },
          { time: '4:00 PM', name: 'Sunset at Tanah Lot temple' },
        ],
      },
    ],
    departureDay: {
      title: 'Last Sunrise & Departure',
      activities: [
        { time: '7:00 AM', name: 'Quiet breakfast with a rice-field view' },
        { time: '10:00 AM', name: 'Last-minute souvenir shopping in Ubud' },
        { time: '2:00 PM', name: 'Transfer to airport' },
      ],
    },
  },
  {
    id: 'maldives-relaxing',
    destination: 'Maldives',
    country: 'Maldives',
    summary:
      'Overwater villas, glass-clear lagoons, and nothing on the agenda but the tide. The Maldives is the purest version of a do-nothing escape.',
    coverImageUrl: getCityImage('Malé', 'hero'),
    vibe: 'relaxing',
    tags: ['beach', 'overwater villa', 'honeymoon', 'diving'],
    goodFor: ['couple', 'solo', 'family'],
    tier: 'free',
    costPerPersonPerDay: 260,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Maldives',
    hotelName: 'Overwater villa resort',
    hotelCostPerNight: 420,
    flightEstimatePerPerson: 900,
    airline: 'Emirates',
    restaurants: {
      breakfast: [
      { name: 'Overwater villa breakfast', price: 0 },
      { name: 'Sunrise breakfast buffet', price: 20 },
      { name: 'Beachside breakfast', price: 15 },
      ],
      lunch: [
      { name: 'Sandbank picnic lunch', price: 40 },
      { name: 'Beach bar snacks', price: 15 },
      { name: 'Poolside grill', price: 25 },
      ],
      dinner: [
      { name: 'Ithaa Undersea Restaurant', price: 200 },
      { name: 'Teppanyaki dinner', price: 90 },
      { name: 'Fresh-catch beach BBQ', price: 60 },
      ],
    },
    attractionTickets: [
      { name: 'Guided snorkeling excursion', price: 50 },
      { name: 'Dolphin-watching cruise', price: 60 },
    ],
    arrivalDay: {
      title: 'Arrival & Overwater Welcome',
      activities: [
        { time: '1:00 PM', name: 'Seaplane transfer to your resort atoll' },
        { time: '4:00 PM', name: 'Villa check-in & lagoon plunge' },
        { time: '7:00 PM', name: 'Candlelit dinner over the water' },
      ],
    },
    coreDays: [
      {
        title: 'Reef & Relax',
        activities: [
          { time: '9:00 AM', name: 'Snorkel the house reef' },
          { time: '1:00 PM', name: 'Beachside lunch and hammock time' },
          { time: '4:00 PM', name: 'In-villa spa treatment' },
        ],
      },
      {
        title: 'Sandbank Picnic',
        activities: [
          { time: '10:00 AM', name: 'Boat out to a private sandbank' },
          { time: '12:30 PM', name: 'Champagne picnic lunch' },
          { time: '5:00 PM', name: 'Dolphin-watching cruise' },
        ],
      },
      {
        title: 'Slow Island Day',
        activities: [
          { time: '9:00 AM', name: 'Stand-up paddleboarding on the lagoon' },
          { time: '2:00 PM', name: 'Nap, read, repeat' },
          { time: '6:30 PM', name: 'Sunset fishing trip' },
        ],
      },
      {
        title: 'Underwater World',
        activities: [
          { time: '10:00 AM', name: 'Scuba dive with manta rays' },
          { time: '1:00 PM', name: 'Lunch on an overwater deck' },
          { time: '5:00 PM', name: 'Sunset couples massage' },
        ],
      },
    ],
    departureDay: {
      title: 'Farewell Lagoon',
      activities: [
        { time: '7:30 AM', name: 'Sunrise swim off your villa deck' },
        { time: '10:00 AM', name: 'Final brunch overlooking the water' },
        { time: '1:00 PM', name: 'Seaplane back to Malé' },
      ],
    },
  },
  {
    id: 'queenstown-adventurous',
    destination: 'Queenstown',
    country: 'New Zealand',
    summary:
      "The adventure capital of the world: bungee, jet boats, and alpine trails ringed by the Southern Alps. Queenstown doesn't do idle.",
    coverImageUrl: getCityImage('Queenstown', 'hero'),
    vibe: 'adventurous',
    tags: ['mountains', 'adrenaline', 'hiking', 'lakes'],
    goodFor: ['friends', 'solo', 'couple'],
    tier: 'free',
    costPerPersonPerDay: 150,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Queenstown',
    hotelName: 'Lakeside alpine lodge',
    hotelCostPerNight: 140,
    flightEstimatePerPerson: 850,
    airline: 'Air New Zealand',
    restaurants: {
      breakfast: [
      { name: 'Vudu Cafe', price: 12 },
      { name: 'Bespoke Kitchen', price: 10 },
      { name: 'Bathhouse Cafe', price: 14 },
      ],
      lunch: [
      { name: 'Fergburger', price: 15 },
      { name: 'Botswana Butchery lunch', price: 22 },
      { name: 'Devil Burger', price: 13 },
      ],
      dinner: [
      { name: 'Rata Restaurant', price: 60 },
      { name: 'Amisfield Winery dinner', price: 75 },
      { name: 'Skyline buffet dinner', price: 50 },
      ],
    },
    attractionTickets: [
      { name: 'Skyline Gondola', price: 45 },
      { name: 'Shotover Jet boat ride', price: 150 },
      { name: 'Milford Sound cruise', price: 90 },
    ],
    arrivalDay: {
      title: 'Touchdown in the Alps',
      activities: [
        { time: '3:00 PM', name: 'Land and check in lakeside' },
        { time: '5:00 PM', name: 'Gondola ride up Bob\'s Peak for sunset' },
        { time: '8:00 PM', name: 'Dinner in town' },
      ],
    },
    coreDays: [
      {
        title: 'Big Adrenaline Day',
        activities: [
          { time: '8:00 AM', name: 'Bungee jump at Kawarau Gorge' },
          { time: '12:00 PM', name: 'Shotover Jet boat ride' },
          { time: '4:00 PM', name: 'Paragliding over Lake Wakatipu' },
        ],
      },
      {
        title: 'Alpine Trails',
        activities: [
          { time: '7:00 AM', name: 'Hike the Ben Lomond Track' },
          { time: '1:00 PM', name: 'Picnic lunch at the summit' },
          { time: '6:00 PM', name: 'Hot pools soak' },
        ],
      },
      {
        title: 'Fiordland Expedition',
        activities: [
          { time: '6:30 AM', name: 'Scenic drive to Milford Sound' },
          { time: '11:00 AM', name: 'Cruise through the fiord' },
          { time: '7:00 PM', name: 'Return & celebratory dinner' },
        ],
      },
      {
        title: 'Mountain Biking',
        activities: [
          { time: '9:00 AM', name: 'Downhill mountain bike at Skyline' },
          { time: '1:00 PM', name: 'Wine tasting in Gibbston Valley' },
          { time: '6:00 PM', name: 'Lakeside barbecue' },
        ],
      },
      {
        title: 'Canyon & Caves',
        activities: [
          { time: '8:00 AM', name: 'Canyon swing at Shotover Canyon' },
          { time: '12:00 PM', name: 'Explore the Cardrona Valley' },
          { time: '5:00 PM', name: 'Stargazing session' },
        ],
      },
    ],
    departureDay: {
      title: 'One Last Peak',
      activities: [
        { time: '7:00 AM', name: 'Sunrise kayak on the lake' },
        { time: '11:00 AM', name: 'Coffee and pack up' },
        { time: '2:00 PM', name: 'Transfer to airport' },
      ],
    },
  },
  {
    id: 'patagonia-adventurous',
    destination: 'Patagonia',
    country: 'Chile',
    summary:
      'Windswept granite towers, glacier lakes, and trails that humble everyone who walks them. Patagonia rewards those chasing something wilder.',
    coverImageUrl: getCityImage('Patagonia', 'hero'),
    vibe: 'adventurous',
    tags: ['hiking', 'glaciers', 'wilderness', 'trekking'],
    goodFor: ['friends', 'solo', 'couple'],
    tier: 'yearly',
    costPerPersonPerDay: 130,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Patagonia',
    hotelName: 'Basecamp mountain lodge',
    hotelCostPerNight: 110,
    flightEstimatePerPerson: 780,
    airline: 'LATAM Airlines',
    restaurants: {
      breakfast: [
      { name: 'Refugio breakfast', price: 10 },
      { name: 'Hotel breakfast buffet', price: 12 },
      { name: 'Trailhead coffee & pastries', price: 6 },
      ],
      lunch: [
      { name: 'Trail packed lunch', price: 15 },
      { name: 'Puerto Natales café lunch', price: 14 },
      { name: 'Lakeside picnic', price: 12 },
      ],
      dinner: [
      { name: 'The Singular Restaurant', price: 50 },
      { name: 'Afonso del Mar grill', price: 40 },
      { name: 'Patagonian lamb asado', price: 45 },
      ],
    },
    attractionTickets: [
      { name: 'Torres del Paine park entrance', price: 30 },
      { name: 'Grey Glacier boat tour', price: 80 },
    ],
    arrivalDay: {
      title: 'Into the Wild',
      activities: [
        { time: '1:00 PM', name: 'Fly into Puerto Natales' },
        { time: '4:00 PM', name: 'Gear check and trail briefing' },
        { time: '7:00 PM', name: 'Hearty dinner before the trek' },
      ],
    },
    coreDays: [
      {
        title: 'Towers Trek',
        activities: [
          { time: '6:00 AM', name: 'Early start for the Base Torres hike' },
          { time: '1:00 PM', name: 'Lunch with the towers in view' },
          { time: '7:00 PM', name: 'Return to camp, sore and thrilled' },
        ],
      },
      {
        title: 'Glacier Day',
        activities: [
          { time: '8:00 AM', name: 'Boat to Grey Glacier' },
          { time: '11:00 AM', name: 'Ice trek with crampons' },
          { time: '5:00 PM', name: 'Whisky on the rocks, literally' },
        ],
      },
      {
        title: 'French Valley',
        activities: [
          { time: '7:00 AM', name: 'Hike into the French Valley' },
          { time: '1:00 PM', name: 'Lookout over hanging glaciers' },
          { time: '6:30 PM', name: 'Campfire stories' },
        ],
      },
      {
        title: 'Lake Grey Kayaking',
        activities: [
          { time: '8:00 AM', name: 'Kayak among floating icebergs' },
          { time: '1:00 PM', name: 'Picnic on the lakeshore' },
          { time: '6:00 PM', name: 'Stargazing under clear Patagonian skies' },
        ],
      },
    ],
    departureDay: {
      title: 'Last Views & Departure',
      activities: [
        { time: '7:00 AM', name: 'Final lookout at Lake Pehoé' },
        { time: '11:00 AM', name: 'Drive back to Puerto Natales' },
        { time: '3:00 PM', name: 'Flight onward' },
      ],
    },
  },
  {
    id: 'kyoto-cultural',
    destination: 'Kyoto',
    country: 'Japan',
    summary:
      'A thousand years of temples, gardens, and quiet ritual. Kyoto moves at the pace of tea steeping: deliberate, layered, unforgettable.',
    coverImageUrl: getCityImage('Kyoto', 'hero'),
    vibe: 'cultural',
    tags: ['temples', 'history', 'food', 'gardens'],
    goodFor: ['solo', 'couple', 'family', 'friends'],
    tier: 'free',
    costPerPersonPerDay: 120,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Kyoto',
    hotelName: 'Traditional ryokan',
    hotelCostPerNight: 130,
    flightEstimatePerPerson: 720,
    airline: 'ANA (All Nippon Airways)',
    restaurants: {
      breakfast: [
      { name: 'Ryokan kaiseki breakfast', price: 15 },
      { name: 'Corner café breakfast', price: 6 },
      { name: 'Nishiki Market breakfast bites', price: 8 },
      ],
      lunch: [
      { name: 'Nishiki Market food stalls', price: 12 },
      { name: 'Ganko Sushi', price: 18 },
      { name: 'Ramen alley', price: 10 },
      ],
      dinner: [
      { name: 'Gion kaiseki dinner', price: 80 },
      { name: 'Pontocho alley izakaya', price: 35 },
      { name: 'Kaiseki at a machiya', price: 60 },
      ],
    },
    attractionTickets: [
      { name: 'Kinkaku-ji entrance', price: 5 },
      { name: 'Nijo Castle entrance', price: 8 },
    ],
    arrivalDay: {
      title: 'Arrival in the Old Capital',
      activities: [
        { time: '2:00 PM', name: 'Arrive and check into a ryokan' },
        { time: '5:00 PM', name: 'Evening stroll through Gion' },
        { time: '7:30 PM', name: 'Kaiseki dinner' },
      ],
    },
    coreDays: [
      {
        title: 'Temples & Torii',
        activities: [
          { time: '7:00 AM', name: 'Early visit to Fushimi Inari before crowds' },
          { time: '12:00 PM', name: 'Lunch of Kyoto-style ramen' },
          { time: '3:00 PM', name: 'Kinkaku-ji, the Golden Pavilion' },
        ],
      },
      {
        title: 'Bamboo & Craft',
        activities: [
          { time: '8:00 AM', name: 'Walk the Arashiyama Bamboo Grove' },
          { time: '11:00 AM', name: 'Traditional tea ceremony' },
          { time: '4:00 PM', name: 'Pottery workshop in Gojozaka' },
        ],
      },
      {
        title: 'Markets & Gardens',
        activities: [
          { time: '9:00 AM', name: 'Nishiki Market food crawl' },
          { time: '1:00 PM', name: 'Zen garden at Ryoan-ji' },
          { time: '6:00 PM', name: 'Pontocho alley dinner' },
        ],
      },
      {
        title: 'Day Trip to Nara',
        activities: [
          { time: '8:00 AM', name: 'Train to Nara' },
          { time: '10:00 AM', name: 'Feed the deer at Nara Park' },
          { time: '1:00 PM', name: "Visit Todai-ji's giant Buddha" },
        ],
      },
    ],
    departureDay: {
      title: 'Final Temple & Departure',
      activities: [
        { time: '7:30 AM', name: 'Quiet morning at Kiyomizu-dera' },
        { time: '11:00 AM', name: 'Last souvenir shopping' },
        { time: '2:00 PM', name: 'Shinkansen or airport transfer' },
      ],
    },
  },
  {
    id: 'marrakech-cultural',
    destination: 'Marrakech',
    country: 'Morocco',
    summary:
      'Maze-like souks, painted riads, and the call to prayer echoing over the Atlas Mountains. Marrakech is sensory in every direction.',
    coverImageUrl: getCityImage('Marrakech', 'hero'),
    vibe: 'cultural',
    tags: ['markets', 'architecture', 'desert', 'food'],
    goodFor: ['friends', 'couple', 'family'],
    tier: 'monthly',
    costPerPersonPerDay: 85,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Marrakech',
    hotelName: 'Riad in the medina',
    hotelCostPerNight: 60,
    flightEstimatePerPerson: 550,
    airline: 'Royal Air Maroc',
    restaurants: {
      breakfast: [
      { name: 'Riad rooftop breakfast', price: 8 },
      { name: 'Café Clock', price: 6 },
      { name: 'Street breakfast (msemen & tea)', price: 3 },
      ],
      lunch: [
      { name: 'Nomad Restaurant', price: 18 },
      { name: 'Café des Épices', price: 10 },
      { name: 'Tagine at a souk stall', price: 8 },
      ],
      dinner: [
      { name: 'Le Jardin', price: 30 },
      { name: 'Dar Yacout', price: 55 },
      { name: 'Jemaa el-Fnaa food stalls', price: 12 },
      ],
    },
    attractionTickets: [
      { name: 'Bahia Palace entrance', price: 7 },
      { name: 'Majorelle Garden entrance', price: 10 },
      { name: 'Agafay desert camel trek', price: 40 },
    ],
    arrivalDay: {
      title: 'Into the Medina',
      activities: [
        { time: '2:00 PM', name: 'Check into a riad in the medina' },
        { time: '5:00 PM', name: 'Rooftop mint tea at sunset' },
        { time: '8:00 PM', name: 'Dinner in Jemaa el-Fnaa' },
      ],
    },
    coreDays: [
      {
        title: 'Souks & Palaces',
        activities: [
          { time: '9:00 AM', name: 'Explore the souks for spices and textiles' },
          { time: '1:00 PM', name: 'Visit Bahia Palace' },
          { time: '4:00 PM', name: 'Traditional hammam experience' },
        ],
      },
      {
        title: 'Gardens & Art',
        activities: [
          { time: '9:00 AM', name: 'Majorelle Garden and YSL museum' },
          { time: '1:00 PM', name: 'Lunch at a garden café' },
          { time: '5:00 PM', name: 'Sunset from a rooftop bar' },
        ],
      },
      {
        title: 'Desert Day Trip',
        activities: [
          { time: '7:00 AM', name: 'Drive into the Agafay Desert' },
          { time: '12:00 PM', name: 'Camel trek and lunch under a tent' },
          { time: '6:00 PM', name: 'Return for a quiet evening' },
        ],
      },
      {
        title: 'Atlas Mountains Day Trip',
        activities: [
          { time: '8:00 AM', name: 'Drive to the Atlas Mountains' },
          { time: '11:00 AM', name: 'Visit a Berber village' },
          { time: '2:00 PM', name: 'Lunch with mountain views' },
        ],
      },
    ],
    departureDay: {
      title: 'Last Tea & Departure',
      activities: [
        { time: '8:00 AM', name: 'Breakfast on the riad rooftop' },
        { time: '11:00 AM', name: 'Final walk through the medina' },
        { time: '2:00 PM', name: 'Transfer to airport' },
      ],
    },
  },
  {
    id: 'santorini-romantic',
    destination: 'Santorini',
    country: 'Greece',
    summary:
      'Whitewashed cliffs, blue domes, and sunsets that stop conversations. Santorini is built for two people and nowhere to be.',
    coverImageUrl: getCityImage('Santorini', 'hero'),
    vibe: 'romantic',
    tags: ['sunset', 'wine', 'cliffside', 'honeymoon'],
    goodFor: ['couple', 'solo'],
    tier: 'free',
    costPerPersonPerDay: 170,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Santorini',
    hotelName: 'Caldera-view suite',
    hotelCostPerNight: 210,
    flightEstimatePerPerson: 600,
    airline: 'Aegean Airlines',
    restaurants: {
      breakfast: [
      { name: 'Caldera-view breakfast', price: 12 },
      { name: 'Local bakery breakfast', price: 6 },
      { name: 'Hotel breakfast buffet', price: 15 },
      ],
      lunch: [
      { name: 'Ammoudi Bay taverna', price: 25 },
      { name: 'Cliffside café lunch', price: 18 },
      { name: 'Oia village lunch', price: 20 },
      ],
      dinner: [
      { name: 'Selene Restaurant', price: 70 },
      { name: 'Metaxi Mas taverna', price: 40 },
      { name: 'Sunset dinner in Oia', price: 60 },
      ],
    },
    attractionTickets: [
      { name: 'Akrotiri archaeological site', price: 12 },
      { name: 'Private catamaran cruise', price: 95 },
    ],
    arrivalDay: {
      title: 'Arrival on the Caldera',
      activities: [
        { time: '3:00 PM', name: 'Check into a caldera-view suite in Oia' },
        { time: '6:30 PM', name: 'Watch the famous Oia sunset' },
        { time: '8:30 PM', name: 'Candlelit dinner over the cliffs' },
      ],
    },
    coreDays: [
      {
        title: 'Villages & Views',
        activities: [
          { time: '10:00 AM', name: 'Wander the streets of Fira' },
          { time: '1:00 PM', name: 'Lunch overlooking the volcano' },
          { time: '5:00 PM', name: 'Wine tasting at a cliffside vineyard' },
        ],
      },
      {
        title: 'Sail the Caldera',
        activities: [
          { time: '10:00 AM', name: 'Private catamaran cruise' },
          { time: '1:00 PM', name: 'Swim at the volcanic hot springs' },
          { time: '6:00 PM', name: 'Sunset dinner onboard' },
        ],
      },
      {
        title: 'Slow Romance',
        activities: [
          { time: '10:00 AM', name: 'Couples spa morning' },
          { time: '2:00 PM', name: 'Explore Red Beach' },
          { time: '7:00 PM', name: 'Rooftop dinner in Imerovigli' },
        ],
      },
      {
        title: 'Ancient Thera',
        activities: [
          { time: '9:00 AM', name: 'Explore the ruins of Akrotiri' },
          { time: '12:00 PM', name: 'Lunch in Pyrgos village' },
          { time: '6:00 PM', name: 'Photography at Skaros Rock' },
        ],
      },
    ],
    departureDay: {
      title: 'One More Sunrise',
      activities: [
        { time: '6:30 AM', name: 'Sunrise from your balcony' },
        { time: '10:00 AM', name: 'Coffee in the village' },
        { time: '1:00 PM', name: 'Transfer to the airport' },
      ],
    },
  },
  {
    id: 'paris-romantic',
    destination: 'Paris',
    country: 'France',
    summary:
      'The Seine at dusk, candlelit bistros, and art around every corner. Paris is the classic romantic escape, and it still delivers.',
    coverImageUrl: getCityImage('Paris', 'hero'),
    vibe: 'romantic',
    tags: ['city', 'art', 'food', 'wine'],
    goodFor: ['couple', 'friends', 'solo'],
    tier: 'free',
    costPerPersonPerDay: 140,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Paris',
    hotelName: 'Boutique hotel near the Seine',
    hotelCostPerNight: 180,
    flightEstimatePerPerson: 500,
    airline: 'Air France',
    restaurants: {
      breakfast: [
      { name: 'Corner boulangerie', price: 6 },
      { name: 'Café de Flore breakfast', price: 12 },
      { name: 'Hotel breakfast', price: 10 },
      ],
      lunch: [
      { name: 'Le Marais bistro', price: 22 },
      { name: 'Latin Quarter crêperie', price: 14 },
      { name: 'Marché lunch', price: 10 },
      ],
      dinner: [
      { name: 'Seine-view dinner cruise', price: 55 },
      { name: 'Bistro Paul Bert', price: 45 },
      { name: 'Le Comptoir du Relais', price: 50 },
      ],
    },
    attractionTickets: [
      { name: 'Eiffel Tower summit access', price: 28 },
      { name: 'Louvre Museum entrance', price: 18 },
      { name: 'Palace of Versailles entrance', price: 20 },
    ],
    arrivalDay: {
      title: 'Bonjour, Paris',
      activities: [
        { time: '2:00 PM', name: 'Check into a boutique hotel near the Seine' },
        { time: '5:00 PM', name: 'Evening walk along the river' },
        { time: '8:00 PM', name: 'Dinner at a candlelit bistro' },
      ],
    },
    coreDays: [
      {
        title: 'Icons & Views',
        activities: [
          { time: '9:00 AM', name: 'Climb the Eiffel Tower at sunrise light' },
          { time: '1:00 PM', name: 'Lunch near Trocadéro' },
          { time: '4:00 PM', name: 'Louvre highlights tour' },
        ],
      },
      {
        title: 'Montmartre & Wine',
        activities: [
          { time: '10:00 AM', name: 'Wander Montmartre and Sacré-Cœur' },
          { time: '1:00 PM', name: 'Café lunch on a cobblestone terrace' },
          { time: '6:00 PM', name: 'Wine bar crawl in the Marais' },
        ],
      },
      {
        title: 'Seine Romance',
        activities: [
          { time: '11:00 AM', name: 'Browse the Left Bank bookstalls' },
          { time: '2:00 PM', name: 'Picnic in the Luxembourg Gardens' },
          { time: '8:00 PM', name: 'Sunset river cruise' },
        ],
      },
      {
        title: 'Palace Day Trip',
        activities: [
          { time: '9:00 AM', name: 'Train to the Palace of Versailles' },
          { time: '11:00 AM', name: 'Tour the Hall of Mirrors' },
          { time: '2:00 PM', name: 'Stroll the palace gardens' },
        ],
      },
    ],
    departureDay: {
      title: 'Last Croissant & Departure',
      activities: [
        { time: '8:00 AM', name: 'Croissants at a corner café' },
        { time: '11:00 AM', name: 'Last stroll through the Marais' },
        { time: '2:00 PM', name: 'Transfer to the airport' },
      ],
    },
  },
];
