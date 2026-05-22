import { Router, Request, Response } from 'express';
import { protect, AuthRequest } from '../middlewares/auth';
import { stripeLimiter } from '../middlewares/rateLimiter';
import { stripeService } from '../services/stripe.service';
import { Subscription } from '../models/Subscription';
import { User } from '../models/User';
import { getUserFeatureFlags } from '../middlewares/featureGate';
import { logEvent, EVENTS } from '../utils/analytics';
import { emailService } from '../services/email.service';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

// ── Public ────────────────────────────────────────────────────────────────────

/**
 * GET /api/subscriptions/plans
 * Returns static plan definitions — no auth required.
 */
router.get('/plans', async (_req: Request, res: Response) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        '1 Resume',
        'Basic Templates',
        '5 AI Rewrites / month',
        'Basic PDF Export',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 15,
      interval: 'month',
      popular: true,
      features: [
        'Unlimited Resumes',
        'All Premium Templates',
        'Unlimited AI Rewrites',
        'Cover Letter Generator',
        'Full PDF Export',
        'Premium Typography',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 49,
      interval: 'month',
      features: [
        'Everything in Pro',
        'Advanced ATS Analysis',
        'Unlimited ATS Reports',
        'Team Collaboration',
        'Priority Support',
      ],
    },
  ];

  return res.json({ success: true, data: plans });
});

// ── Authenticated ─────────────────────────────────────────────────────────────

/**
 * GET /api/subscriptions/current
 * Returns current subscription for authenticated user, or free plan for unauthenticated
 */
