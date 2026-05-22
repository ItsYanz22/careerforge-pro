# Implementation Tasks

## Task Overview

This task list covers the full Week 3 implementation for CareerForge Pro: PDF export pipeline, Stripe subscriptions, feature gating, resume versioning, AI metering, rate limiting, analytics, centralized state, and premium UI redesign.

---

## 1. Foundation & Infrastructure

- [ ] 1.1 Install required dependencies (`puppeteer`, `stripe`, `express-rate-limit`, `isomorphic-dompurify`, `framer-motion`, `zustand`)
- [ ] 1.2 Add `aiUsageCount: number` and `aiUsageResetDate: Date` fields to `server/models/User.ts` and update `IUser` interface
- [ ] 1.3 Extend `server/models/ResumeVersion.ts` to store `template`, `theme`, `font`, and `spacing` fields alongside the full data snapshot
- [ ] 1.4 Create `server/models/AnalyticsEvent.ts` with fields `userId`, `eventType`, `metadata`, `createdAt` and a 90-day TTL index
- [ ] 1.5 Update `src/types/index.ts` to add `UserFeatures`, `ExportStage`, `SubscriptionStore`, `ExportStore`, and `AnalyticsEvent` types
- [ ] 1.6 Create `server/utils/validateEnv.ts` that validates all required env vars at startup and throws descriptive errors for missing ones
- [ ] 1.7 Update `.env.example` with all required variables and inline comments

---

## 2. Feature Gating Middleware

- [ ] 2.1 Rewrite `server/middlewares/featureGate.ts` — fix duplicate `getUserFeatureFlags` declaration, remove `requirePro`/`requireEnterprise` plan-name comparisons, ensure `requireFeature(feature)` reads only from `req.user.features`
- [ ] 2.2 Update `getUserFeatureFlags` so Pro returns `{ premiumTemplates, unlimitedExports, advancedAI, coverLetterGenerator: true, advancedATS: false, unlimitedResumes: false }` and Enterprise returns all `true`
- [ ] 2.3 Add `checkResumeLimit` middleware that reads `features.unlimitedResumes` and counts existing resumes before allowing `POST /api/resumes`
- [ ] 2.4 Add `checkAIUsage` middleware that resets `aiUsageCount` if `aiUsageResetDate` is past, enforces limit of 5 for Free users, and increments count on success

---

## 3. API Rate Limiting

- [ ] 3.1 Create `server/middlewares/rateLimiter.ts` exporting `authLimiter` (20/15min per IP), `exportLimiter` (10/15min per user), `aiLimiter` (30/15min per user), `stripeLimiter` (10/60min per user)
- [ ] 3.2 Apply rate limiters in `server/index.ts` to their respective route groups; exempt `POST /api/subscriptions/webhook`
- [ ] 3.3 Configure all limiters to respond with `{ success: false, error: "Too many requests...", retryAfter }` on HTTP 429

---

## 4. PDF Service

- [ ] 4.1 Rewrite `server/services/pdf.service.ts` — implement singleton browser with `executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined`, `--no-sandbox`, `--disable-setuid-sandbox`, `--disable-dev-shm-usage`
- [ ] 4.2 Implement `generatePDF(options)` method: open new page per request, set A4 viewport (794×1123, deviceScaleFactor 1), `waitUntil: 'networkidle0'`, await `document.fonts.ready`, call `page.pdf({ format: 'A4', printBackground: true, margin: 0 })`
- [ ] 4.3 Add 30-second timeout wrapper around `generatePDF` that rejects with a timeout error
- [ ] 4.4 Add `closeBrowser()` method and wire it to process `SIGTERM`/`SIGINT` for graceful shutdown

---

## 5. Input Sanitization

- [ ] 5.1 Create `server/utils/sanitize.ts` using `isomorphic-dompurify` that recursively sanitizes all string fields in a resume data object, stripping `<script>`, `<iframe>`, `<object>`, and event handler attributes
- [ ] 5.2 Log a warning with field name and userId when sanitization removes content, but continue processing

---

## 6. Export API

