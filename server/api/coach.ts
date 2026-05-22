import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middlewares/auth';
import { checkAIUsage, incrementAIUsage } from '../middlewares/featureGate';
import {
  analyzeResumeBullet,
  suggestActionVerbs,
  suggestMetricsImpact,
  generateCoachFeedback,
  improveWithAI,
  analyzeResumeForCoaching,
} from '../services/ai-coach.service';
import { calculateAdvancedATSMetrics } from '../services/advanced-ats.service';
import { Resume } from '../models/Resume';
import { logEvent, EVENTS } from '../utils/analytics';

const router = Router();

/**
 * POST /api/ai/coach/bullet-analysis
 * Analyze a single resume bullet point for improvements
 */
router.post('/coach/bullet-analysis', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { bulletText } = req.body;

    if (!bulletText) {
      return res.status(400).json({ success: false, error: 'bulletText is required' });
    }

    const { issues, score } = analyzeResumeBullet(bulletText);
    const actionVerbSuggestions = suggestActionVerbs(bulletText);
    const metricSuggestions = suggestMetricsImpact(bulletText);

    logEvent(req.user!._id.toString(), EVENTS.AI_COACH_USED, { type: 'bullet-analysis' });

    return res.json({
      success: true,
      data: {
        bulletQualityScore: score,
        issues,
        suggestions: [...actionVerbSuggestions, ...metricSuggestions].slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error('[ai/coach/bullet-analysis]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/coach/improve-bullet
 * AI-powered improvement of a resume bullet point
 */
router.post('/coach/improve-bullet', protect, checkAIUsage, async (req: AuthRequest, res: Response) => {
  try {
    const { bulletText, jdKeywords } = req.body;

    if (!bulletText) {
      return res.status(400).json({ success: false, error: 'bulletText is required' });
    }

    const { improved, explanation } = await improveWithAI(bulletText, jdKeywords);

    await incrementAIUsage(req.user!._id.toString());
    logEvent(req.user!._id.toString(), EVENTS.AI_REWRITE_USED, { type: 'bullet-improvement' });

    return res.json({
      success: true,
      data: {
        original: bulletText,
        improved,
        explanation,
      },
    });
  } catch (error: any) {
    console.error('[ai/coach/improve-bullet]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/coach/section-analysis
 * Analyze an entire resume section (experience, summary, etc.)
 */
router.post('/coach/section-analysis', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { section, content, jdKeywords } = req.body;

    if (!section || !content) {
      return res.status(400).json({ success: false, error: 'section and content are required' });
    }

    const validSections = ['experience', 'summary', 'skills', 'education', 'projects'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ success: false, error: `Invalid section. Must be one of: ${validSections.join(', ')}` });
    }

    const feedback = generateCoachFeedback(
      section as any,
      content,
      jdKeywords || []
    );

    logEvent(req.user!._id.toString(), EVENTS.AI_COACH_USED, { type: 'section-analysis', section });

    return res.json({
      success: true,
      data: feedback,
    });
  } catch (error: any) {
    console.error('[ai/coach/section-analysis]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/coach/full-resume-analysis
 * Analyze entire resume for coaching feedback
 */
router.post('/coach/full-resume-analysis', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, error: 'resumeId is required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Extract JD keywords if provided
    const { extractKeywords } = require('../services/ats.service');
    const jdKeywords = jobDescription ? extractKeywords(jobDescription, 30) : [];

    // Get coaching feedback
    const feedback = analyzeResumeForCoaching(resume.data, jdKeywords);

    // Get advanced ATS metrics
    const advancedMetrics = calculateAdvancedATSMetrics(resume.data, jobDescription);

    logEvent(req.user!._id.toString(), EVENTS.AI_COACH_USED, { type: 'full-analysis', resumeId });

    return res.json({
      success: true,
      data: {
        coaching: feedback,
        atsMetrics: {
          keywordDensity: advancedMetrics.keywordDensity,
          semanticSimilarity: advancedMetrics.semanticSimilarity,
          heatmap: advancedMetrics.heatmap,
          recruiterLikelihoodScore: advancedMetrics.recruiterLikelihoodScore,
          atsCompatibilityScore: advancedMetrics.atsCompatibilityScore,
          topRecommendations: advancedMetrics.recommendations.slice(0, 5),
        },
      },
    });
  } catch (error: any) {
    console.error('[ai/coach/full-resume-analysis]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/coach/weak-bullet-detection
 * Detect weak bullets in experience and suggest improvements
 */
router.post('/coach/weak-bullet-detection', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, error: 'resumeId is required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const weakBullets: any[] = [];

    for (const exp of resume.data?.experience ?? []) {
      for (let i = 0; i < (exp.bulletPoints?.length ?? 0); i++) {
        const bullet = exp.bulletPoints[i];
        const { issues, score } = analyzeResumeBullet(bullet);

        if (score < 70) {
          weakBullets.push({
            section: `${exp.jobTitle} at ${exp.company}`,
            bulletIndex: i,
            bulletText: bullet,
            qualityScore: score,
            issues,
            suggestions: suggestActionVerbs(bullet),
          });
        }
      }
    }

    logEvent(req.user!._id.toString(), EVENTS.AI_COACH_USED, { type: 'weak-bullet-detection', count: weakBullets.length });

    return res.json({
      success: true,
      data: {
        weakBulletCount: weakBullets.length,
        weakBullets: weakBullets.slice(0, 10), // Return top 10 weak bullets
        recommendations: 'Focus on replacing weak verbs with action verbs and adding metrics.',
      },
    });
  } catch (error: any) {
    console.error('[ai/coach/weak-bullet-detection]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/coach/action-verb-suggestions
 * Get action verb suggestions for weak bullet points
 */
router.post('/coach/action-verb-suggestions', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, error: 'resumeId is required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const actionVerbImprovements: any[] = [];

    for (const exp of resume.data?.experience ?? []) {
      for (let i = 0; i < (exp.bulletPoints?.length ?? 0); i++) {
        const bullet = exp.bulletPoints[i];
        const suggestions = suggestActionVerbs(bullet);

        if (suggestions.length > 0) {
          actionVerbImprovements.push({
            section: `${exp.jobTitle} at ${exp.company}`,
            bulletIndex: i,
            bulletText: bullet,
            suggestions,
          });
        }
      }
    }

    logEvent(req.user!._id.toString(), EVENTS.AI_COACH_USED, { type: 'action-verb-suggestions' });

    return res.json({
      success: true,
      data: {
        totalBulletsAnalyzed: (resume.data?.experience ?? []).reduce((sum: number, e: any) => sum + (e.bulletPoints?.length ?? 0), 0),
        bulletsNeedingVerbImprovement: actionVerbImprovements.length,
        improvements: actionVerbImprovements.slice(0, 10),
      },
    });
  } catch (error: any) {
    console.error('[ai/coach/action-verb-suggestions]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/coach/metrics-analysis
 * Analyze resume for missing metrics and measurable impact
 */
router.post('/coach/metrics-analysis', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, error: 'resumeId is required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const bulletsWithMetrics: any[] = [];
    const bulletsWithoutMetrics: any[] = [];

    for (const exp of resume.data?.experience ?? []) {
      for (let i = 0; i < (exp.bulletPoints?.length ?? 0); i++) {
        const bullet = exp.bulletPoints[i];
        const hasMetrics = /\d+%|\$\d+|x\d+|\d+\s*(times|projects|users|customers)/i.test(bullet);

        if (hasMetrics) {
          bulletsWithMetrics.push({
            section: `${exp.jobTitle} at ${exp.company}`,
            bulletIndex: i,
            bulletText: bullet,
          });
        } else {
          const suggestions = suggestMetricsImpact(bullet);
          bulletsWithoutMetrics.push({
            section: `${exp.jobTitle} at ${exp.company}`,
            bulletIndex: i,
            bulletText: bullet,
            suggestions,
          });
        }
      }
    }

    logEvent(req.user!._id.toString(), EVENTS.AI_COACH_USED, { type: 'metrics-analysis' });

    return res.json({
      success: true,
      data: {
        totalBullets: bulletsWithMetrics.length + bulletsWithoutMetrics.length,
        bulletsWithMetrics: bulletsWithMetrics.length,
        bulletsWithoutMetrics: bulletsWithoutMetrics.length,
        metricsPercentage: Math.round((bulletsWithMetrics.length / (bulletsWithMetrics.length + bulletsWithoutMetrics.length || 1)) * 100),
        suggestionsForImprovement: bulletsWithoutMetrics.slice(0, 10),
      },
    });
  } catch (error: any) {
    console.error('[ai/coach/metrics-analysis]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
