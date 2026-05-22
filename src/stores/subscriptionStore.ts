import { create } from 'zustand';
import { SubscriptionPlan, UserFeatures } from '../types';

const FREE_FEATURES: UserFeatures = {
  premiumTemplates: false,
  unlimitedExports: false,
  advancedAI: false,
  coverLetterGenerator: false,
  advancedATS: false,
  unlimitedResumes: false,
};

interface SubscriptionState {
  currentPlan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  features: UserFeatures;
  startDate?: string;
  endDate?: string;
  isLoading: boolean;

  // Actions
  setSubscription: (data: {
    plan: SubscriptionPlan;
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    features: UserFeatures;
    startDate?: string;
    endDate?: string;
  }) => void;
  reset: () => void;
}

/**
 * Subscription store — mirrors the user's current plan and feature flags.
 * Kept in sync with authStore during subscription lifecycle events.
 * All premium UI components should read from authStore.user.features as the
 * single source of truth; this store is for subscription-page-specific state.
 */
export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  currentPlan: 'free',
  status: 'active',
  features: FREE_FEATURES,
  startDate: undefined,
  endDate: undefined,
  isLoading: false,

  setSubscription: (data) =>
    set({
      currentPlan: data.plan,
      status: data.status,
      features: data.features,
      startDate: data.startDate,
      endDate: data.endDate,
    }),

  reset: () =>
    set({
      currentPlan: 'free',
      status: 'active',
      features: FREE_FEATURES,
      startDate: undefined,
      endDate: undefined,
    }),
}));