- [ ] 6.1 Rewrite `server/api/export.ts` — implement `POST /api/export/pdf`: authenticate, verify resume ownership, sanitize data, call `pdfService.generatePDF`, return buffer with correct `Content-Type` and `Content-Disposition` headers
- [ ] 6.2 Implement `POST /api/export/pdf-base64`: same pipeline but return `{ success: true, data: { pdf, mimeType, fileName } }`
- [ ] 6.3 Add export limit check for Free users (block if `!features.unlimitedExports` and resume count > 1)
- [ ] 6.4 Fire-and-forget analytics event `pdf_export_initiated` after successful export
- [ ] 6.5 Apply `exportLimiter` rate limiter to all export routes

---

## 7. Resume Version History API

- [ ] 7.1 Add `POST /api/resumes/:id/save` endpoint in `server/api/resumes.ts` that creates a `ResumeVersion` snapshot (full data + template/theme/font/spacing + auto-incremented `versionNumber`) and prunes versions beyond 20
- [ ] 7.2 Add `GET /api/resumes/:id/versions` endpoint returning version summaries (`versionNumber`, `createdAt`, `template`, `theme`)
- [ ] 7.3 Add `POST /api/resumes/:id/versions/:versionId/restore` endpoint that saves a pre-restore snapshot, then overwrites the resume with the selected version's data

---

## 8. Stripe Subscription API

