import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import { PAY_AS_YOU_GO_BENEFITS, PAY_AS_YOU_GO_BUNDLE_SIZE, PAY_AS_YOU_GO_PRICE } from '../data/subscriptionTiers';
import { useSubscription } from '../context/SubscriptionContext';

interface BuyMatchesModalProps {
  onClose: () => void;
}

export default function BuyMatchesModal({ onClose }: BuyMatchesModalProps) {
  const { isProcessing, buyPayAsYouGoBundle, subscription } = useSubscription();
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');
  const [newBalance, setNewBalance] = useState<number | null>(null);

  const handleConfirm = async () => {
    await buyPayAsYouGoBundle();
    setNewBalance(subscription.payAsYouGoMatchesRemaining + PAY_AS_YOU_GO_BUNDLE_SIZE);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <Modal onClose={onClose} labelledBy="buy-matches-success-title">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-accent/20 text-gold-accent-deep">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 id="buy-matches-success-title" className="font-display mt-4 text-2xl text-ink">
            {PAY_AS_YOU_GO_BUNDLE_SIZE} matches added!
          </h2>
          <p className="mt-2 text-sm text-ink/60">
            You now have {newBalance} pay-as-you-go match{newBalance === 1 ? '' : 'es'} available.
          </p>
          <Button variant="primary" className="mt-6 w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} labelledBy="buy-matches-confirm-title">
      <h2 id="buy-matches-confirm-title" className="font-display text-2xl text-ink">
        Buy {PAY_AS_YOU_GO_BUNDLE_SIZE} matches
      </h2>
      <p className="mt-2 text-sm text-ink/60">
        ${PAY_AS_YOU_GO_PRICE.amount} one-time payment — no subscription required
      </p>

      <ul className="mt-4 space-y-2">
        {PAY_AS_YOU_GO_BENEFITS.map((b) => (
          <li key={b.id} className="flex items-start gap-2 text-sm text-ink">
            <span className="mt-0.5 text-ocean-mid">✓</span>
            <span>{b.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-ink/40">
        This is a demo — no real payment is processed, this only updates your balance on this device.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleConfirm} disabled={isProcessing}>
          {isProcessing ? 'Processing…' : `Buy ${PAY_AS_YOU_GO_BUNDLE_SIZE} matches`}
        </Button>
      </div>
    </Modal>
  );
}
