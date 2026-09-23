import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { FREE_MONTHLY_REGENERATION_LIMIT } from '../data/subscriptionTiers';
import type { SubscriptionState } from '../types';

const STORAGE_KEY = 'tripwise.subscription';
const MOCK_DELAY_MS = 600;

function startOfNextMonthIso(from: Date): string {
  const d = new Date(from.getFullYear(), from.getMonth() + 1, 1);
  return d.toISOString();
}

function addBillingPeriod(fromIso: string, tier: 'monthly' | 'yearly'): string {
  const d = new Date(fromIso);
  if (tier === 'monthly') d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

function defaultState(): SubscriptionState {
  return {
    currentTier: 'free',
    subscribedSince: null,
    renewsOn: null,
    cancelAtPeriodEnd: false,
    regenerationsUsed: 0,
    regenerationsResetAt: startOfNextMonthIso(new Date()),
    displayName: 'Traveler',
  };
}

function reconcile(state: SubscriptionState): SubscriptionState {
  const now = new Date();
  let next = state;

  if (new Date(next.regenerationsResetAt) <= now) {
    next = { ...next, regenerationsUsed: 0, regenerationsResetAt: startOfNextMonthIso(now) };
  }

  if (next.cancelAtPeriodEnd && next.renewsOn && new Date(next.renewsOn) <= now) {
    next = {
      ...next,
      currentTier: 'free',
      subscribedSince: null,
      renewsOn: null,
      cancelAtPeriodEnd: false,
    };
  }

  return next;
}

function loadState(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return reconcile({ ...defaultState(), ...JSON.parse(raw) });
  } catch {
    return defaultState();
  }
}

function persist(state: SubscriptionState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore, state still works for this session
  }
}

interface SubscriptionContextValue {
  subscription: SubscriptionState;
  isProcessing: boolean;
  canRegenerate: boolean;
  regenerationsRemaining: number | null;
  subscribe: (tierId: 'monthly' | 'yearly') => Promise<void>;
  cancelSubscription: () => void;
  resumeSubscription: () => void;
  recordRegeneration: () => void;
  setDisplayName: (name: string) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionState>(loadState);
  const [isProcessing, setIsProcessing] = useState(false);

  const update = (patch: Partial<SubscriptionState>) => {
    setSubscription((prev) => {
      const next = reconcile({ ...prev, ...patch });
      persist(next);
      return next;
    });
  };

  const subscribe = async (tierId: 'monthly' | 'yearly') => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
    const now = new Date().toISOString();
    update({
      currentTier: tierId,
      subscribedSince: now,
      renewsOn: addBillingPeriod(now, tierId),
      cancelAtPeriodEnd: false,
    });
    setIsProcessing(false);
  };

  const cancelSubscription = () => {
    update({ cancelAtPeriodEnd: true });
  };

  const resumeSubscription = () => {
    update({ cancelAtPeriodEnd: false });
  };

  const recordRegeneration = () => {
    update({ regenerationsUsed: subscription.regenerationsUsed + 1 });
  };

  const setDisplayName = (name: string) => {
    update({ displayName: name.trim() || 'Traveler' });
  };

  const canRegenerate =
    subscription.currentTier !== 'free' || subscription.regenerationsUsed < FREE_MONTHLY_REGENERATION_LIMIT;
  const regenerationsRemaining =
    subscription.currentTier !== 'free'
      ? null
      : Math.max(0, FREE_MONTHLY_REGENERATION_LIMIT - subscription.regenerationsUsed);

  const value = useMemo(
    () => ({
      subscription,
      isProcessing,
      canRegenerate,
      regenerationsRemaining,
      subscribe,
      cancelSubscription,
      resumeSubscription,
      recordRegeneration,
      setDisplayName,
    }),
    [subscription, isProcessing, canRegenerate, regenerationsRemaining],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
