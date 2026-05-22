/**
 * Demo Account Seeder
 * Creates a Pro demo account if it doesn't already exist.
 * Run automatically on server startup in development.
 * Safe to run multiple times — idempotent.
 *
 * Credentials:
 *   Email:    demo@careerforge.pro
 *   Password: Demo@123
 */

import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { getUserFeatureFlags } from '../middlewares/featureGate';

const DEMO_EMAIL    = 'demo@careerforge.pro';
const DEMO_PASSWORD = 'Demo@123';
const DEMO_NAME     = 'Demo User';

export async function seedDemoAccount(): Promise<void> {
  try {
    const existing = await User.findOne({ email: DEMO_EMAIL });
    if (existing) {
      // Ensure the demo account always has Pro features (in case flags changed)
      const proFeatures = getUserFeatureFlags('pro');
      await User.findByIdAndUpdate(existing._id, {
        $set: {
          currentPlan: 'pro',
          subscriptionStatus: 'active',
          features: proFeatures,
        },
      });
      console.log('[seed] Demo account already exists — features refreshed.');
      return;
    }

    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(DEMO_PASSWORD, salt);

    const proFeatures = getUserFeatureFlags('pro');

    const user = await User.create({
      name:               DEMO_NAME,
      email:              DEMO_EMAIL,
      password:           hashed,
      currentPlan:        'pro',
      subscriptionStatus: 'active',
      features:           proFeatures,
      aiUsageCount:       0,
    });

    await Subscription.create({
      userId: user._id,
      plan:   'pro',
      status: 'active',
    });

    console.log(`[seed] ✓ Demo account created: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } catch (err) {
    console.error('[seed] Failed to seed demo account:', err);
  }
}
