export interface FaqEntry {
  keywords: string[];
  answer: string;
}

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    keywords: ['pay', 'payment', 'book', 'booking', 'checkout', 'cost of the app'],
    answer: "Booking just redirects you to an external travel site. TripWise doesn't process payments or take a cut.",
  },
  {
    keywords: ['change my answer', 'go back', 'redo', 'restart', 'edit'],
    answer: "Yep, you can go back a step here anytime, and you can edit the whole itinerary again after it's generated.",
  },
  {
    keywords: ['how do you', 'how does', 'pick my destination', 'choose my destination', 'algorithm', 'match'],
    answer: 'I match your vibe, budget, duration, and group size against a curated set of destinations to build your itinerary.',
  },
  {
    keywords: ['pet', 'dog', 'cat'],
    answer: "Furry travel companions aren't part of the itinerary yet, but you can always add a note once you're editing your trip.",
  },
  {
    keywords: ['skip'],
    answer: 'Every answer helps me match you better, but you can always pick the closest option and adjust things later in Edit.',
  },
];

export function getFaqAnswer(text: string): string | null {
  const lower = text.toLowerCase();
  const match = FAQ_ENTRIES.find((entry) => entry.keywords.some((k) => lower.includes(k)));
  return match?.answer ?? null;
}

export interface SuggestedQuestion {
  question: string;
  answer: string;
}

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    question: 'Can I change my answers later?',
    answer: "Yep, you can go back a step here anytime, and you can edit the whole itinerary again after it's generated.",
  },
  {
    question: 'Do I pay to book through TripWise?',
    answer: "Nope, booking just redirects you to an external travel site. TripWise doesn't process payments.",
  },
  {
    question: 'How do you pick my destination?',
    answer: 'I match your vibe, budget, duration, and group size against a curated set of destinations to build your itinerary.',
  },
];
