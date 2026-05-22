import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import { protect, AuthRequest } from '../middlewares/auth'
import { ResumeShare } from '../models/ResumeShare'
import { Resume } from '../models/Resume'

const router = Router()

/**
 * Share Resume Endpoints
 * Handles resume sharing, permissions, and collaboration.
 * All responses use the standard { success, data, error } format.
 */

// ── GET /api/shares — List all shares for the authenticated user ──────────────
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id

    const shares = await ResumeShare.find({ userId })
      .sort({ createdAt: -1 })
      .select('-shareToken')

    return res.json({ success: true, data: shares })
  } catch (error: any) {
    console.error('[shares/GET /]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch shares' })
  }
})

// ── POST /api/shares/create — Create a new share ──────────────────────────────
router.post('/create', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id
    const { resumeId, shareType, permissions, expiresAt, sharedWith, metadata } = req.body

    // Verify resume belongs to user
    const resume = await Resume.findOne({ _id: resumeId, userId })
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' })
    }

    // Create share record
    const share = await ResumeShare.create({
      resumeId,
      userId,
      shareType,
      permissions: {
        canView: permissions?.canView !== false,
        canComment: permissions?.canComment !== false,
        canDownload: permissions?.canDownload === true,
        canShare: permissions?.canShare === true,
        canEdit: false, // Never allow edit via share
      },
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      sharedWith: sharedWith || [],
      metadata: {
        isPublic: shareType === 'public',
        allowComments: metadata?.allowComments !== false,
        allowDownload: metadata?.allowDownload === true,
        customMessage: metadata?.customMessage,
      },
    })

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const shareLink = `${frontendUrl}/share/${share.shareToken}`

    return res.status(201).json({
      success: true,
      data: {
        _id: share._id,
        shareToken: share.shareToken,
        shareLink,
        shareType: share.shareType,
        permissions: share.permissions,
        expiresAt: share.expiresAt,
        metadata: share.metadata,
      },
    })
  } catch (error: any) {
    console.error('[shares/POST /create]', error)
    return res.status(500).json({ success: false, error: 'Failed to create share' })
  }
})

// ── GET /api/shares/:shareToken — Get share details (public access) ───────────
router.get('/:shareToken', async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params

    const share = await ResumeShare.findOne({ shareToken })
    if (!share) {
      return res.status(404).json({ success: false, error: 'Share not found or expired' })
    }

    // Check expiration
    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(410).json({ success: false, error: 'Share link has expired' })
    }

    // Record view (fire-and-forget)
    const viewerEmail = (req as any).user?.email || 'anonymous'
    ResumeShare.updateOne(
      { _id: share._id },
      {
        $addToSet: {
          viewedBy: {
            userId: (req as any).user?._id,
            email: viewerEmail,
            viewedAt: new Date(),
          },
        },
      }
    ).catch((err: any) => console.error('[shares/view-record]', err))

    // Get resume data
    const resume = await Resume.findById(share.resumeId)
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' })
    }

    return res.json({
      success: true,
      data: {
        share: {
          _id: share._id,
          permissions: share.permissions,
          metadata: share.metadata,
          comments: share.metadata.allowComments ? share.comments : [],
          viewCount: share.viewedBy.length,
        },
        resume,
      },
    })
  } catch (error: any) {
    console.error('[shares/GET /:shareToken]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch share' })
  }
})

// ── POST /api/shares/:shareToken/comments — Add comment (public) ──────────────
router.post('/:shareToken/comments', async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params
    const { text, section } = req.body

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Comment text is required' })
    }

    const share = await ResumeShare.findOne({ shareToken })
    if (!share) {
      return res.status(404).json({ success: false, error: 'Share not found' })
    }

    if (!share.metadata.allowComments) {
      return res.status(403).json({ success: false, error: 'Comments are not allowed for this share' })
    }

    const comment = {
      id: crypto.randomUUID(),
      userId: (req as any).user?._id,
      userName: (req as any).user?.name || 'Anonymous',
      text: text.trim().slice(0, 1000),
      section,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolved: false,
    }

    await ResumeShare.updateOne(
      { _id: share._id },
      { $push: { comments: comment } }
    )

    return res.status(201).json({ success: true, data: { comment } })
  } catch (error: any) {
    console.error('[shares/POST /:shareToken/comments]', error)
    return res.status(500).json({ success: false, error: 'Failed to add comment' })
  }
})

