import { apiClient } from './apiClient';

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  popular?: boolean;
  features: string[];
}

export interface Subscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  features?: Record<string, boolean>;
  startDate?: string;
  endDate?: string;
  subscription?: any;
}

/**
 * Subscription API client.
 *
 * NOTE: apiClient already unwraps `response.data` from the server envelope
 * `{ success: true, data: <payload> }`, so these methods return the payload directly.
 */
export const subscriptionApi = {
  /** GET /api/subscriptions/plans — no auth required */
  getPlans: (): Promise<Plan[]> =>
    apiClient.get<Plan[]>('/subscriptions/plans'),

  /** GET /api/subscriptions/current */
  getCurrentSubscription: (): Promise<Subscription> =>
    apiClient.get<Subscription>('/subscriptions/current'),

  /** POST /api/subscriptions/checkout */
  createCheckoutSession: (planType: 'pro' | 'enterprise'): Promise<{ sessionId: string; url: string }> =>
    apiClient.post<{ sessionId: string; url: string }>('/subscriptions/checkout', { planType }),

  /** GET /api/subscriptions/checkout-session/:sessionId */
  getCheckoutSession: (sessionId: string): Promise<{ id: string; status: string; paymentStatus: string }> =>
    apiClient.get<{ id: string; status: string; paymentStatus: string }>(
      `/subscriptions/checkout-session/${sessionId}`
    ),

  /** POST /api/subscriptions/cancel */
  cancelSubscription: (): Promise<{ message: string }> =>
    apiClient.post<{ message: string }>('/subscriptions/cancel', {}),

  /** POST /api/subscriptions/billing-portal */
  createBillingPortalSession: (): Promise<{ url: string }> =>
    apiClient.post<{ url: string }>('/subscriptions/billing-portal', {}),
};
