import { Link } from 'react-router-dom';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <img src="/images/brand/logo-full.png" alt="TripWise — your journey on one click" className="h-10 w-auto object-contain" />
    </Link>
  );
}
