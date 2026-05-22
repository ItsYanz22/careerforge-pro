import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { protect, AuthRequest } from '../middlewares/auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { authLimiter } from '../middlewares/rateLimiter';
import { emailService } from '../services/email.service';

const router = Router();

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    await Subscription.create({
      userId: user._id,
      plan: 'free',
    });

    // Return full user object (password excluded) so authStore gets features/currentPlan
    const fullUser = await User.findById(user._id).select('-password');

    // Fire-and-forget email
    emailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

    res.status(201).json({
      success: true,
      data: {
        user: fullUser,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Return full user object (password excluded) so authStore gets features/currentPlan
    const fullUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      data: {
        user: fullUser,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/logout', protect, (_req: Request, res: Response) => {
  res.json({ success: true, data: {} });
});

export default router;
