import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Standard rate limit error response
 */
const rateLimitHandler = (_req: Request, res: Response) => {
  const retryAfter = Math.ceil(
    (res.getHeader('Retry-After') as number) || 60
  );
  res.status(429).json({
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter,
  });
};

/**
 * Auth endpoints — 20 requests per 15 minutes per IP
 * Protects against brute-force login/register attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.ip ?? 'unknown',
});

/**
 * Export endpoints — 10 requests per 15 minutes per authenticated user
 * Protects against PDF generation DoS
 */
export const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req: any) => req.user?._id?.toString() ?? req.ip ?? 'unknown',
});

/**
 * AI endpoints — 30 requests per 15 minutes per authenticated user
 * Protects against AI API abuse
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req: any) => req.user?._id?.toString() ?? req.ip ?? 'unknown',
});

/**
 * Stripe/subscription endpoints — 10 requests per 60 minutes per authenticated user
 * Protects against checkout session spam
 */
export const stripeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req: any) => req.user?._id?.toString() ?? req.ip ?? 'unknown',
});

/**
 * Comment endpoints — 10 comments per hour per IP
 * Protects against comment spam on public resume share links
 */
export const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.ip ?? 'unknown',
});
