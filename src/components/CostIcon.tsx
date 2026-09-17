type CostIconType = 'hotel' | 'flight' | 'food' | 'ticket';

const PATHS: Record<CostIconType, string[]> = {
  hotel: [
    'M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8',
    'M2 20h20',
    'M6 10V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v4',
  ],
  flight: ['M22 2 11 13', 'M22 2 15 22l-4-9-9-4 20-7z'],
  food: [
    'M3 2v7c0 1.1.9 2 2 2a2 2 0 0 0 2-2V2',
    'M7 2v20',
    'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7',
  ],
  ticket: [
    'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
    'M13 5v2',
    'M13 11v2',
    'M13 17v2',
  ],
};

export default function CostIcon({ type, className = '' }: { type: CostIconType; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[type].map((d) => (
        <path key={d} d={d} />
      ))}
      {type === 'hotel' && <circle cx="7" cy="14" r="1" fill="currentColor" stroke="none" />}
    </svg>
  );
}
