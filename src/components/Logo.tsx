import { Link } from 'react-router-dom';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`wordmark text-2xl tracking-tight ${className}`}>
      TripWise
    </Link>
  );
}