// ── PUT /api/shares/:shareId/permissions — Update share permissions ───────────
router.put('/:shareId/permissions', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { shareId } = req.params
    const { permissions } = req.body
    const userId = req.user!._id

    const share = await ResumeShare.findOne({ _id: shareId, userId })
    if (!share) {
      return res.status(404).json({ success: false, error: 'Share not found' })
    }

    await ResumeShare.updateOne(
      { _id: shareId },
      {
        $set: {
          permissions: {
            canView: permissions.canView !== false,
            canComment: permissions.canComment !== false,
            canDownload: permissions.canDownload === true,
            canShare: permissions.canShare === true,
            canEdit: false,
          },
        },
      }
    )

    return res.json({ success: true, data: { message: 'Permissions updated' } })
  } catch (error: any) {
    console.error('[shares/PUT /:shareId/permissions]', error)
    return res.status(500).json({ success: false, error: 'Failed to update permissions' })
  }
})

// ── DELETE /api/shares/:shareId — Revoke share ────────────────────────────────
router.delete('/:shareId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { shareId } = req.params
    const userId = req.user!._id

    const result = await ResumeShare.deleteOne({ _id: shareId, userId })
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Share not found' })
    }

    return res.json({ success: true, data: { message: 'Share revoked' } })
  } catch (error: any) {
    console.error('[shares/DELETE /:shareId]', error)
    return res.status(500).json({ success: false, error: 'Failed to revoke share' })
  }
})

// ── GET /api/shares/:shareId/analytics — Share analytics (owner only) ─────────
router.get('/:shareId/analytics', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { shareId } = req.params
    const userId = req.user!._id

    const share = await ResumeShare.findOne({ _id: shareId, userId })
    if (!share) {
      return res.status(404).json({ success: false, error: 'Share not found' })
    }

    const analytics = {
      totalViews: share.viewedBy.length,
      uniqueViewers: [...new Set(share.viewedBy.map((v: any) => v.email))].length,
      totalComments: share.comments.length,
      resolvedComments: share.comments.filter((c: any) => c.resolved).length,
      views: share.viewedBy.map((v: any) => ({
        email: v.email,
        viewedAt: v.viewedAt,
      })),
      comments: share.comments,
      createdAt: share.createdAt,
      expiresAt: share.expiresAt,
    }

    return res.json({ success: true, data: analytics })
  } catch (error: any) {
    console.error('[shares/GET /:shareId/analytics]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch analytics' })
  }
})

// ── PATCH /api/shares/:shareId/comments/:commentId/resolve ───────────────────
router.patch('/:shareId/comments/:commentId/resolve', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { shareId, commentId } = req.params
    const userId = req.user!._id

    const share = await ResumeShare.findOne({ _id: shareId, userId })
    if (!share) {
      return res.status(404).json({ success: false, error: 'Share not found' })
    }

    await ResumeShare.updateOne(
      { _id: shareId, 'comments.id': commentId },
      {
        $set: {
          'comments.$.resolved': true,
          'comments.$.updatedAt': new Date(),
        },
      }
    )

    return res.json({ success: true, data: { message: 'Comment marked as resolved' } })
  } catch (error: any) {
    console.error('[shares/PATCH /:shareId/comments/:commentId/resolve]', error)
    return res.status(500).json({ success: false, error: 'Failed to resolve comment' })
  }
})

export default router