router.get('/current', async (req: AuthRequest, res: Response) => {
  try {
    // If user is not authenticated, return free plan
    if (!req.user?._id) {
      return res.json({
        success: true,
        data: {
          plan: 'free',
          status: 'active',
          features: {},
          startDate: null,
          endDate: null,
          subscription: null,
        },
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      // Return free plan if user not found
      return res.json({
        success: true,
        data: {
          plan: 'free',
          status: 'active',
          features: {},
          startDate: null,
          endDate: null,
          subscription: null,
        },
      });
    }

    const subscription = await Subscription.findOne({ userId: req.user._id });

    return res.json({
      success: true,
      data: {
        plan: user.currentPlan,
        status: user.subscriptionStatus,
        features: user.features,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        subscription: subscription?.toObject() ?? null,
      },
    });
  } catch (error: any) {
    console.error('[subscriptions/current] error:', error);
    // Return free plan as fallback on error
    return res.json({
      success: true,
      data: {
        plan: 'free',
        status: 'active',
        features: {},
        startDate: null,
        endDate: null,
        subscription: null,
      },
    });
  }
});

/**
 * GET /api/subscriptions/checkout-session/:sessionId
 */
router.get('/checkout-session/:sessionId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const session = await stripeService.getCheckoutSession(req.params.sessionId);
    return res.json({
      success: true,
      data: {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        customer: session.customer,
        subscription: session.subscription,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/subscriptions/checkout
 * Rate-limited: 10/hour per user
 */
router.post('/checkout', protect, stripeLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { planType } = req.body;

    if (!['pro', 'enterprise'].includes(planType)) {
      return res.status(400).json({ success: false, error: 'Invalid plan type' });
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Ensure subscription record exists
    let subscription = await Subscription.findOne({ userId: req.user!._id });
    if (!subscription) {
      subscription = await Subscription.create({
        userId: req.user!._id,
        plan: 'free',
        status: 'active',
      });
    }

    // Create or reuse Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer(user.email, user.name);
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user!._id, { stripeCustomerId: customerId });
    }

    const session = await stripeService.createCheckoutSession({
      userId: req.user!._id.toString(),
      planType: planType as 'pro' | 'enterprise',
      successUrl: `${FRONTEND_URL}/subscription/success`,
      cancelUrl: `${FRONTEND_URL}/subscription`,
      customerId,
    });

    // Analytics
    logEvent(req.user!._id.toString(), EVENTS.SUBSCRIPTION_CHECKOUT_STARTED, { planType });

    return res.json({
      success: true,
      data: { sessionId: session.id, url: session.url },
    });
  } catch (error: any) {
    console.error('[subscriptions/checkout]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/subscriptions/cancel
 * Rate-limited: 10/hour per user
 */
router.post('/cancel', protect, stripeLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user!._id });

    if (!subscription?.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription to cancel',
      });
    }

    await stripeService.cancelSubscription(subscription.stripeSubscriptionId);

    subscription.status = 'cancelled';
    subscription.plan = 'free';
    subscription.cancelledAt = new Date();
    await subscription.save();

    const freeFeatures = getUserFeatureFlags('free');
    await User.findByIdAndUpdate(req.user!._id, {
      currentPlan: 'free',
      subscriptionStatus: 'canceled',
      features: freeFeatures,
    });

    logEvent(req.user!._id.toString(), EVENTS.SUBSCRIPTION_CANCELLED, {});

    return res.json({
      success: true,
      data: { message: 'Subscription canceled successfully' },
    });
  } catch (error: any) {
    console.error('[subscriptions/cancel]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/subscriptions/billing-portal
 */
router.post('/billing-portal', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user?.stripeCustomerId) {
      return res.status(400).json({ success: false, error: 'No Stripe customer found' });
    }

    const url = await stripeService.createBillingPortalSession(
      user.stripeCustomerId,
      `${FRONTEND_URL}/subscription`
    );

    return res.json({ success: true, data: { url } });
  } catch (error: any) {
    console.error('[subscriptions/billing-portal]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── Webhook (no auth, no rate limit) ─────────────────────────────────────────

/**
 * POST /api/subscriptions/webhook
 * Stripe sends raw body — registered with express.raw() in server/index.ts.
 * Includes duplicate event protection via idempotency check on event.id.
 */

import { WebhookEvent } from '../models/WebhookEvent';

router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.warn('[webhook] Missing stripe-signature header');
    return res.status(400).json({ success: false, error: 'Missing stripe-signature header' });
  }

  // Verify the raw body is a Buffer (express.raw() must be registered before express.json())
  if (!Buffer.isBuffer(req.body)) {
    console.error('[webhook] req.body is not a Buffer — express.raw() may not be configured correctly');
    return res.status(400).json({ success: false, error: 'Invalid request body format' });
  }

  let event;
  try {
    event = stripeService.verifyWebhookSignature(req.body, sig as string);
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
  }

  if (!event) {
    return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
  }

  // Duplicate event protection using MongoDB unique index
  try {
    await WebhookEvent.create({ eventId: event.id });
  } catch (err: any) {
    if (err.code === 11000) {
      console.log(`[webhook] Duplicate event ignored: ${event.id}`);
      return res.json({ received: true, duplicate: true });
    }
    console.error('[webhook] Error saving webhook event:', err);
    return res.status(500).json({ success: false, error: 'Database error processing webhook' });
  }

  console.log(`[webhook] Processing event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const data = stripeService.handleCheckoutCompleted(session);
        if (!data) break;

        const { userId, customerId, subscriptionId, planType } = data;
        const features = getUserFeatureFlags(planType as 'free' | 'pro' | 'enterprise');

        await Subscription.findOneAndUpdate(
          { userId },
          {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            plan: planType,
            status: 'active',
            startDate: new Date(),
          },
          { upsert: true, new: true }
        );

        await User.findByIdAndUpdate(userId, {
          currentPlan: planType,
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          features,
        });

        // Fire-and-forget email
        const user = await User.findById(userId);
        if (user) {
          emailService.sendSubscriptionSuccessEmail(user.email, planType).catch(() => {});
        }

        logEvent(userId, EVENTS.SUBSCRIPTION_ACTIVATED, { planType });
        console.log(`[webhook] ✓ Subscription activated for user ${userId} → ${planType}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const data = stripeService.handleSubscriptionUpdated(sub);
        if (!data) break;

        const subRecord = await Subscription.findOne({
          stripeSubscriptionId: data.subscriptionId,
        });
        if (subRecord) {
          subRecord.status = stripeService.mapSubscriptionStatus(data.status) as any;
          subRecord.renewalDate = new Date(data.currentPeriodEnd * 1000);
          if (data.cancelAtPeriodEnd) subRecord.cancelledAt = new Date();
          await subRecord.save();

          await User.findByIdAndUpdate(subRecord.userId, {
            subscriptionStatus: stripeService.mapSubscriptionStatus(data.status),
          });
        }
        console.log(`[webhook] ✓ Subscription updated: ${data.subscriptionId} → ${data.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const data = stripeService.handleSubscriptionDeleted(sub);
        if (!data) break;

        const subRecord = await Subscription.findOne({
          stripeSubscriptionId: data.subscriptionId,
        });
        if (subRecord) {
          subRecord.status = 'cancelled';
          subRecord.plan = 'free';
          subRecord.cancelledAt = new Date();
          await subRecord.save();

          const freeFeatures = getUserFeatureFlags('free');
          await User.findByIdAndUpdate(subRecord.userId, {
            currentPlan: 'free',
            subscriptionStatus: 'canceled',
            features: freeFeatures,
          });

          logEvent(subRecord.userId.toString(), EVENTS.SUBSCRIPTION_CANCELLED, {});
        }
        console.log(`[webhook] ✓ Subscription deleted: ${data.subscriptionId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subRecord = await Subscription.findOne({
          stripeSubscriptionId: invoice.subscription,
        });
        if (subRecord) {
          subRecord.status = 'past_due';
          await subRecord.save();
          await User.findByIdAndUpdate(subRecord.userId, { subscriptionStatus: 'past_due' });
        }
        console.log(`[webhook] ⚠ Payment failed for subscription: ${invoice.subscription}`);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error('[webhook] Processing error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
