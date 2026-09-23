import Button from './Button';
import Modal from './Modal';
import { useSubscription } from '../context/SubscriptionContext';
import { formatFullDate } from '../logic/dates';

interface CancelModalProps {
  onClose: () => void;
}

export default function CancelModal({ onClose }: CancelModalProps) {
  const { subscription, cancelSubscription } = useSubscription();

  const handleCancel = () => {
    cancelSubscription();
    onClose();
  };

  return (
    <Modal onClose={onClose} labelledBy="cancel-title">
      <h2 id="cancel-title" className="font-display text-2xl text-ink">
        Cancel your subscription?
      </h2>
      <p className="mt-3 text-sm text-ink/70">
        Your benefits stay active until your current period ends on{' '}
        <span className="font-semibold text-ink">{formatFullDate(subscription.renewsOn)}</span>. You
        won't be charged again after that, and you can resubscribe anytime.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="ghost" onClick={onClose}>
          Keep my plan
        </Button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 rounded-full bg-red-50 px-6 py-3 font-semibold text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
        >
          Cancel subscription
        </button>
      </div>
    </Modal>
  );
}
