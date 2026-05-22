import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middlewares/auth';
import { Resume } from '../models/Resume';
import { JobMatch } from '../models/JobMatch';
import { calculateAdvancedATSMetrics } from '../services/advanced-ats.service';
import { logEvent, EVENTS } from '../utils/analytics';

const router = Router();

/**
 * POST /api/jobs/upload-description
 * Upload or paste a job description for matching
 */
router.post('/upload-description', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { jobDescription, jobTitle, jobCompany } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ success: false, error: 'Job description must be at least 50 characters' });
    }

    // Extract keywords from the job description
    const { extractKeywords } = require('../services/ats.service');
    const keywords = extractKeywords(jobDescription, 40);

    logEvent(req.user!._id.toString(), EVENTS.ATS_SCORE_GENERATED, {
      type: 'job_description_uploaded',
      keywordCount: keywords.length,
    });

    return res.json({
      success: true,
      data: {
        keywords,
        jobTitle,
        jobCompany,
        keywordCount: keywords.length,
      },
    });
  } catch (error: any) {
    console.error('[jobs/upload-description]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/jobs/match-resume
 * Compare a resume against a job description and calculate match percentage
 */
router.post('/match-resume', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription, jobTitle, jobCompany } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ success: false, error: 'resumeId and jobDescription are required' });
    }

    if (jobDescription.trim().length < 50) {
      return res.status(400).json({ success: false, error: 'Job description must be at least 50 characters' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Get advanced ATS metrics
    const advancedMetrics = calculateAdvancedATSMetrics(resume.data, jobDescription);

    // Calculate overall match percentage (weighted combination)
    const matchPercentage = Math.round(
      advancedMetrics.semanticSimilarity * 0.40 + // Semantic match is most important
      Math.min(advancedMetrics.atsCompatibilityScore, 100) * 0.30 +
      Math.min(advancedMetrics.recruiterLikelihoodScore, 100) * 0.30
    );

    // Save the match to database
    const jobMatch = await JobMatch.create({
      userId: req.user!._id,
      resumeId,
      jobDescription,
      jobTitle,
      jobCompany,
      matchPercentage,
      keywordDensity: advancedMetrics.keywordDensity,
      semanticSimilarity: advancedMetrics.semanticSimilarity,
      matchedKeywords: advancedMetrics.hardSkillsMatch.matched.slice(0, 20),
      missingKeywords: advancedMetrics.recommendations
        .filter(r => r.category === 'critical')
        .map(r => r.suggestion)
        .slice(0, 10),
      hardSkillsMatch: advancedMetrics.hardSkillsMatch,
      softSkillsMatch: advancedMetrics.softSkillsMatch,
      recommendations: advancedMetrics.recommendations.slice(0, 10),
    });

    logEvent(req.user!._id.toString(), EVENTS.ATS_SCORE_GENERATED, {
      type: 'job_match_calculated',
      matchPercentage,
      resumeId,
    });

    return res.json({
      success: true,
      data: {
        matchId: jobMatch._id,
        matchPercentage,
        interpretation: matchPercentage > 85 ? 'Excellent match - Apply now!' :
                       matchPercentage > 70 ? 'Good match - Consider tailoring' :
                       matchPercentage > 50 ? 'Moderate match - Significant tailoring needed' :
                       'Poor match - Consider other opportunities',
        keywordDensity: advancedMetrics.keywordDensity,
        semanticSimilarity: advancedMetrics.semanticSimilarity,
        recruiterLikelihood: advancedMetrics.recruiterLikelihoodScore,
        atsCompatibility: advancedMetrics.atsCompatibilityScore,
        matchedKeywords: advancedMetrics.hardSkillsMatch.matched.slice(0, 20),
        missingKeywords: advancedMetrics.recommendations
          .filter(r => r.category === 'critical')
          .map(r => r.suggestion)
          .slice(0, 10),
        skillsAnalysis: {
          hardSkills: advancedMetrics.hardSkillsMatch,
          softSkills: advancedMetrics.softSkillsMatch,
        },
      },
    });
  } catch (error: any) {
    console.error('[jobs/match-resume]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/:matchId/recommendations
 * Get detailed recommendations for resume tailoring
 */
router.get('/:matchId/recommendations', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { matchId } = req.params;

    const jobMatch = await JobMatch.findOne({
      _id: matchId,
      userId: req.user!._id,
    });

    if (!jobMatch) {
      return res.status(404).json({ success: false, error: 'Job match not found' });
    }

    // Categorize recommendations by priority
    const recommendations = {
      critical: jobMatch.recommendations.filter(r => r.category === 'critical'),
      high: jobMatch.recommendations.filter(r => r.category === 'high'),
      medium: jobMatch.recommendations.filter(r => r.category === 'medium'),
      low: jobMatch.recommendations.filter(r => r.category === 'low'),
    };

    const totalScoreIncreasePotential = jobMatch.recommendations.reduce(
      (sum, r) => sum + r.estimatedScoreIncrease,
      0
    );

    logEvent(req.user!._id.toString(), EVENTS.ATS_SCORE_GENERATED, {
      type: 'recommendations_viewed',
      matchId,
    });

    return res.json({
      success: true,
      data: {
        matchPercentage: jobMatch.matchPercentage,
        recommendations,
        totalScoreIncreasePotential,
        estimatedNewScore: Math.min(jobMatch.matchPercentage + totalScoreIncreasePotential, 100),
        tailoringNotes: jobMatch.tailoringNotes,
      },
    });
  } catch (error: any) {
    console.error('[jobs/:matchId/recommendations]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/jobs/:matchId/tailor-resume
 * AI-powered resume tailoring for a specific job
 */
router.post('/:matchId/tailor-resume', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { matchId } = req.params;
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, error: 'resumeId is required' });
    }

    const jobMatch = await JobMatch.findOne({
      _id: matchId,
      userId: req.user!._id,
    });

    if (!jobMatch) {
      return res.status(404).json({ success: false, error: 'Job match not found' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Return tailoring guidance based on recommendations
    const tailoringGuidance = {
      steps: [
        {
          step: 1,
          title: 'Add Missing Keywords to Skills Section',
          details: jobMatch.missingKeywords.slice(0, 5),
          impact: '15-20% score improvement',
        },
        {
          step: 2,
          title: 'Strengthen Experience Bullets',
          details: 'Add metrics and action verbs focusing on:',
          keywords: jobMatch.recommendations
            .filter(r => r.category === 'critical')
            .map(r => r.suggestion)
            .slice(0, 3),
          impact: '10-15% score improvement',
        },
        {
          step: 3,
          title: 'Update Professional Summary',
          details: 'Incorporate top keywords naturally into your summary',
          keywords: jobMatch.matchedKeywords.slice(0, 3),
          impact: '5-10% score improvement',
        },
      ],
      estimatedTotalImprovement: jobMatch.recommendations.reduce(
        (sum, r) => sum + r.estimatedScoreIncrease,
        0
      ),
      nextSteps: 'Apply these changes and re-run the match analysis to verify improvements',
    };

    logEvent(req.user!._id.toString(), EVENTS.AI_REWRITE_USED, {
      type: 'resume_tailoring',
      matchId,
    });

    return res.json({
      success: true,
      data: tailoringGuidance,
    });
  } catch (error: any) {
    console.error('[jobs/:matchId/tailor-resume]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/history
 * Get user's job match history
 */
router.get('/history/all', protect, async (req: AuthRequest, res: Response) => {
  try {
    const jobMatches = await JobMatch.find({ userId: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('_id jobTitle jobCompany matchPercentage createdAt updatedAt');

    const stats = {
      totalMatches: jobMatches.length,
      averageMatchScore: Math.round(
        jobMatches.reduce((sum, m) => sum + m.matchPercentage, 0) / jobMatches.length || 0
      ),
      bestMatch: jobMatches.length > 0 ? Math.max(...jobMatches.map(m => m.matchPercentage)) : 0,
    };

    return res.json({
      success: true,
      data: {
        matches: jobMatches,
        stats,
      },
    });
  } catch (error: any) {
    console.error('[jobs/history/all]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
