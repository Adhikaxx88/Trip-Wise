import { Link } from 'react-router-dom';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight ${className}`}
    >
      <img src="/images/brand/logo.png" alt="TripWise" className="h-8 w-8 shrink-0 object-contain" />
      <span>
        <span className="text-sky-blue">Trip</span>
        <span className="text-gold-accent">Wise</span>
      </span>
    </Link>
  );
}
