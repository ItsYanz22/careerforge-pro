import { Router, Response } from 'express';
import { AuthRequest, protect } from '../middlewares/auth';
import { exportLimiter } from '../middlewares/rateLimiter';
import { requireFeature } from '../middlewares/featureGate';
import { Resume } from '../models/Resume';
import { pdfService } from '../services/pdf.service';
import { docxService } from '../services/docx.service';
import { emailService } from '../services/email.service';
import { logEvent, EVENTS } from '../utils/analytics';

const router = Router();

// Apply rate limiter to all export routes
router.use(exportLimiter);

/**
 * POST /api/export/pdf
 * Generates a PDF by navigating Puppeteer to the /print/:resumeId route.
 * The print route renders the actual React template components.
 */
router.post('/pdf', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, fileName } = req.body;
    const userId = req.user!._id.toString();

    if (!resumeId) {
      return res.status(400).json({ success: false, error: 'resumeId is required' });
    }

    // Verify ownership
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    if (resume.userId.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to export this resume' });
    }

    // Feature Gating: Free users can export basic templates only
    // Premium template export requires Pro subscription
    const FREE_TEMPLATES = ['modern-blue', 'minimalist', 'classic', 'ats-optimized', 'modern', 'minimal', 'atsClassic'];
    const isPremiumTemplate = !FREE_TEMPLATES.includes(resume.template);
    
    if (isPremiumTemplate && req.user!.features?.premiumTemplates !== true) {
      return res.status(403).json({ 
        success: false, 
        error: 'Premium template export requires a Pro subscription',
        code: 'EXPORT_LIMIT_REACHED'
      });
    }

    // Extract JWT from Authorization header to pass to Puppeteer
    const token = req.headers.authorization?.split(' ')[1] ?? '';

    const resumeTitle = resume.title ?? 'resume';
    const safeFileName =
      fileName ?? `${resumeTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`;

    // Generate PDF — Puppeteer navigates to /print/:resumeId
    const result = await pdfService.generatePDF({
      resumeId,
      token,
      fileName: safeFileName,
    });

    // Fire-and-forget analytics
    logEvent(userId, EVENTS.PDF_EXPORT_INITIATED, { resumeId, template: resume.template });

    // Fire-and-forget export confirmation email
    emailService.sendExportConfirmationEmail(
      req.user!.email,
      req.user!.name,
      'PDF',
      resume.title ?? 'Resume',
      `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/dashboard`
    ).catch(() => {/* already logged inside emailService */});

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.fileName)}"`);
    res.setHeader('Content-Length', result.buffer.length);
    return res.send(result.buffer);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to generate PDF';
    const isTimeout = msg.includes('timed out');
    console.error('[export/pdf]', error);
    return res.status(isTimeout ? 504 : 500).json({ success: false, error: msg });
  }
});

/**
 * POST /api/export/pdf-base64
 * Same pipeline but returns base64 string.
 */
router.post('/pdf-base64', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId } = req.body;
    const userId = req.user!._id.toString();

    if (!resumeId) {
      return res.status(400).json({ success: false, error: 'resumeId is required' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    if (resume.userId.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const token = req.headers.authorization?.split(' ')[1] ?? '';

    const result = await pdfService.generatePDF({
      resumeId,
      token,
      fileName: `resume-${Date.now()}.pdf`,
    });

    logEvent(userId, EVENTS.PDF_EXPORT_INITIATED, { resumeId, format: 'base64' });

    return res.json({
      success: true,
      data: {
        pdf: result.buffer.toString('base64'),
        mimeType: result.mimeType,
        fileName: result.fileName,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to generate PDF';
    const isTimeout = msg.includes('timed out');
    console.error('[export/pdf-base64]', error);
    return res.status(isTimeout ? 504 : 500).json({ success: false, error: msg });
  }
});

/**
 * POST /api/export/docx
 * Generates a DOCX file using the docx library.
 * Gated: requires docxExport feature flag (Pro+).
 */
router.post('/docx', protect, requireFeature('docxExport'), async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId } = req.body;
    const userId = req.user!._id.toString();

    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ success: false, error: 'Resume not found' });
    if (resume.userId.toString() !== userId) return res.status(403).json({ success: false, error: 'Not authorized' });

    const buffer = await docxService.generateDOCX(resume.data);

    logEvent(userId, EVENTS.PDF_EXPORT_INITIATED, { resumeId, format: 'docx' });

    // Fire-and-forget export confirmation email
    emailService.sendExportConfirmationEmail(
      req.user!.email,
      req.user!.name,
      'DOCX',
      resume.title ?? 'Resume',
      `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/dashboard`
    ).catch(() => {/* already logged inside emailService */});

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resume.title ?? 'resume')}.docx"`);
    return res.send(buffer);
  } catch (error: any) {
    console.error('[export/docx]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
