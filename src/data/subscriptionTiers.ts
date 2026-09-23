import type { SubscriptionBenefit, SubscriptionTier } from '../types';

const FREE_BENEFITS: SubscriptionBenefit[] = [
  { id: 'core-planning', label: 'Full Questionnaire, Chatbot & Edit access', type: 'feature-unlock' },
  { id: 'save-trips', label: 'Save and revisit your trips', type: 'feature-unlock' },
  { id: 'regen-limit', label: '3 trip matches per month', type: 'quota', value: '3 / month' },
];

const MONTHLY_ONLY_BENEFITS: SubscriptionBenefit[] = [
  { id: 'hotel-discount', label: '10% off partner hotel bookings', type: 'discount', value: '10%' },
  { id: 'unlimited-regen', label: 'Unlimited trip matches', type: 'quota', value: 'Unlimited' },
  { id: 'hidden-gems', label: 'Access to curated hidden-gem destinations', type: 'feature-unlock' },
  { id: 'priority-chat', label: 'Priority chatbot responses', type: 'priority', value: 'Priority' },
];

const YEARLY_ONLY_BENEFITS: SubscriptionBenefit[] = [
  { id: 'hotel-discount-yearly', label: '20% off partner hotel bookings', type: 'discount', value: '20%' },
  { id: 'concierge-replan', label: '1 free trip-concierge re-plan per year', type: 'feature-unlock' },
  { id: 'yearly-badge', label: '"Yearly Member" badge on your profile', type: 'feature-unlock' },
];

export const MONTHLY_PRICE = { amount: 9, currency: 'USD', billingPeriod: 'month' as const };
export const YEARLY_PRICE = { amount: 79, currency: 'USD', billingPeriod: 'year' as const };

function yearlySavingsNote(): string {
  const costPaidMonthly = MONTHLY_PRICE.amount * 12;
  const savings = costPaidMonthly - YEARLY_PRICE.amount;
  const percent = Math.round((savings / costPaidMonthly) * 100);
  return `Save $${savings} (${percent}%) vs paying monthly`;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: { amount: 0, currency: 'USD', billingPeriod: null },
    benefits: FREE_BENEFITS,
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: MONTHLY_PRICE,
    benefits: [...FREE_BENEFITS.filter((b) => b.id !== 'regen-limit'), ...MONTHLY_ONLY_BENEFITS],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: YEARLY_PRICE,
    benefits: [
      ...FREE_BENEFITS.filter((b) => b.id !== 'regen-limit'),
      ...MONTHLY_ONLY_BENEFITS,
      ...YEARLY_ONLY_BENEFITS,
    ],
    savingsNote: yearlySavingsNote(),
  },
];

export function getTier(id: SubscriptionTier['id']): SubscriptionTier {
  return SUBSCRIPTION_TIERS.find((t) => t.id === id) ?? SUBSCRIPTION_TIERS[0];
}

export const FREE_MONTHLY_REGENERATION_LIMIT = 3;

export const HOTEL_DISCOUNT_BY_TIER: Record<SubscriptionTier['id'], number> = {
  free: 0,
  monthly: 10,
  yearly: 20,
};
