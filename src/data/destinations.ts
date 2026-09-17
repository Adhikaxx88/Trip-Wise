import type { GroupType, ItineraryActivity, Vibe } from '../types';

export interface DayTemplate {
  title: string;
  activities: ItineraryActivity[];
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
  costPerPersonPerDay: number;
  bookingUrl: string;
  arrivalDay: DayTemplate;
  coreDays: DayTemplate[];
  departureDay: DayTemplate;
}

export const destinations: DestinationTemplate[] = [
  {
    id: 'bali-relaxing',
    destination: 'Bali',
    country: 'Indonesia',
    summary:
      'Sink into slow mornings, cliffside infinity pools, and warm turquoise water. Bali is built for travelers who want to do absolutely nothing, beautifully.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80',
    vibe: 'relaxing',
    tags: ['beach', 'spa', 'slow travel', 'nature'],
    goodFor: ['solo', 'couple', 'family', 'friends'],
    costPerPersonPerDay: 95,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Bali',
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
    coverImageUrl:
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1600&q=80',
    vibe: 'relaxing',
    tags: ['beach', 'overwater villa', 'honeymoon', 'diving'],
    goodFor: ['couple', 'solo', 'family'],
    costPerPersonPerDay: 260,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Maldives',
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
    coverImageUrl:
      'https://images.unsplash.com/photo-1589871173980-5c353e64d550?auto=format&fit=crop&w=1600&q=80',
    vibe: 'adventurous',
    tags: ['mountains', 'adrenaline', 'hiking', 'lakes'],
    goodFor: ['friends', 'solo', 'couple'],
    costPerPersonPerDay: 150,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Queenstown',
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
    coverImageUrl:
      'https://images.unsplash.com/photo-1520681279154-51b3fb4d7bc5?auto=format&fit=crop&w=1600&q=80',
    vibe: 'adventurous',
    tags: ['hiking', 'glaciers', 'wilderness', 'trekking'],
    goodFor: ['friends', 'solo', 'couple'],
    costPerPersonPerDay: 130,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Patagonia',
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
    coverImageUrl:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
    vibe: 'cultural',
    tags: ['temples', 'history', 'food', 'gardens'],
    goodFor: ['solo', 'couple', 'family', 'friends'],
    costPerPersonPerDay: 120,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Kyoto',
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
    coverImageUrl:
      'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1600&q=80',
    vibe: 'cultural',
    tags: ['markets', 'architecture', 'desert', 'food'],
    goodFor: ['friends', 'couple', 'family'],
    costPerPersonPerDay: 85,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Marrakech',
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
    coverImageUrl:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=80',
    vibe: 'romantic',
    tags: ['sunset', 'wine', 'cliffside', 'honeymoon'],
    goodFor: ['couple', 'solo'],
    costPerPersonPerDay: 170,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Santorini',
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
    coverImageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80',
    vibe: 'romantic',
    tags: ['city', 'art', 'food', 'wine'],
    goodFor: ['couple', 'friends', 'solo'],
    costPerPersonPerDay: 140,
    bookingUrl: 'https://www.booking.com/searchresults.html?ss=Paris',
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
