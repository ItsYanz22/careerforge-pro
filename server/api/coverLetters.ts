import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middlewares/auth';
import { requireFeature } from '../middlewares/featureGate';
import { CoverLetter } from '../models/CoverLetter';
import { Resume } from '../models/Resume';
import { aiService } from '../services/ai.service';
import { pdfService } from '../services/pdf.service';
import { resumeParserService } from '../services/resume-parser.service';
// @ts-ignore
import multer from 'multer';

const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});


const router = Router();

/**
 * GET /api/cover-letters
 * List all cover letters for the authenticated user.
 */
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const letters = await CoverLetter.find({ userId: req.user!._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: letters });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/cover-letters/generate
 * Generate a cover letter using Gemini AI.
 * Gated: requires coverLetterGenerator feature (Pro+).
 * 
 * Supports two modes:
 * - Mode 1: Existing resume (resumeId provided)
 * - Mode 2: Uploaded resume (parsedData provided)
 */
router.post(
  '/generate',
  protect,
  requireFeature('coverLetterGenerator'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { resumeId, jobTitle, companyName, tone = 'professional', parsedData, uploadedResumeName } = req.body;

      // Validate required fields
      if (!jobTitle?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Job title is required',
        });
      }

      if (!companyName?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Company name is required',
        });
      }

      if (!['professional', 'friendly', 'confident'].includes(tone)) {
        return res.status(400).json({
          success: false,
          error: 'Tone must be one of: professional, friendly, confident',
        });
      }

      // Determine source type and validate accordingly
      let sourceType: 'existing' | 'uploaded' = 'existing';
      let resumeData = null;
      let dbResumeId = null;

      if (resumeId) {
        // MODE 1: Existing resume from database
        const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });
        if (!resume) {
          return res.status(404).json({ success: false, error: 'Resume not found' });
        }
        resumeData = resume.data;
        dbResumeId = resumeId;
        sourceType = 'existing';
      } else if (parsedData) {
        // MODE 2: Uploaded resume (already parsed)
        resumeData = parsedData;
        sourceType = 'uploaded';
      } else {
        return res.status(400).json({
          success: false,
          error: 'Please select an existing resume or upload one',
        });
      }

      if (!resumeData) {
        return res.status(400).json({ 
          success: false, 
          error: 'Could not retrieve resume data' 
        });
      }

      // Build structured prompt
      const personal = resumeData.personal ?? {};
      const fullName = [personal.firstName, personal.lastName].filter(Boolean).join(' ') || 'Candidate';
      const experienceSummary = (resumeData.experience ?? [])
        .slice(0, 3)
        .map((e: any) => `${e.jobTitle} at ${e.company}`)
        .join(', ');

      const jobDescription = `Position: ${jobTitle} at ${companyName}`;
      
      console.group('📄 Cover Letter Generation');
      console.log('Source Type:', sourceType);
      console.log('Resume Data Keys:', Object.keys(resumeData));
      console.log('Job:', jobTitle, 'at', companyName);
      console.log('Tone:', tone);
      console.groupEnd();

      const result = await aiService.generateCoverLetter(
        { ...resumeData, fullName, experienceSummary },
        jobDescription,
        tone
      );

      // Store the generated cover letter with source metadata
      const coverLetter = await CoverLetter.create({
        userId: req.user!._id,
        resumeId: dbResumeId || null,
        sourceType,
        uploadedResumeName: uploadedResumeName || null,
        uploadedResumeText: sourceType === 'uploaded' ? resumeData.fullText : null,
        parsedResumeData: sourceType === 'uploaded' ? resumeData : null,
        title: `Cover Letter — ${jobTitle} at ${companyName}`,
        jobDescription,
        tone,
        content: result.coverLetter,
      });

      console.log('✓ Cover Letter created:', coverLetter._id);

      return res.status(201).json({ success: true, data: coverLetter });
    } catch (error: any) {
      console.error('❌ [cover-letters/generate]', error);
      const message = error.message || 'Failed to generate cover letter';
      return res.status(500).json({ success: false, error: message });
    }
  }
);

