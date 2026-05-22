import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middlewares/auth';
import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { User } from '../models/User';
import { Resume } from '../models/Resume';
import { EVENTS } from '../utils/analytics';
import { aiService } from '../services/ai.service';

const router = Router();

/**
 * GET /api/analytics/dashboard
 * Fetch user-specific analytics data for the dashboard.
 */
router.get('/dashboard', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;

    // 1. Get Resume scores over time
    const scoreEvents = await AnalyticsEvent.find({
      userId,
      eventType: EVENTS.ATS_SCORE_GENERATED,
    })
    .sort({ createdAt: 1 })
    .limit(20);

    const scoreHistory = scoreEvents.map(e => ({
      date: e.createdAt,
      score: e.metadata.score,
      title: e.metadata.resumeTitle || 'Resume'
    }));

    // 2. AI Usage breakdown
    const aiEvents = await AnalyticsEvent.find({
      userId,
      eventType: EVENTS.AI_REWRITE_USED,
    });

    const aiBreakdown = {
      bulletRewrite: aiEvents.filter(e => e.metadata.type === 'bullet').length,
      summaryRewrite: aiEvents.filter(e => e.metadata.type === 'summary').length,
      coach: aiEvents.filter(e => e.metadata.type === 'coach').length,
      tailor: aiEvents.filter(e => e.metadata.type === 'tailor').length,
    };

    // 3. Export count
    const exportCount = await AnalyticsEvent.countDocuments({
      userId,
      eventType: EVENTS.PDF_EXPORT_INITIATED,
    });

    // 4. Activity per day (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = await AnalyticsEvent.aggregate([
      { 
        $match: { 
          userId, 
          createdAt: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 5. General stats
    const resumeCount = await Resume.countDocuments({ userId });
    const user = await User.findById(userId);

    return res.json({
      success: true,
      data: {
        scoreHistory,
        aiBreakdown,
        exportCount,
        recentActivity,
        resumeCount,
        aiCredits: {
          used: user?.aiUsageCount || 0,
          total: user?.currentPlan === 'free' ? 20 : user?.currentPlan === 'pro' ? 200 : 1000,
          resetDate: user?.aiUsageResetDate
        },
        currentPlan: user?.currentPlan,
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/insights
 * Generates AI-powered insights based on user activity and performance.
 */
router.get('/insights', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    
    // Gather data for prompt
    const scoreEvents = await AnalyticsEvent.find({ userId, eventType: EVENTS.ATS_SCORE_GENERATED }).sort({ createdAt: -1 }).limit(5);
    const avgScore = scoreEvents.length > 0 ? scoreEvents.reduce((acc, curr) => acc + (curr.metadata.score || 0), 0) / scoreEvents.length : 0;
    const resumeCount = await Resume.countDocuments({ userId });
    
    const prompt = `
      Analyze the following user career performance data and provide 3 short, actionable insights or tips:
      - Total Resumes Created: ${resumeCount}
      - Average ATS Score (recent): ${avgScore.toFixed(1)}/100
      - AI Credits Used: ${req.user!.aiUsageCount}
      
      Format the response as a JSON array of strings. Keep them encouraging but professional.
    `;

    const response = await aiService.generateText(prompt);
    
    // Try to extract JSON array
    let insights = [];
    try {
      const match = response.match(/\[.*\]/s);
      if (match) insights = JSON.parse(match[0]);
      else insights = [response];
    } catch {
      insights = [response];
    }

    return res.json({ success: true, data: insights });
  } catch (error: any) {
    console.error('[analytics/insights]', error);
    return res.json({ 
      success: true, 
      data: [
        "Keep building! You're making great progress.", 
        "Try tailoring your next resume to a specific job description.", 
        "Use the AI Coach to refine your bullet points."
      ] 
    });
  }
});

export default router;
