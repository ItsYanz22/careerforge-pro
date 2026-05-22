import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserFeatures } from '../models/User';

/**
 * Feature flag map — single source of truth.
 * No plan-name comparisons outside this function.
 */
export function getUserFeatureFlags(
  planType: 'free' | 'pro' | 'enterprise'
): UserFeatures {
  const featureMap: Record<'free' | 'pro' | 'enterprise', UserFeatures> = {
    free: {
      premiumTemplates: false,
      unlimitedExports: false,
      advancedAI: false,
      coverLetterGenerator: false,
      advancedATS: false,
      unlimitedResumes: false,
      jobMatching: false,
      collaboration: false,
      versionComparison: false,
      docxExport: false,
      pdfExport: true,   // Free users CAN export PDF (basic templates only, watermarked)
    },
    pro: {
      premiumTemplates: true,
      unlimitedExports: true,
      advancedAI: true,
      coverLetterGenerator: true,
      advancedATS: false,
      unlimitedResumes: false,
      jobMatching: true,
      collaboration: true,
      versionComparison: true,
      docxExport: true,
      pdfExport: true,
    },
    enterprise: {
      premiumTemplates: true,
      unlimitedExports: true,
      advancedAI: true,
      coverLetterGenerator: true,
      advancedATS: true,
      unlimitedResumes: true,
      jobMatching: true,
      collaboration: true,
      versionComparison: true,
      docxExport: true,
      pdfExport: true,
    },
  };

  return featureMap[planType] ?? featureMap.free;
}

/**
 * Middleware factory — gates a route behind a feature flag.
 * Reads req.user.features[feature] — never checks plan name directly.
 */
export const requireFeature = (feature: keyof UserFeatures) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const features = req.user.features as UserFeatures | undefined;

    if (!features?.[feature]) {
      return res.status(403).json({
        success: false,
        error: `This feature requires a Pro or higher subscription`,
        code: 'FEATURE_LOCKED',
        requiredPlan: getRequiredPlan(feature),
      });
    }

    return next();
  };
};

/**
 * Middleware — blocks resume creation when Free user already has 1+ resumes.
 * Reads features.unlimitedResumes — no plan name check.
 */
export const checkResumeLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const features = req.user.features as UserFeatures | undefined;

  if (features?.unlimitedResumes) {
    return next();
  }

  try {
    const { Resume } = await import('../models/Resume');
    const count = await Resume.countDocuments({ userId: req.user._id });

    if (count >= 1) {
      return res.status(403).json({
        success: false,
        error: 'Resume limit reached. Upgrade to Pro to create unlimited resumes.',
        code: 'RESUME_LIMIT_REACHED',
        requiredPlan: 'pro',
      });
    }

    return next();
  } catch (err) {
    console.error('[checkResumeLimit] Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Middleware — enforces monthly AI rewrite quota for Free users.
 * Resets counter when aiUsageResetDate is in the past.
 * Pro users bypass entirely.
 */
export const checkAIUsage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const features = req.user.features as UserFeatures | undefined;

  // Pro/Enterprise users have unlimited AI — skip check
  if (features?.advancedAI) {
    return next();
  }

  try {
    const { User } = await import('../models/User');
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const now = new Date();

    // Reset counter if the reset date has passed
    if (!user.aiUsageResetDate || user.aiUsageResetDate <= now) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      user.aiUsageCount = 0;
      user.aiUsageResetDate = nextMonth;
      await user.save();
    }

    const FREE_AI_LIMIT = 5;

    if (user.aiUsageCount >= FREE_AI_LIMIT) {
      return res.status(429).json({
        success: false,
        error: 'Monthly AI rewrite limit reached. Upgrade to Pro for unlimited rewrites.',
        code: 'AI_LIMIT_REACHED',
        requiredPlan: 'pro',
        usageCount: user.aiUsageCount,
        resetDate: user.aiUsageResetDate,
      });
    }

    // Attach user to request so the route handler can increment after success
    (req as any).aiUser = user;
    return next();
  } catch (err) {
    console.error('[checkAIUsage] Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Call after a successful AI rewrite to increment the usage counter.
 */
export const incrementAIUsage = async (userId: string): Promise<void> => {
  try {
    const { User } = await import('../models/User');
    await User.findByIdAndUpdate(userId, { $inc: { aiUsageCount: 1 } });
  } catch (err) {
    console.error('[incrementAIUsage] Error:', err);
  }
};

/**
 * Helper — check a feature flag without middleware.
 */
export function hasFeature(
  userFeatures: UserFeatures | undefined,
  feature: keyof UserFeatures
): boolean {
  return userFeatures?.[feature] === true;
}

/**
 * Internal — maps a feature to the minimum required plan name for error messages.
 */
function getRequiredPlan(feature: keyof UserFeatures): 'pro' | 'enterprise' {
  const enterpriseOnly: Array<keyof UserFeatures> = ['advancedATS', 'unlimitedResumes'];
  return enterpriseOnly.includes(feature) ? 'enterprise' : 'pro';
}