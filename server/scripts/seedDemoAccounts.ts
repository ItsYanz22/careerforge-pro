/**
 * Demo Account Seeding Script
 * 
 * Creates demo accounts for testing different subscription tiers
 * Usage: Run in development environment only
 * 
 * Accounts:
 * - demo-free@careerforge.ai / Demo@123 (Free tier - basic features)
 * - demo-pro@careerforge.ai / Demo@123 (Pro tier - all individual features)
 * - demo-enterprise@careerforge.ai / Demo@123 (Enterprise - all team features)
 */

// @ts-ignore
import bcrypt from 'bcrypt';
import { User } from '../models/User';

interface DemoAccount {
  email: string;
  password: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing';
  features: string[];
  aiCredits: number;
  resumes: number;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'demo-free@careerforge.ai',
    password: 'Demo@123',
    name: 'Free Demo User',
    plan: 'free',
    subscriptionStatus: 'canceled',
    features: [
      'resume-builder',
      'resume-templates',
      'resume-export-pdf',
      'ats-scanner-basic',
      'cover-letter-basic',
    ],
    aiCredits: 5,
    resumes: 3,
  },
  {
    email: 'demo-pro@careerforge.ai',
    password: 'Demo@123',
    name: 'Pro Demo User',
    plan: 'pro',
    subscriptionStatus: 'active',
    features: [
      'resume-builder',
      'resume-templates',
      'resume-export-pdf',
      'resume-export-docx',
      'resume-export-watermark',
      'ats-scanner-advanced',
      'ats-optimization',
      'cover-letter-ai',
      'cover-letter-templates',
      'ai-coach',
      'performance-analytics',
      'unlimited-resumes',
      'api-access',
      'priority-support',
    ],
    aiCredits: 100,
    resumes: -1, // Unlimited
  },
  {
    email: 'demo-enterprise@careerforge.ai',
    password: 'Demo@123',
    name: 'Enterprise Demo User',
    plan: 'enterprise',
    subscriptionStatus: 'active',
    features: [
      // All Pro features
      'resume-builder',
      'resume-templates',
      'resume-export-pdf',
      'resume-export-docx',
      'resume-export-watermark',
      'ats-scanner-advanced',
      'ats-optimization',
      'cover-letter-ai',
      'cover-letter-templates',
      'ai-coach',
      'performance-analytics',
      'unlimited-resumes',
      'api-access',
      'priority-support',
      // Enterprise features
      'team-management',
      'custom-branding',
      'sso',
      'api-webhooks',
      'bulk-operations',
      'custom-templates',
      'dedicated-support',
      'sla-guarantee',
    ],
    aiCredits: -1, // Unlimited
    resumes: -1, // Unlimited
  },
];

/**
 * Seeds demo accounts into the database
 * Should only run in development environment
 */
export async function seedDemoAccounts(User: any) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    console.warn('❌ Cannot seed demo accounts in production environment');
    return;
  }

  console.log('🌱 Seeding demo accounts...');

  for (const account of DEMO_ACCOUNTS) {
    try {
      // Check if account already exists
      const existing = await User.findOne({ email: account.email });
      if (existing) {
        console.log(`⚠️  Demo account already exists: ${account.email}`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 10);

      // Create user
      await User.create({
        email: account.email,
        name: account.name,
        password: hashedPassword,
        emailVerified: true, // Mark as verified
        currentPlan: account.plan,
        subscription: {
          plan: account.plan,
          status: account.subscriptionStatus,
          startDate: new Date(),
          renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          price: account.plan === 'free' ? 0 : account.plan === 'pro' ? 99 : 299,
        },
        features: account.features,
        usage: {
          aiCredits: account.aiCredits,
          resumes: account.resumes,
          coversLetters: account.plan === 'free' ? 3 : -1,
          atsScans: account.plan === 'free' ? 5 : -1,
        },
        preferences: {
          appearance: {
            darkMode: false,
            themeMode: 'light',
            accentColor: 'emerald',
            spacing: 'comfortable',
            typography: 'default',
          },
          notifications: {
            email: true,
            push: true,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Created demo account: ${account.email} (${account.plan})`);
    } catch (error) {
      console.error(`❌ Error creating demo account ${account.email}:`, error);
    }
  }

  console.log('✅ Demo account seeding complete');
}

/**
 * Get demo account by email for quick access
 */
export function getDemoAccount(email: string): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find((account) => account.email === email);
}

/**
 * Check if email is a demo account
 */
export function isDemoAccount(email: string): boolean {
  return DEMO_ACCOUNTS.some((account) => account.email === email);
}

/**
 * Main export: auto-seeds demo accounts on startup (development only)
 */
export async function seedDemoAccount(): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      return; // Skip in production
    }

    console.log('🌱 Checking demo accounts...');

    for (const account of DEMO_ACCOUNTS) {
      try {
        // Check if account already exists
        const existing = await User.findOne({ email: account.email });
        if (existing) {
          console.log(`✓ Demo account exists: ${account.email}`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(account.password, 10);

        // Get feature flags based on plan
        const { getUserFeatureFlags } = await import('../middlewares/featureGate');
        const features = getUserFeatureFlags(account.plan as any);

        // Create user
        await User.create({
          email: account.email,
          name: account.name,
          password: hashedPassword,
          emailVerified: true,
          currentPlan: account.plan,
          subscriptionStatus: account.subscriptionStatus,
          features: features,
          aiUsageCount: 0,
          preferences: {
            appearance: {
              darkMode: false,
              accentColor: 'emerald',
            },
            notifications: {
              email: true,
              push: true,
            },
          },
        });

        console.log(`✓ Created demo account: ${account.email} (${account.plan})`);
      } catch (error) {
        console.error(`✗ Error creating demo account ${account.email}:`, error);
      }
    }

    console.log('✓ Demo account seeding complete');
  } catch (error) {
    console.error('✗ Failed to seed demo accounts:', error);
  }
}
