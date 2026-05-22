import { AnalyticsEvent } from '../models/AnalyticsEvent';

/**
 * Fire-and-forget analytics event logger.
 * Never throws — failures are logged but do not affect the parent request.
 */
export function logEvent(
  userId: string,
  eventType: string,
  metadata: Record<string, unknown> = {}
): void {
  // Intentionally not awaited — fire and forget
  AnalyticsEvent.create({
    userId,
    eventType,
    metadata,
  }).catch((err) => {
    console.error(`[analytics] Failed to log event "${eventType}" for user ${userId}:`, err);
  });
}

// ── Event type constants ──────────────────────────────────────────────────────

export const EVENTS = {
  PDF_EXPORT_INITIATED: 'pdf_export_initiated',
  AI_REWRITE_USED: 'ai_rewrite_used',
  ATS_SCORE_GENERATED: 'ats_score_generated',
  TEMPLATE_CHANGED: 'template_changed',
  SUBSCRIPTION_CHECKOUT_STARTED: 'subscription_checkout_started',
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  AI_COACH_USED: 'ai_coach_used',
} as const;

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];
