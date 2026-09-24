export type Region = 'Asia' | 'Middle East' | 'Europe' | 'Americas' | 'Africa' | 'Pacific';

export interface CityOption {
  name: string;
  imageUrl: string;
  mapsLink: string;
}

export interface CountryOption {
  name: string;
  region: Region;
  cities: CityOption[];
}

function unsplash(keywords: string): string {
  return `https://source.unsplash.com/800x500/?${encodeURIComponent(keywords).replace(/%20/g, '+')}`;
}

function mapsLink(place: string): string {
  return `https://maps.google.com/?q=${encodeURIComponent(place)}`;
}

function city(name: string, country: string, keywords: string): CityOption {
  return {
    name,
    imageUrl: unsplash(keywords),
    mapsLink: mapsLink(`${name} ${country}`),
  };
}

const COUNTRY_CITY_SEED: Record<string, [Region, string[]]> = {
  Japan: ['Asia', ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima', 'Sapporo', 'Nara']],
  'South Korea': ['Asia', ['Seoul', 'Busan', 'Jeju Island', 'Incheon']],
  Thailand: ['Asia', ['Bangkok', 'Chiang Mai', 'Phuket', 'Koh Samui', 'Pai', 'Ayutthaya']],
  Vietnam: ['Asia', ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hoi An', 'Ha Long Bay']],
  Singapore: ['Asia', ['Singapore City', 'Sentosa Island']],
  Malaysia: ['Asia', ['Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca']],
  Philippines: ['Asia', ['Manila', 'Cebu', 'Palawan', 'Boracay']],
  Cambodia: ['Asia', ['Phnom Penh', 'Siem Reap']],
  Myanmar: ['Asia', ['Yangon', 'Bagan', 'Mandalay']],
  India: ['Asia', ['New Delhi', 'Mumbai', 'Jaipur', 'Agra', 'Goa']],
  Nepal: ['Asia', ['Kathmandu', 'Pokhara']],
  'Sri Lanka': ['Asia', ['Colombo', 'Kandy', 'Galle']],
  Maldives: ['Asia', ['Malé', 'Maafushi']],
  Taiwan: ['Asia', ['Taipei', 'Kaohsiung', 'Taichung']],
  'Hong Kong': ['Asia', ['Hong Kong Island', 'Kowloon', 'Lantau Island']],
  China: ['Asia', ['Beijing', 'Shanghai', 'Xi’an', 'Chengdu', 'Guilin']],
  Macau: ['Asia', ['Macau Peninsula', 'Taipa']],
  Mongolia: ['Asia', ['Ulaanbaatar', 'Gobi Desert']],
  Uzbekistan: ['Asia', ['Tashkent', 'Samarkand', 'Bukhara']],
  Kazakhstan: ['Asia', ['Almaty', 'Astana']],
  Georgia: ['Asia', ['Tbilisi', 'Batumi']],
  Armenia: ['Asia', ['Yerevan']],
  Azerbaijan: ['Asia', ['Baku']],

  UAE: ['Middle East', ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ras Al Khaimah']],
  'Saudi Arabia': ['Middle East', ['Riyadh', 'Jeddah', 'AlUla']],
  Qatar: ['Middle East', ['Doha']],
  Bahrain: ['Middle East', ['Manama']],
  Kuwait: ['Middle East', ['Kuwait City']],
  Oman: ['Middle East', ['Muscat', 'Salalah']],
  Jordan: ['Middle East', ['Amman', 'Petra', 'Aqaba']],
  Israel: ['Middle East', ['Tel Aviv', 'Jerusalem']],
  Lebanon: ['Middle East', ['Beirut']],
  Turkey: ['Middle East', ['Istanbul', 'Cappadocia', 'Antalya']],
  Iran: ['Middle East', ['Tehran', 'Isfahan', 'Shiraz']],

  France: ['Europe', ['Paris', 'Nice', 'Lyon', 'Bordeaux', 'Marseille', 'Strasbourg']],
  Italy: ['Europe', ['Rome', 'Florence', 'Venice', 'Milan', 'Naples', 'Sicily']],
  Spain: ['Europe', ['Madrid', 'Barcelona', 'Seville', 'Valencia']],
  Greece: ['Europe', ['Athens', 'Santorini', 'Mykonos', 'Crete']],
  Portugal: ['Europe', ['Lisbon', 'Porto', 'Algarve']],
  Netherlands: ['Europe', ['Amsterdam', 'Rotterdam', 'Utrecht']],
  UK: ['Europe', ['London', 'Edinburgh', 'Manchester', 'Oxford']],
  Germany: ['Europe', ['Berlin', 'Munich', 'Hamburg', 'Cologne']],
  Switzerland: ['Europe', ['Zurich', 'Geneva', 'Lucerne', 'Interlaken']],
  Austria: ['Europe', ['Vienna', 'Salzburg', 'Innsbruck']],
  Belgium: ['Europe', ['Brussels', 'Bruges', 'Antwerp']],
  Sweden: ['Europe', ['Stockholm', 'Gothenburg']],
  Norway: ['Europe', ['Oslo', 'Bergen', 'Tromsø']],
  Denmark: ['Europe', ['Copenhagen', 'Aarhus']],
  Finland: ['Europe', ['Helsinki', 'Rovaniemi']],
  Iceland: ['Europe', ['Reykjavik', 'Vik']],
  Ireland: ['Europe', ['Dublin', 'Galway']],
  Croatia: ['Europe', ['Dubrovnik', 'Split', 'Zagreb']],
  'Czech Republic': ['Europe', ['Prague', 'Cesky Krumlov']],
  Hungary: ['Europe', ['Budapest']],
  Poland: ['Europe', ['Warsaw', 'Krakow']],
  Romania: ['Europe', ['Bucharest', 'Brasov']],
  Bulgaria: ['Europe', ['Sofia', 'Plovdiv']],
  Serbia: ['Europe', ['Belgrade']],
  Albania: ['Europe', ['Tirana']],
  Montenegro: ['Europe', ['Kotor', 'Budva']],
  Bosnia: ['Europe', ['Sarajevo', 'Mostar']],
  Slovenia: ['Europe', ['Ljubljana', 'Lake Bled']],
  Slovakia: ['Europe', ['Bratislava']],
  Estonia: ['Europe', ['Tallinn']],
  Latvia: ['Europe', ['Riga']],
  Lithuania: ['Europe', ['Vilnius']],
  Malta: ['Europe', ['Valletta']],
  Cyprus: ['Europe', ['Nicosia', 'Limassol']],
  Luxembourg: ['Europe', ['Luxembourg City']],
  Monaco: ['Europe', ['Monte Carlo']],
  Andorra: ['Europe', ['Andorra la Vella']],

  USA: ['Americas', ['New York', 'Los Angeles', 'Miami', 'Las Vegas', 'Hawaii', 'Chicago', 'San Francisco']],
  Canada: ['Americas', ['Toronto', 'Vancouver', 'Montreal', 'Banff']],
  Mexico: ['Americas', ['Mexico City', 'Cancun', 'Tulum', 'Oaxaca']],
  Cuba: ['Americas', ['Havana', 'Varadero']],
  Jamaica: ['Americas', ['Kingston', 'Montego Bay']],
  'Costa Rica': ['Americas', ['San José', 'Tamarindo', 'Monteverde']],
  Panama: ['Americas', ['Panama City', 'Bocas del Toro']],
  Colombia: ['Americas', ['Bogotá', 'Cartagena', 'Medellín']],
  Venezuela: ['Americas', ['Caracas']],
  Ecuador: ['Americas', ['Quito', 'Galápagos Islands']],
  Peru: ['Americas', ['Lima', 'Cusco', 'Machu Picchu']],
  Brazil: ['Americas', ['Rio de Janeiro', 'São Paulo', 'Salvador']],
  Bolivia: ['Americas', ['La Paz', 'Uyuni']],
  Chile: ['Americas', ['Santiago', 'Patagonia', 'Valparaíso']],
  Argentina: ['Americas', ['Buenos Aires', 'Bariloche', 'Mendoza']],
  Uruguay: ['Americas', ['Montevideo', 'Punta del Este']],
  Paraguay: ['Americas', ['Asunción']],

  'South Africa': ['Africa', ['Cape Town', 'Johannesburg', 'Kruger National Park']],
  Morocco: ['Africa', ['Marrakech', 'Fez', 'Casablanca', 'Chefchaouen']],
  Egypt: ['Africa', ['Cairo', 'Luxor', 'Sharm El Sheikh']],
  Kenya: ['Africa', ['Nairobi', 'Maasai Mara']],
  Tanzania: ['Africa', ['Zanzibar', 'Serengeti', 'Arusha']],
  Ethiopia: ['Africa', ['Addis Ababa', 'Lalibela']],
  Ghana: ['Africa', ['Accra', 'Kumasi']],
  Senegal: ['Africa', ['Dakar']],
  Tunisia: ['Africa', ['Tunis', 'Sousse']],
  Mauritius: ['Africa', ['Port Louis', 'Grand Baie']],
  Seychelles: ['Africa', ['Mahé', 'Praslin']],
  Madagascar: ['Africa', ['Antananarivo']],
  Namibia: ['Africa', ['Windhoek', 'Sossusvlei']],
  Botswana: ['Africa', ['Gaborone', 'Okavango Delta']],
  Rwanda: ['Africa', ['Kigali']],
  Uganda: ['Africa', ['Kampala']],
  Zimbabwe: ['Africa', ['Victoria Falls', 'Harare']],

  Australia: ['Pacific', ['Sydney', 'Melbourne', 'Brisbane', 'Cairns', 'Perth']],
  'New Zealand': ['Pacific', ['Auckland', 'Queenstown', 'Wellington']],
  Fiji: ['Pacific', ['Nadi', 'Denarau Island']],
  Tahiti: ['Pacific', ['Papeete']],
  'Bora Bora': ['Pacific', ['Bora Bora']],
  'Papua New Guinea': ['Pacific', ['Port Moresby']],
  Vanuatu: ['Pacific', ['Port Vila']],
  Samoa: ['Pacific', ['Apia']],
  Tonga: ['Pacific', ["Nuku'alofa"]],
};

export const COUNTRIES: CountryOption[] = Object.entries(COUNTRY_CITY_SEED).map(([country, [region, cities]]) => ({
  name: country,
  region,
  cities: cities.map((c) => city(c, country, `${c} ${country} travel`)),
}));

export const REGION_ORDER: Region[] = ['Asia', 'Middle East', 'Europe', 'Americas', 'Africa', 'Pacific'];

export const MAX_COUNTRIES = 3;
export const MAX_CITIES = 4;

export const INDONESIA_CITIES: CityOption[] = [
  city('Jakarta', 'Indonesia', 'Jakarta Indonesia skyline'),
  city('Bali', 'Indonesia', 'Bali Indonesia beach temple'),
  city('Yogyakarta', 'Indonesia', 'Yogyakarta Borobudur temple'),
  city('Bandung', 'Indonesia', 'Bandung Indonesia hills'),
  city('Lombok', 'Indonesia', 'Lombok Indonesia beach'),
  city('Surabaya', 'Indonesia', 'Surabaya Indonesia city'),
  city('Labuan Bajo', 'Indonesia', 'Labuan Bajo Komodo Indonesia'),
  city('Malang', 'Indonesia', 'Malang Bromo Indonesia'),
];

export function findCountry(name: string): CountryOption | undefined {
  return COUNTRIES.find((c) => c.name === name);
}

export function findCity(country: string, cityName: string): CityOption | undefined {
  if (country === 'Indonesia') {
    return INDONESIA_CITIES.find((c) => c.name === cityName);
  }
  return findCountry(country)?.cities.find((c) => c.name === cityName);
}
