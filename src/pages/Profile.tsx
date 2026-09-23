import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import CancelModal from '../components/CancelModal';
import ChatFab from '../components/ChatFab';
import Logo from '../components/Logo';
import UpgradeModal from '../components/UpgradeModal';
import { useSubscription } from '../context/SubscriptionContext';
import { SUBSCRIPTION_TIERS, getTier } from '../data/subscriptionTiers';
import { formatFullDate } from '../logic/dates';

export default function Profile() {
  const { subscription, resumeSubscription, setDisplayName } = useSubscription();
  const [nameDraft, setNameDraft] = useState(subscription.displayName);
  const [upgradeTarget, setUpgradeTarget] = useState<'monthly' | 'yearly' | null>(null);
  const [showCancel, setShowCancel] = useState(false);

  const currentTier = getTier(subscription.currentTier);
  const isPaid = subscription.currentTier !== 'free';
  const initials = subscription.displayName.trim().slice(0, 2).toUpperCase() || 'TR';

  const scrollToPlans = () => {
    document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-dvh bg-ocean-deepest pb-24 text-white">
      <header
        className="flex items-center justify-between px-4 sm:px-12"
        style={{ paddingTop: 'max(1.25rem, calc(0.75rem + env(safe-area-inset-top)))' }}
      >
        <Logo />
        <Link to="/saved" className="text-xs font-medium text-white/80 hover:text-white sm:text-sm">
          Saved trips
        </Link>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Identity */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ocean-mid font-display text-xl text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-white/50">
              Your name
            </label>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => setDisplayName(nameDraft)}
              placeholder="Traveler"
              className="mt-1 w-full max-w-xs rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:border-gold-accent focus:outline-none"
            />
          </div>
          {subscription.currentTier === 'yearly' && (
            <span className="rounded-full bg-gold-accent px-3 py-1 text-xs font-bold text-ink">
              Yearly Member
            </span>
          )}
        </div>

        {/* Current plan card */}
        {isPaid ? (
          <div className="mt-8 rounded-3xl border-2 border-gold-accent/60 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gold-accent">
                  Current plan
                </p>
                <h1 className="font-display mt-1 text-3xl">{currentTier.name}</h1>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl text-gold-accent">
                  ${currentTier.price.amount}
                  <span className="text-sm text-white/60">
                    {currentTier.price.billingPeriod === 'month' ? ' / mo' : ' / yr'}
                  </span>
                </p>
              </div>
            </div>

            {subscription.cancelAtPeriodEnd ? (
              <div className="mt-4 rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/85">
                  Cancels on{' '}
                  <span className="font-semibold text-gold-accent">
                    {formatFullDate(subscription.renewsOn)}
                  </span>
                  . Your benefits stay active until then.
                </p>
                <Button variant="secondary" className="mt-3 px-4 py-2 text-sm" onClick={resumeSubscription}>
                  Resume subscription
                </Button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-white/60">
                Renews on {formatFullDate(subscription.renewsOn)}
              </p>
            )}

            <ul className="mt-5 space-y-2">
              {currentTier.benefits.map((b) => (
                <li key={b.id} className="flex items-start gap-2 text-sm text-white/85">
                  <span className="mt-0.5 text-gold-accent">✓</span>
                  <span>{b.label}</span>
                </li>
              ))}
            </ul>

            {!subscription.cancelAtPeriodEnd && (
              <button
                type="button"
                onClick={() => setShowCancel(true)}
                className="mt-6 text-sm font-medium text-white/50 underline underline-offset-4 hover:text-white/80 cursor-pointer"
              >
                Cancel subscription
              </button>
            )}
          </div>
        ) : (
          <div className="glass-panel mt-8 rounded-3xl p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">Current plan</p>
            <h1 className="font-display mt-1 text-3xl">Free</h1>
            <p className="mt-2 text-sm text-white/70">
              You get full access to planning and editing trips. Upgrade for unlimited trip matches,
              hotel discounts, and hidden-gem destinations.
            </p>
            <Button variant="primary" className="mt-5" onClick={scrollToPlans}>
              Upgrade
            </Button>
          </div>
        )}

        {/* Plan comparison */}
        <div id="plans" className="mt-12 scroll-mt-6">
          <h2 className="font-display text-2xl">Compare plans</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {SUBSCRIPTION_TIERS.map((tier) => {
              const isCurrent = tier.id === subscription.currentTier;
              const isYearly = tier.id === 'yearly';
              return (
                <div
                  key={tier.id}
                  className={`flex flex-col rounded-3xl p-5 ${
                    isYearly
                      ? 'border-2 border-gold-accent bg-white/10'
                      : isCurrent
                        ? 'border-2 border-white/40 bg-white/10'
                        : 'glass-panel'
                  }`}
                >
                  {isYearly && tier.savingsNote && (
                    <span className="mb-2 inline-block w-fit rounded-full bg-gold-accent px-2.5 py-1 text-xs font-bold text-ink">
                      {tier.savingsNote}
                    </span>
                  )}
                  <h3 className="font-display text-xl">{tier.name}</h3>
                  <p className="mt-1 text-2xl font-semibold text-gold-accent">
                    ${tier.price.amount}
                    {tier.price.billingPeriod && (
                      <span className="text-sm font-normal text-white/60">
                        {' '}
                        / {tier.price.billingPeriod === 'month' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {tier.benefits.map((b) => (
                      <li key={b.id} className="flex items-start gap-2 text-xs text-white/80 sm:text-sm">
                        <span className="mt-0.5 text-gold-accent">✓</span>
                        <span>{b.label}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5">
                    {isCurrent ? (
                      <Button variant="secondary" className="w-full" disabled>
                        Current plan
                      </Button>
                    ) : tier.id === 'free' ? (
                      <p className="text-center text-xs text-white/40">Included with every plan</p>
                    ) : (
                      <Button
                        variant={isYearly ? 'primary' : 'accent'}
                        className="w-full"
                        onClick={() => setUpgradeTarget(tier.id as 'monthly' | 'yearly')}
                      >
                        Upgrade to {tier.name}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10">
          <Link to="/saved" className="text-sm font-medium text-white/70 underline underline-offset-4 hover:text-white">
            View your saved trips →
          </Link>
        </div>
      </div>

      {upgradeTarget && <UpgradeModal tierId={upgradeTarget} onClose={() => setUpgradeTarget(null)} />}
      {showCancel && <CancelModal onClose={() => setShowCancel(false)} />}

      <ChatFab />
    </div>
  );
}