- [ ] 8.1 Rewrite `server/api/subscriptions.ts` — implement `POST /api/subscriptions/checkout`: validate `planType`, create/retrieve Stripe customer, create Checkout Session with `metadata: { userId, planType }`, persist `stripeCustomerId`, return `{ sessionId, url }`
- [ ] 8.2 Implement `POST /api/subscriptions/webhook` with raw body parsing: verify signature via `stripe.webhooks.constructEvent`, handle `checkout.session.completed` (update User + Subscription docs), `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] 8.3 Implement `GET /api/subscriptions/current`: return `{ plan, status, features, startDate, endDate, subscription }` from User doc
- [ ] 8.4 Implement `GET /api/subscriptions/plans`: return static Free/Pro/Enterprise plan definitions (no auth required)
- [ ] 8.5 Implement `POST /api/subscriptions/cancel`: call `stripe.subscriptions.update({ cancel_at_period_end: true })`, update Subscription + User docs to Free flags
- [ ] 8.6 Implement `POST /api/subscriptions/billing-portal`: call `stripe.billingPortal.sessions.create`, return portal URL
- [ ] 8.7 Implement `GET /api/subscriptions/checkout-session/:sessionId`: retrieve session from Stripe and return `payment_status`
- [ ] 8.8 Apply `stripeLimiter` to checkout and cancel routes; exempt webhook route

---

## 9. Analytics Event Logging

- [ ] 9.1 Create `server/utils/analytics.ts` exporting `logEvent(userId, eventType, metadata)` — fire-and-forget write to `analytics_events` collection, never throws
- [ ] 9.2 Add `logEvent` calls in: export API (pdf_export_initiated), AI rewrite API (ai_rewrite_used), ATS API (ats_score_generated), subscriptions API (subscription_checkout_started, subscription_activated, subscription_cancelled)

---

## 10. AI Rewrite Safety

- [ ] 10.1 Update `server/services/ai.service.ts` — add `validateAIOutput(original, rewritten)` that checks: no profanity (word-list filter), output length ≤ 3× original length
- [ ] 10.2 On validation failure, retry once with an explicit conciseness instruction; on second failure, return original text and log failure with userId + prompt hash

---

## 11. Cover Letter API

- [ ] 11.1 Add `POST /api/cover-letters/generate` endpoint gated behind `requireFeature('coverLetterGenerator')`: accept `resumeId`, `jobTitle`, `companyName`, `tone`; call Gemini with reusable prompt template; store result as `CoverLetter` document
- [ ] 11.2 Add `POST /api/cover-letters/export-pdf` endpoint: fetch cover letter, render through `pdfService.generatePDF`, return downloadable PDF

---

## 12. Template Registry

- [ ] 12.1 Rewrite `src/templates/TemplateRegistry.ts` — export `TEMPLATE_REGISTRY` mapping keys `modern`, `tech`, `executive`, `creative`, `minimal`, `atsClassic` to their components; export `getTemplate(key)` with fallback to `modern`
- [ ] 12.2 Update all live preview components to resolve templates via `TEMPLATE_REGISTRY[key]` instead of inline conditionals

---

## 13. Print Renderer

- [ ] 13.1 Rewrite `src/print/ResumePrintView.tsx` — resolve template via `TEMPLATE_REGISTRY`, include `<link rel="preload">` for active Google Font, embed `@page { size: A4; margin: 0 }` and fallback font stacks, apply `user-select: text`, `print-color-adjust: exact`
- [ ] 13.2 Implement `isReady` flag: await `document.fonts.ready` + 500ms delay before rendering; show A4-sized placeholder while loading
- [ ] 13.3 Apply `page-break-inside: avoid` to all section containers and individual entries

---

## 14. Centralized Zustand Stores

- [ ] 14.1 Update `src/stores/authStore.ts` — add `features: UserFeatures` to state, populate from login/fetchMe responses, expose `updateFeatures(features)` action
- [ ] 14.2 Create `src/stores/subscriptionStore.ts` — state: `currentPlan`, `status`, `features` mirror; actions: `setSubscription(data)`, `syncFromAuth()`, `reset()`; atomic update with `authStore` on plan change
- [ ] 14.3 Create `src/stores/exportStore.ts` — state: `stage: ExportStage`, `error: string | null`; actions: `startExport()`, `setStage(stage)`, `setError(error)`, `reset()`
- [ ] 14.4 Update `src/stores/uiStore.ts` — add `themeStore` slice: `activeTheme`, `activeFont`, `activeSpacing`; persist to `localStorage` via Zustand `persist` middleware

---

## 15. Export Button Component

- [ ] 15.1 Rewrite `src/components/export/ExportButton.tsx` — connect to `exportStore`; cycle through `idle → preparing → rendering → generating → downloading → idle` states with distinct labels and spinner
- [ ] 15.2 Add error state with "Retry" button that re-triggers export without page reload
- [ ] 15.3 Show 2-second "Downloaded!" success flash before returning to `idle`
- [ ] 15.4 Show locked state with upgrade tooltip when `!features.unlimitedExports` and limit reached; display upgrade toast on 403 `EXPORT_LIMIT_REACHED`

---

## 16. Premium UI Components

- [ ] 16.1 Rewrite `src/components/premium/PremiumUI.tsx` — implement `LockIndicator` (lock icon overlay), `UpgradeModal` (feature name + "Upgrade Now" / "Maybe Later" buttons navigating to `/subscription`), `FeatureGate` wrapper component
- [ ] 16.2 All components read feature flags exclusively from `useAuthStore().user.features`
- [ ] 16.3 Apply `LockIndicator` overlay to premium templates in the template selector

---

## 17. Subscription Frontend Pages

- [ ] 17.1 Rewrite `src/pages/subscription/SubscriptionPage.tsx` — display Free/Pro/Enterprise plan cards with feature lists; "Upgrade" button calls `POST /api/subscriptions/checkout` and redirects to Stripe URL
- [ ] 17.2 Rewrite `src/pages/subscription/CheckoutSuccess.tsx` — on mount, read `session_id` from URL, call `GET /api/subscriptions/checkout-session/:id`, refresh auth store, show success/error state; redirect to `/subscription` if no session_id
- [ ] 17.3 Add "Manage Billing" button in settings/subscription page that calls `POST /api/subscriptions/billing-portal` and opens the portal URL

---

## 18. Resume Version History UI

- [ ] 18.1 Create `src/components/resume/VersionHistory.tsx` — fetch versions from `GET /api/resumes/:id/versions`, display list with timestamp + template/theme label, "Restore" button per entry
- [ ] 18.2 Wire "Restore" button to `POST /api/resumes/:id/versions/:versionId/restore` and reload resume in store on success
- [ ] 18.3 Trigger version snapshot on major save action in `resumeStore.updateResume`

---

## 19. Global UI Redesign — Design System

- [ ] 19.1 Update `tailwind.config.js` — extend with emerald/zinc/stone palette, custom `font-sans` (Inter/Manrope), custom shadow scale (`shadow-soft`, `shadow-card`), custom border-radius (`rounded-xl`, `rounded-2xl`)
- [ ] 19.2 Rewrite `src/styles/globals.css` — set base font to Inter, define CSS variables for emerald primary, zinc neutrals, warm white backgrounds; add dark mode variables using `[data-theme="dark"]`
- [ ] 19.3 Create `src/components/ui/Button.tsx` — variants: `primary` (emerald-600, hover emerald-700), `secondary` (zinc-100, hover zinc-200), `ghost`, `danger`; sizes: `sm`, `md`, `lg`; all `rounded-xl` with subtle shadow

---

## 20. Global UI Redesign — Navigation & Layout

- [ ] 20.1 Rewrite `src/components/common/Navbar.tsx` — floating pill navbar with `backdrop-blur`, emerald logo mark, compact spacing, scroll-aware background opacity
- [ ] 20.2 Rewrite `src/components/dashboard/Sidebar.tsx` — collapsible sidebar with animated width transition (Framer Motion), emerald active state indicator, elegant icon + label layout
- [ ] 20.3 Rewrite `src/components/dashboard/TopBar.tsx` — clean topbar with breadcrumb, notification bell, user avatar dropdown

---

## 21. Global UI Redesign — Dashboard & Pages

- [ ] 21.1 Rewrite `src/pages/dashboard/Dashboard.tsx` — modern analytics cards with soft shadows, resume grid with hover lift, quick-action buttons
- [ ] 21.2 Rewrite `src/pages/resume/ResumeBuilder.tsx` — clean split layout: left form panel + right sticky preview; section cards with smooth accordion; proper form groupings
- [ ] 21.3 Rewrite `src/pages/ats/ATSDashboard.tsx` — modern score ring, keyword chips, elegant progress bars, clean issue/suggestion cards
- [ ] 21.4 Rewrite `src/components/ai/AIAssistantModal.tsx` — floating command-palette style, minimal chat bubbles, smooth slide-in animation

---

## 22. Animations & Polish

- [ ] 22.1 Add Framer Motion page transitions in `src/router.tsx` — `AnimatePresence` with fade+slide variants
- [ ] 22.2 Add hover lift (`whileHover: { y: -2 }`) and tap scale (`whileTap: { scale: 0.98 }`) to all card and button components
- [ ] 22.3 Add loading skeleton components for resume list, ATS dashboard, and subscription page
- [ ] 22.4 Add smooth accordion animations to resume form sections using Framer Motion `AnimatePresence`

---

## 23. Environment & Deployment

- [ ] 23.1 Add `server/utils/validateEnv.ts` startup check — call at top of `server/index.ts` before any route registration
- [ ] 23.2 Create `Dockerfile` with Node 20 base, install Chromium system dependencies (`chromium`, `fonts-liberation`, `libatk-bridge2.0-0`, etc.), set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`, expose port 3000
- [ ] 23.3 Add deployment notes to `README.md` — Railway/Render/VPS recommended; Vercel not supported; `PUPPETEER_EXECUTABLE_PATH` override instructions

---

## 24. Final Wiring & Validation

- [ ] 24.1 Register all new routes in `server/index.ts` — export, subscriptions (with raw body parser for webhook), cover-letters, resumes (versioning endpoints)
- [ ] 24.2 Add `subscription` API client in `src/api/subscription.api.ts` — `checkout`, `cancel`, `getCurrent`, `getPlans`, `billingPortal`, `getCheckoutSession`
- [ ] 24.3 Run TypeScript compiler (`tsc --noEmit`) on both `tsconfig.json` and `tsconfig.server.json` and fix all type errors
- [ ] 24.4 Verify end-to-end: create resume → export PDF → verify selectable text → upgrade via Stripe test mode → verify Pro features unlock → cancel subscription → verify Free flags restored
