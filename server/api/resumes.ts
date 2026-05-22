import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middlewares/auth';
import { checkResumeLimit } from '../middlewares/featureGate';
import { commentLimiter } from '../middlewares/rateLimiter';
import { Resume } from '../models/Resume';
import { ResumeVersion } from '../models/ResumeVersion';
import { Request } from 'express';
import crypto from 'crypto';

import { aiService } from '../services/ai.service';

const router = Router();

/**
 * GET /api/resumes/share/:shareId
 * Public endpoint to fetch a resume by shareId.
 */
router.get('/share/:shareId', async (req: Request, res: Response) => {
  try {
    const resume = await Resume.findOne({ shareId: req.params.shareId, isPublic: true });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found or private' });
    }
    return res.json({ success: true, data: resume });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

const MAX_VERSIONS = 20;

// ── Helper: create a version snapshot ────────────────────────────────────────
async function createVersionSnapshot(resumeId: string): Promise<void> {
  const resume = await Resume.findById(resumeId);
  if (!resume) return;

  // Get next version number
  const latest = await ResumeVersion.findOne({ resumeId }).sort({ versionNumber: -1 });
  const nextVersion = (latest?.versionNumber ?? 0) + 1;

  await ResumeVersion.create({
    resumeId,
    versionNumber: nextVersion,
    data: resume.data,
    template: resume.template,
    theme: resume.theme,
    font: resume.font,
    spacing: resume.spacing,
    atsScore: resume.atsScore,
  });

  // Prune old versions beyond MAX_VERSIONS
  const allVersions = await ResumeVersion.find({ resumeId }).sort({ versionNumber: -1 });
  if (allVersions.length > MAX_VERSIONS) {
    const toDelete = allVersions.slice(MAX_VERSIONS).map((v) => v._id);
    await ResumeVersion.deleteMany({ _id: { $in: toDelete } });
  }
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * GET /api/resumes
 */
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await Resume.find({ userId: req.user!._id }).sort({ updatedAt: -1 });
    return res.json({ success: true, data: resumes });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/resumes/:id
 */
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    return res.json({ success: true, data: resume });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/resumes
 * Gated: Free users limited to 1 resume
 */
router.post('/', protect, checkResumeLimit, async (req: AuthRequest, res: Response) => {
  try {
    const { title, template, data } = req.body;

    const resume = await Resume.create({
      userId: req.user!._id,
      title: title ?? 'Untitled Resume',
      template: template ?? 'modern-blue',
      data: data ?? {},
    });

    return res.status(201).json({ success: true, data: resume });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/resumes/:id
 */
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const updated = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/resumes/:id
 */
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    await ResumeVersion.deleteMany({ resumeId: resume._id });
    return res.json({ success: true, data: {} });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/resumes/:id/clone
 */
router.post('/:id/clone', protect, checkResumeLimit, async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const cloned = await Resume.create({
      userId: req.user!._id,
      title: title ?? `${resume.title} (Copy)`,
      template: resume.template,
      font: resume.font,
      theme: resume.theme,
      spacing: resume.spacing,
      data: resume.data,
    });

    return res.status(201).json({ success: true, data: cloned });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── Version History ───────────────────────────────────────────────────────────

/**
 * POST /api/resumes/:id/save
 * Explicitly save a version snapshot (called on major save actions).
 */
router.post('/:id/save', protect, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Apply any incoming changes first
    if (Object.keys(req.body).length > 0) {
      await Resume.findByIdAndUpdate(req.params.id, { $set: req.body });
    }

    await createVersionSnapshot(req.params.id);

    return res.json({ success: true, data: { message: 'Version saved' } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/resumes/:id/versions
 * List version summaries for a resume.
 */
router.get('/:id/versions', protect, async (req: AuthRequest, res: Response) => {
  try {
    // Verify ownership
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const versions = await ResumeVersion.find({ resumeId: req.params.id })
      .sort({ versionNumber: -1 })
      .select('versionNumber createdAt template theme font');

    return res.json({ success: true, data: versions });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/resumes/:id/versions/:versionId/restore
 * Restore a previous version. Saves a pre-restore snapshot first.
 */
router.post('/:id/versions/:versionId/restore', protect, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const version = await ResumeVersion.findOne({
      _id: req.params.versionId,
      resumeId: req.params.id,
    });
    if (!version) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }

    // Save a snapshot of the current state before overwriting (pre-restore safety)
    await createVersionSnapshot(req.params.id);

    // Restore the selected version
    const restored = await Resume.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          data: version.data,
          ...(version.template && { template: version.template }),
          ...(version.theme && { theme: version.theme }),
          ...(version.font && { font: version.font }),
          ...(version.spacing && { spacing: version.spacing }),
        },
      },
      { new: true }
    );

    return res.json({ success: true, data: restored });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/resumes/:id/versions/:versionId
 * Get full data for a specific version (for comparison).
 */
router.get('/:id/versions/:versionId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const version = await ResumeVersion.findOne({
      _id: req.params.versionId,
      resumeId: req.params.id,
    });
    if (!version) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }

    return res.json({ success: true, data: version });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── Feedback Comments ─────────────────────────────────────────────────────────

/**
 * POST /api/resumes/:shareId/comments
 * Public endpoint — allows recruiters to leave feedback on a shared resume.
 * Rate-limited to 10 comments per IP per hour.
 * Enforces a maximum of 50 comments per resume.
 */
router.post('/share/:shareId/comments', commentLimiter, async (req: Request, res: Response) => {
  try {
    const { text, recruiterName } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Comment text is required' });
    }

    const resume = await Resume.findOne({ shareId: req.params.shareId, isPublic: true });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found or private' });
    }

    if (resume.comments.length >= 50) {
      return res.status(429).json({ success: false, error: 'Comment limit reached for this resume' });
    }

    // Hash the IP address for abuse tracking — never store raw IP
    const rawIp = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex');

    const comment = {
      text: text.trim().slice(0, 1000),
      recruiterName: recruiterName ? String(recruiterName).slice(0, 100) : undefined,
      createdAt: new Date(),
      ipHash,
    };

    await Resume.findByIdAndUpdate(resume._id, { $push: { comments: comment } });

    return res.status(201).json({ success: true, data: { message: 'Comment submitted' } });
  } catch (error: any) {
    console.error('[resumes/POST /share/:shareId/comments]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/resumes/:id/comments
 * Protected — owner only. Returns all feedback comments for a resume.
 */
router.get('/:id/comments', protect, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Return comments sorted newest first, omitting ipHash
    const comments = [...resume.comments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(({ _id, text, recruiterName, createdAt }) => ({ _id, text, recruiterName, createdAt }));

    return res.json({ success: true, data: comments });
  } catch (error: any) {
    console.error('[resumes/GET /:id/comments]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/resumes/:id/comments/:commentId
 * Protected — owner only. Removes a specific comment by _id.
 */
router.delete('/:id/comments/:commentId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    await Resume.findByIdAndUpdate(req.params.id, {
      $pull: { comments: { _id: req.params.commentId } },
    });

    return res.json({ success: true, data: { message: 'Comment deleted' } });
  } catch (error: any) {
    console.error('[resumes/DELETE /:id/comments/:commentId]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/resumes/:id/skill-suggestions
 * Get AI-powered skill suggestions based on resume content.
 */
router.get('/:id/skill-suggestions', protect, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const suggestions = await aiService.getSkillSuggestions(resume.data);
    
    return res.json({ success: true, data: suggestions });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
