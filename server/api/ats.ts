import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middlewares/auth';
import { Resume } from '../models/Resume';
import { ATSReport } from '../models/ATSReport';
import { calculateATSScore, calculateATSScoreFromText } from '../services/ats.service';
import { logEvent, EVENTS } from '../utils/analytics';
import { createRequire } from 'module';
// @ts-ignore
import multer from 'multer';

const require = createRequire(import.meta.url);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

/**
 * POST /api/ats/analyze
 * Real deterministic ATS scoring — no Math.random().
 */
router.post('/analyze', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Run real ATS scoring engine
    const { aiService } = await import('../services/ai.service');
    let result: any;
    
    if (jobDescription && jobDescription.trim().length > 20) {
      result = await aiService.analyzeResumeATS(JSON.stringify(resume.data), jobDescription);
    } else {
      result = calculateATSScore(resume.data, jobDescription);
    }

    // Persist the report
    const report = await ATSReport.create({
      resumeId,
      userId: req.user!._id,
      overallScore: result.overallScore,
      keywordMatch: result.keywordMatch,
      formattingScore: result.formattingScore,
      readabilityScore: result.readabilityScore,
      completeness: result.completenessScore,
      recruiterLikelihood: result.recruiterLikelihood,
      hardSkills: result.hardSkills,
      softSkills: result.softSkills,
      overallFeedback: result.overallFeedback,
      issues: result.issues || [],
      suggestions: result.suggestions,
    });

    // Fire analytics event
    logEvent(req.user!._id.toString(), EVENTS.ATS_SCORE_GENERATED, {
      resumeId,
      score: result.overallScore,
    });

    return res.json({
      success: true,
      data: {
        ...report.toObject(),
        matchedKeywords: result.foundKeywords || result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        hardSkills: result.hardSkills || [],
        softSkills: result.softSkills || [],
        recruiterLikelihood: result.recruiterLikelihood || 0,
        overallFeedback: result.overallFeedback || '',
      },
    });
  } catch (error: any) {
    console.error('[ats/analyze]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ats/job-description
 * Analyze a job description and extract keywords.
 */
router.post('/job-description', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ success: false, error: 'jobDescription is required' });
    }

    const { extractKeywords } = await import('../services/ats.service');
    const keywords = extractKeywords(jobDescription, 30);

    return res.json({
      success: true,
      data: {
        keywords: keywords.map((kw) => ({ keyword: kw, category: 'skill', importance: 80 })),
        skills: keywords.slice(0, 15).map((kw) => ({ skill: kw })),
        tools: keywords.slice(15, 25),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ats/analyze-file
 * Analyze an uploaded local file (PDF/TXT)
 */
router.post('/analyze-file', protect, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const jobDescription = req.body.jobDescription || '';
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    let text = '';
    if (file.mimetype === 'application/pdf') {
      try {
        console.log('📍 ATS: Starting PDF parse - buffer size:', file.buffer.length);
        
        // Try pdf-parse first
        try {
          const pdfParse = require('pdf-parse');
          const pdfData = await pdfParse(file.buffer);
          text = pdfData.text || '';
          
          if (!text && pdfData.data?.text) {
            text = pdfData.data.text;
          }
          
          console.log('📍 ATS: pdf-parse returned', text?.length, 'chars');
        } catch (e) {
          console.log('⚠️ ATS: pdf-parse failed, trying raw extraction');
        }
        
        // Fallback: Raw buffer extraction
        if (!text || text.trim().length === 0) {
          const bufferText = file.buffer.toString('latin1');
          const matches = bufferText.match(/BT[\s\S]*?ET/g) || [];
          
          if (matches.length > 0) {
            text = matches
              .join(' ')
              .replace(/BT|ET|Tj|TJ|\/F\d+|re|m|l|f|S/g, ' ')
              .replace(/\(([^)]*)\)/g, (match) => {
                return match.slice(1, -1).replace(/\\\(/g, '(').replace(/\\\)/g, ')');
              })
              .replace(/[^\w\s\n\-\.\,]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
          
          if (!text || text.trim().length === 0) {
            text = bufferText.replace(/[^\x20-\x7E\x80-\xFF\n]/g, ' ').replace(/\s+/g, ' ').trim();
          }
        }
        
        if (!text || text.trim().length === 0) {
          throw new Error('PDF appears to be empty or contains no extractable text');
        }
        
        console.log(`✓ ATS: PDF parsed, extracted ${text.length} characters`);
      } catch (pdfError: any) {
        console.error('❌ ATS: PDF parsing failed:', pdfError?.message);
        return res.status(400).json({ 
          success: false, 
          error: 'Failed to parse PDF file. Please upload a TXT file or try a different PDF.' 
        });
      }
    } else if (file.mimetype === 'text/plain') {
      text = file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported file type. Please upload PDF or TXT.' });
    }

    if (!text.trim()) {
      return res.status(400).json({ success: false, error: 'Could not extract text from file.' });
    }

    const { aiService } = await import('../services/ai.service');
    let result: any;
    
    console.log(`[ats/analyze-file] jobDescription length: ${jobDescription?.length}`);
    if (jobDescription && jobDescription.trim().length > 20) {
      console.log('[ats/analyze-file] Using AI Analysis');
      result = await aiService.analyzeResumeATS(text, jobDescription);
      console.log('[ats/analyze-file] AI Result received');
    } else {
      console.log('[ats/analyze-file] Using Deterministic Analysis (Fallback)');
      result = calculateATSScoreFromText(text, jobDescription);
    }

    logEvent(req.user!._id.toString(), EVENTS.ATS_SCORE_GENERATED, {
      type: 'local_file',
      score: result.overallScore,
    });

    return res.json({
      success: true,
      data: {
        _id: 'local-' + Date.now(),
        overallScore: result.overallScore,
        keywordMatch: result.keywordMatch,
        formattingScore: result.formattingScore,
        readabilityScore: result.readabilityScore,
        completeness: result.completenessScore,
        issues: result.issues,
        suggestions: result.suggestions,
        matchedKeywords: result.foundKeywords || result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        hardSkills: result.hardSkills || [],
        softSkills: result.softSkills || [],
        recruiterLikelihood: result.recruiterLikelihood || 0,
        overallFeedback: result.overallFeedback || '',
      },
    });
  } catch (error: any) {
    console.error('[ats/analyze-file]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ats/advanced-metrics
 * Calculate advanced ATS metrics including semantic similarity, keyword density, and heatmap
 */
router.post('/advanced-metrics', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const { calculateAdvancedATSMetrics } = await import('../services/advanced-ats.service');
    const metrics = calculateAdvancedATSMetrics(resume.data, jobDescription);

    logEvent(req.user!._id.toString(), EVENTS.ATS_SCORE_GENERATED, {
      type: 'advanced_metrics',
      resumeId,
    });

    return res.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    console.error('[ats/advanced-metrics]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ats/keyword-density
 * Analyze keyword density score for ATS optimization
 */
router.post('/keyword-density', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, keywords } = req.body;

    if (!resumeId || !keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ success: false, error: 'resumeId and keywords array are required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const { calculateKeywordDensity, resumeToText } = await import('../services/advanced-ats.service');
    const resumeText = resumeToText(resume.data);
    const density = calculateKeywordDensity(resumeText, keywords);

    logEvent(req.user!._id.toString(), EVENTS.ATS_SCORE_GENERATED, {
      type: 'keyword_density',
      resumeId,
      density,
    });

    return res.json({
      success: true,
      data: {
        keywordDensity: density,
        recommendation: density < 3 ? 'Increase keyword frequency' : 
                       density > 8 ? 'Reduce keyword density (avoid stuffing)' :
                       'Keyword density is optimal',
      },
    });
  } catch (error: any) {
    console.error('[ats/keyword-density]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ats/semantic-similarity
 * Calculate semantic similarity between resume and job description
 */
router.post('/semantic-similarity', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ success: false, error: 'resumeId and jobDescription are required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const { calculateSemanticSimilarity, extractKeywords, resumeToText } = await import('../services/advanced-ats.service');
    const jdKeywords = extractKeywords(jobDescription, 40);
    const resumeText = resumeToText(resume.data);
    const resumeKeywords = extractKeywords(resumeText, 30);
    
    const similarity = calculateSemanticSimilarity(resumeKeywords, jdKeywords);

    logEvent(req.user!._id.toString(), EVENTS.ATS_SCORE_GENERATED, {
      type: 'semantic_similarity',
      resumeId,
      similarity,
    });

    return res.json({
      success: true,
      data: {
        semanticSimilarity: similarity,
        interpretation: similarity > 80 ? 'Excellent match' :
                       similarity > 60 ? 'Good match' :
                       similarity > 40 ? 'Moderate match' :
                       'Weak match - consider adding more relevant keywords',
      },
    });
  } catch (error: any) {
    console.error('[ats/semantic-similarity]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/ats/heatmap-analysis
 * Analyze resume section quality with heatmap visualization
 */
router.post('/heatmap-analysis', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, error: 'resumeId is required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const { analyzeResumeSections, extractKeywords } = await import('../services/advanced-ats.service');
    const jdKeywords = jobDescription ? extractKeywords(jobDescription, 40) : [];
    const { heatmap, completeness } = analyzeResumeSections(resume.data, jdKeywords);

    logEvent(req.user!._id.toString(), EVENTS.ATS_SCORE_GENERATED, {
      type: 'heatmap_analysis',
      resumeId,
    });

    return res.json({
      success: true,
      data: {
        heatmap,
        completeness,
        averageScore: Math.round(Object.values(heatmap).reduce((a, b) => a + b) / Object.values(heatmap).length),
        weakestSections: Object.entries(heatmap)
          .sort(([, a], [, b]) => a - b)
          .slice(0, 3)
          .map(([section, score]) => ({ section, score })),
      },
    });
  } catch (error: any) {
    console.error('[ats/heatmap-analysis]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

