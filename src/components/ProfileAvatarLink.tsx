import { Link } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';

export default function ProfileAvatarLink({ className = '' }: { className?: string }) {
  const { subscription } = useSubscription();
  const initials = subscription.displayName.trim().slice(0, 2).toUpperCase() || 'TR';
  const isPaid = subscription.currentTier !== 'free';

  return (
    <Link
      to="/profile"
      aria-label="Your profile"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white transition-transform hover:scale-105 sm:h-10 sm:w-10 sm:text-sm ${
        isPaid ? 'bg-ocean-mid ring-2 ring-gold-accent' : 'bg-ocean-mid'
      } ${className}`}
    >
      {initials}
    </Link>
  );
}
