import { Link } from 'react-router-dom';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`font-display text-2xl font-extrabold tracking-tight ${className}`}
    >
      <span className="text-sky-blue">Trip</span>
      <span className="text-gold-accent">Wise</span>
    </Link>
  );
}