/**
 * POST /api/cover-letters/export-pdf
 * Export a cover letter as PDF using the same Puppeteer pipeline.
 * Gated: requires coverLetterGenerator feature (Pro+).
 */
router.post(
  '/export-pdf',
  protect,
  requireFeature('coverLetterGenerator'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { coverLetterId } = req.body;

      if (!coverLetterId) {
        return res.status(400).json({ success: false, error: 'coverLetterId is required' });
      }

      const letter = await CoverLetter.findOne({
        _id: coverLetterId,
        userId: req.user!._id,
      });

      if (!letter) {
        return res.status(404).json({ success: false, error: 'Cover letter not found' });
      }

      // Handle both existing resumes and uploaded resumes
      if (!letter.resumeId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cannot export PDF for cover letters created from uploaded resumes. Please use existing resumes for PDF export.' 
        });
      }

      const token = req.headers.authorization?.split(' ')[1] ?? '';
      const result = await pdfService.generatePDF({
        resumeId: letter.resumeId.toString(),
        token,
        fileName: `cover-letter-${Date.now()}.pdf`,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(result.fileName)}"`
      );
      res.setHeader('Content-Length', result.buffer.length);
      return res.send(result.buffer);
    } catch (error: any) {
      console.error('[cover-letters/export-pdf]', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * POST /api/cover-letters
 * Save a manually written cover letter.
 */
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { title, resumeId, jobDescription, tone, content } = req.body;

    if (!title || !resumeId || !content) {
      return res.status(400).json({
        success: false,
        error: 'title, resumeId, and content are required',
      });
    }

    const letter = await CoverLetter.create({
      userId: req.user!._id,
      resumeId,
      title,
      jobDescription,
      tone,
      content,
    });

    return res.status(201).json({ success: true, data: letter });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/cover-letters/:id
 */
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const letter = await CoverLetter.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      req.body,
      { new: true }
    );
    if (!letter) {
      return res.status(404).json({ success: false, error: 'Cover letter not found' });
    }
    return res.json({ success: true, data: letter });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/cover-letters/:id
 */
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const letter = await CoverLetter.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!._id,
    });
    if (!letter) {
      return res.status(404).json({ success: false, error: 'Cover letter not found' });
    }
    return res.json({ success: true, data: {} });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/cover-letters/parse-resume
 * Upload and parse a resume file for context.
 * 
 * Returns structured resume data extracted from uploaded file.
 */
router.post(
  '/parse-resume',
  protect,
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No file uploaded' 
        });
      }

      console.group('📤 Resume Parse Request');
      console.log('File:', req.file.originalname);
      console.log('Size:', req.file.size, 'bytes');
      console.log('MIME Type:', req.file.mimetype);
      console.groupEnd();

      // Parse the file
      const text = await resumeParserService.parseBuffer(req.file.buffer, req.file.mimetype);

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Could not extract text from file. Please ensure the file is not empty.' 
        });
      }

      console.log('✓ Extracted text length:', text.length);

      // Extract structured data using AI
      const structuredData = await resumeParserService.extractStructuredData(text);

      if (!structuredData) {
        return res.status(400).json({ 
          success: false, 
          error: 'Could not parse resume data' 
        });
      }

      console.log('✓ Parsed resume data:', {
        skills: structuredData.skills?.length || 0,
        experience: structuredData.experience?.length || 0,
        education: structuredData.education?.length || 0,
        projects: structuredData.projects?.length || 0,
        fullText: structuredData.fullText?.length || 0
      });

      return res.json({
        success: true,
        data: structuredData
      });
    } catch (error: any) {
      console.error('❌ [cover-letters/parse-resume]', error);
      
      let errorMsg = 'Failed to parse resume file';
      if (error.message.includes('Unsupported file type')) {
        errorMsg = error.message;
      } else if (error.message.includes('Failed to parse')) {
        errorMsg = error.message;
      }
      
      return res.status(400).json({ 
        success: false, 
        error: errorMsg 
      });
    }
  }
);

export default router;
