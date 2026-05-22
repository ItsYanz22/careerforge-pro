import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middlewares/auth';
import { UserPreferences } from '../models/UserPreferences';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const router = Router();

// ── Helper: get or create preferences ────────────────────────────────────────
async function getOrCreatePreferences(userId: string) {
  let prefs = await UserPreferences.findOne({ userId });
  if (!prefs) {
    prefs = await UserPreferences.create({ userId });
  }
  return prefs;
}

/**
 * GET /api/settings/preferences
 * Returns the full preferences document for the authenticated user.
 */
router.get('/preferences', protect, async (req: AuthRequest, res: Response) => {
  try {
    const prefs = await getOrCreatePreferences(req.user!._id.toString());
    return res.json({ success: true, data: prefs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/settings/preferences
 * Partial update of any preferences fields.
 */
router.put('/preferences', protect, async (req: AuthRequest, res: Response) => {
  try {
    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: req.user!._id },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    return res.json({ success: true, data: prefs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/settings/profile
 * Update profile sub-document.
 */
router.put('/profile', protect, async (req: AuthRequest, res: Response) => {
  try {
    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: req.user!._id },
      { $set: { profile: req.body } },
      { new: true, upsert: true }
    );
    return res.json({ success: true, data: prefs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/settings/appearance
 * Update appearance sub-document.
 */
router.put('/appearance', protect, async (req: AuthRequest, res: Response) => {
  try {
    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: req.user!._id },
      { $set: { appearance: req.body } },
      { new: true, upsert: true }
    );
    return res.json({ success: true, data: prefs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/settings/notification-preferences
 * Update notification preferences sub-document.
 */
router.put('/notification-preferences', protect, async (req: AuthRequest, res: Response) => {
  try {
    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: req.user!._id },
      { $set: { notificationPreferences: req.body } },
      { new: true, upsert: true }
    );
    return res.json({ success: true, data: prefs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/settings/resume-preferences
 * Update resume preferences sub-document.
 */
router.put('/resume-preferences', protect, async (req: AuthRequest, res: Response) => {
  try {
    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: req.user!._id },
      { $set: { resumePreferences: req.body } },
      { new: true, upsert: true }
    );
    return res.json({ success: true, data: prefs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/settings/change-password
 * Change the authenticated user's password.
 */
router.post('/change-password', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'currentPassword and newPassword are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters',
      });
    }

    const user = await User.findById(req.user!._id).select('+password');
    if (!user || !user.password) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Record password change timestamp
    await UserPreferences.findOneAndUpdate(
      { userId: req.user!._id },
      { $set: { 'security.lastPasswordChangeAt': new Date() } },
      { upsert: true }
    );

    return res.json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
