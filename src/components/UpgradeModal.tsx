import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import { getTier } from '../data/subscriptionTiers';
import { useSubscription } from '../context/SubscriptionContext';

interface UpgradeModalProps {
  tierId: 'monthly' | 'yearly';
  onClose: () => void;
}

export default function UpgradeModal({ tierId, onClose }: UpgradeModalProps) {
  const { subscription, isProcessing, subscribe } = useSubscription();
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');
  const [previousTierId] = useState(subscription.currentTier);

  const targetTier = getTier(tierId);
  const previousTier = getTier(previousTierId);
  const previousBenefitIds = new Set(previousTier.benefits.map((b) => b.id));
  const newBenefits = targetTier.benefits.filter((b) => !previousBenefitIds.has(b.id));

  const handleConfirm = async () => {
    await subscribe(tierId);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <Modal onClose={onClose} labelledBy="upgrade-success-title">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-accent/20 text-gold-accent-deep">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 id="upgrade-success-title" className="font-display mt-4 text-2xl text-ink">
            You're on {targetTier.name}!
          </h2>
          <p className="mt-2 text-sm text-ink/60">Here's what just unlocked for you:</p>
          <ul className="mt-4 space-y-2 text-left">
            {newBenefits.map((b) => (
              <li key={b.id} className="flex items-start gap-2 text-sm text-ink">
                <span className="mt-0.5 text-ocean-mid">✓</span>
                <span>{b.label}</span>
              </li>
            ))}
          </ul>
          <Button variant="primary" className="mt-6 w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} labelledBy="upgrade-confirm-title">
      <h2 id="upgrade-confirm-title" className="font-display text-2xl text-ink">
        Upgrade to {targetTier.name}
      </h2>
      <p className="mt-2 text-sm text-ink/60">
        ${targetTier.price.amount}
        {targetTier.price.billingPeriod === 'month' ? ' / month' : ' / year'}
        {targetTier.savingsNote ? ` — ${targetTier.savingsNote}` : ''}
      </p>

      <ul className="mt-4 space-y-2">
        {newBenefits.map((b) => (
          <li key={b.id} className="flex items-start gap-2 text-sm text-ink">
            <span className="mt-0.5 text-ocean-mid">✓</span>
            <span>{b.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-ink/40">
        This is a demo — no real payment is processed, this only updates your plan on this device.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleConfirm} disabled={isProcessing}>
          {isProcessing ? 'Processing…' : `Upgrade to ${targetTier.name}`}
        </Button>
      </div>
    </Modal>
  );
}
