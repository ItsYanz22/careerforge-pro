import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fallback', {
  apiVersion: '2023-08-16',
});

interface PriceConfig {
  monthly: string;
  annually: string;
}

interface CreateCheckoutSessionRequest {
  userId: string;
  planType: 'pro' | 'enterprise';
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
}

/**
 * Production-grade Stripe Service for subscription management
 */
class StripeServiceImpl {
  private prices: Record<string, PriceConfig> = {
    pro: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_1TVQNeDfbRBSO38lQQBQQQQQ',
      annually: process.env.STRIPE_PRICE_PRO_ANNUALLY || 'price_1TVQNeDfbRBSO38lRRBRRRRR',
    },
  };

  /**
   * Create customer
   */
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer;
    } catch (error) {
      console.error('Stripe customer creation error:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<Stripe.Checkout.Session> {
    try {
      const { userId, planType, successUrl, cancelUrl, customerId } = request;
      const priceId = this.prices[planType]?.monthly;

      if (!priceId) {
        throw new Error(`Price not configured for plan: ${planType}`);
      }

      let customer = customerId;

      // Create customer if not provided
      if (!customer) {
        const customerObj = await stripe.customers.create({
          metadata: { userId },
        });
        customer = customerObj.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customer,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          planType,
        },
      });

      return session;
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw new Error(
        `Failed to create checkout session: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get checkout session details
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('Stripe session retrieval error:', error);
      throw new Error('Failed to retrieve checkout session');
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Stripe subscription retrieval error:', error);
      throw new Error('Failed to retrieve subscription');
    }
  }

  /**
   * Get customer details
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('Stripe customer retrieval error:', error);
      throw new Error('Failed to retrieve customer');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return subscription;
    } catch (error) {
      console.error('Stripe subscription cancellation error:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Immediately delete subscription
   */
  async deleteSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Stripe subscription deletion error:', error);
      throw new Error('Failed to delete subscription');
    }
  }

  /**
   * Update subscription plan
   */
  async updateSubscriptionPlan(
    subscriptionId: string,
    priceId: string
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
          },
        ],
      });
      return updatedSubscription;
    } catch (error) {
      console.error('Stripe subscription update error:', error);
      throw new Error('Failed to update subscription');
    }
  }

  /**
   * Create customer portal session
   */
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<string> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return session.url;
    } catch (error) {
      console.error('Stripe portal session error:', error);
      throw new Error('Failed to create billing portal session');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string | Buffer, signature: string): Stripe.Event | null {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return null;
      }

      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return null;
    }
  }

  /**
   * Handle checkout.session.completed webhook
   */
  handleCheckoutCompleted(session: Stripe.Checkout.Session): {
    userId: string;
    customerId: string;
    subscriptionId: string;
    planType: string;
  } | null {
    try {
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;
      const userId = session.metadata?.userId;
      const planType = session.metadata?.planType || 'pro';

      if (!userId || !customerId || !subscriptionId) {
        throw new Error('Missing required metadata in checkout session');
      }

      return {
        userId,
        customerId,
        subscriptionId,
        planType,
      };
    } catch (error) {
      console.error('Error handling checkout completed:', error);
      return null;
    }
  }

  /**
   * Handle customer.subscription.updated webhook
   */
  handleSubscriptionUpdated(subscription: Stripe.Subscription): {
    customerId: string;
    subscriptionId: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: number;
  } | null {
    try {
      return {
        customerId: subscription.customer as string,
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end,
      };
    } catch (error) {
      console.error('Error handling subscription updated:', error);
      return null;
    }
  }

  /**
   * Handle customer.subscription.deleted webhook
   */
  handleSubscriptionDeleted(subscription: Stripe.Subscription): {
    customerId: string;
    subscriptionId: string;
  } | null {
    try {
      return {
        customerId: subscription.customer as string,
        subscriptionId: subscription.id,
      };
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
      return null;
    }
  }

  /**
   * Get plan name from price ID
   */
  getPlanFromPrice(priceId: string): string {
    for (const [plan, prices] of Object.entries(this.prices)) {
      if (prices.monthly === priceId || prices.annually === priceId) {
        return plan;
      }
    }
    return 'free';
  }

  /**
   * Map Stripe subscription status to app status
   */
  mapSubscriptionStatus(stripeStatus: string): string {
    switch (stripeStatus) {
      case 'active':
      case 'trialing':
        return 'active';
      case 'past_due':
        return 'past_due';
      case 'canceled':
      case 'unpaid':
      default:
        return 'canceled';
    }
  }
}

// Export singleton instance
export const stripeService = new StripeServiceImpl();
export { stripe };
