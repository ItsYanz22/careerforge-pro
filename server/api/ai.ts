import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middlewares/auth';
import { checkAIUsage, incrementAIUsage } from '../middlewares/featureGate';
import { aiService } from '../services/ai.service';
import { logEvent, EVENTS } from '../utils/analytics';
import { Resume } from '../models/Resume';

const router = Router();

/**
 * POST /api/ai/rewrite
 * AI bullet point / summary rewrite — gated by monthly quota for Free users.
 */
router.post('/rewrite', protect, checkAIUsage, async (req: AuthRequest, res: Response) => {
  try {
    const { type, content, targetKeywords } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    let result;
    if (type === 'summary') {
      result = await aiService.rewriteSummary(content, targetKeywords);
    } else {
      result = await aiService.rewriteBulletPoint(content, targetKeywords, req.user!._id.toString());
    }

    // Increment usage counter after successful generation
    await incrementAIUsage(req.user!._id.toString());

    // Fire analytics
    logEvent(req.user!._id.toString(), EVENTS.AI_REWRITE_USED, { type });

    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/extract-keywords
 * Extract keywords from a job description.
 */
router.post('/extract-keywords', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ success: false, error: 'Job description is required' });
    }

    const result = await aiService.analyzeJobDescription(jobDescription);

    const allKeywords = [
      ...result.keywords.map((k: any) => k.keyword),
      ...result.skills.map((s: any) => s.skill),
      ...result.tools,
    ];

    return res.json({
      success: true,
      data: { keywords: [...new Set(allKeywords)] },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/chat
 * AI career mentor chat.
 */
router.post('/chat', protect, checkAIUsage, async (req: AuthRequest, res: Response) => {
  try {
    const { message, context } = req.body;
    const result = await aiService.chatWithAI(message, context);
    await incrementAIUsage(req.user!._id.toString());
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/generate-summary
 * Generate a professional summary from scratch using resume data.
 */
router.post('/generate-summary', protect, checkAIUsage, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeData, targetRole } = req.body;

    if (!resumeData) {
      return res.status(400).json({ success: false, error: 'resumeData is required' });
    }

    const result = await aiService.generateSummaryFromScratch(resumeData, targetRole);
    await incrementAIUsage(req.user!._id.toString());
    logEvent(req.user!._id.toString(), EVENTS.AI_REWRITE_USED, { type: 'generate-summary' });

    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/coach
 * AI Resume Coach — analyze a specific section of the resume.
 */
router.post('/coach', protect, checkAIUsage, async (req: AuthRequest, res: Response) => {
  try {
    const { content, type } = req.body;

    if (!content || !type) {
      return res.status(400).json({ success: false, error: 'content and type are required' });
    }

    const result = await aiService.analyzeResumeSection(content, type);
    
    // Increment usage counter
    await incrementAIUsage(req.user!._id.toString());
    
    // Fire analytics
    logEvent(req.user!._id.toString(), EVENTS.AI_REWRITE_USED, { type: 'coach' });

    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ai/tailor
 * Analyze and suggest optimizations to tailor a resume for a specific job description.
 */
router.post('/tailor', protect, checkAIUsage, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ success: false, error: 'resumeId and jobDescription are required' });
    }

    // Get resume data
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const result = await aiService.tailorResume(resume.data, jobDescription);
    
    // Increment usage counter
    await incrementAIUsage(req.user!._id.toString());
    
    // Fire analytics
    logEvent(req.user!._id.toString(), EVENTS.AI_REWRITE_USED, { type: 'tailor' });

    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
