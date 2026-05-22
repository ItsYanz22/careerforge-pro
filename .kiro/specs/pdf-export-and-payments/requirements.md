# Requirements Document

## Introduction

This feature delivers production-grade PDF export and Stripe subscription management for CareerForge Pro. It covers three interconnected areas: a server-side Puppeteer PDF rendering pipeline that produces ATS-safe, selectable-text PDFs at A4 dimensions; a real Stripe Checkout and webhook integration that manages Free and Pro subscription tiers; and a feature-flag gating system that enforces per-feature access controls across the UI and API without hardcoded plan checks.

The existing codebase already contains skeleton files for `pdf.service.ts`, `stripe.service.ts`, `export.ts`, `subscriptions.ts`, `featureGate.ts`, `ResumePrintView.tsx`, `PremiumUI.tsx`, and `ExportButton.tsx`. This feature completes those implementations and wires them together end-to-end.

The scope has since been expanded to include: resume version history (snapshot-based undo via the `ResumeVersion` model); AI usage metering (monthly quota enforcement for Free plan users); API rate limiting (per-route-group `express-rate-limit` middleware); HTML sanitization for PDF rendering (DOMPurify-based XSS prevention before Puppeteer injection); MongoDB-based analytics event logging (fire-and-forget writes to an `analytics_events` collection); centralized Zustand state management (auth, subscription, theme, and export state unified under a single store with atomic updates); a centralized template registry (`TEMPLATE_REGISTRY`) ensuring consistent template resolution across the live preview and PDF pipeline; font embedding and preload strategy for pixel-perfect PDF fidelity; AI rewrite prompt safety validation; cover letter generation and PDF export for Pro users; resume creation limit enforcement at the API level; export progress UX states with labeled spinner stages; environment variable validation at server startup; and deployment compatibility guidance for Puppeteer-based hosting environments.

---

## Glossary

- **PDF_Service**: The server-side `PDFService` class in `server/services/pdf.service.ts` responsible for launching Puppeteer and producing PDF buffers.
- **Print_Renderer**: The React component `ResumePrintView` at `src/print/ResumePrintView.tsx`, rendered by Puppeteer as the HTML source for PDF generation.
- **Export_API**: The Express router at `server/api/export.ts` exposing `POST /api/export/pdf` and `POST /api/export/pdf-base64`.
- **Stripe_Service**: The `StripeServiceImpl` class in `server/services/stripe.service.ts` wrapping the Stripe SDK.
- **Subscription_API**: The Express router at `server/api/subscriptions.ts` exposing subscription lifecycle endpoints.
- **Feature_Gate**: The middleware and helper functions in `server/middlewares/featureGate.ts` that enforce feature-flag access.
- **User_Features**: The `features` object stored on the `User` MongoDB document: `{ premiumTemplates, unlimitedExports, advancedAI, coverLetterGenerator, advancedATS, unlimitedResumes }`.
- **Free_Plan**: The default subscription tier allowing 1 resume, basic templates, 5 AI rewrites per month, and basic PDF export.
- **Pro_Plan**: The paid subscription tier ($15/month) granting unlimited resumes, premium templates, unlimited AI rewrites, advanced ATS, premium typography, cover letter generator, and full PDF export.
- **Checkout_Session**: A Stripe-hosted payment page created via `stripe.checkout.sessions.create`.
- **Webhook_Event**: A signed HTTP POST from Stripe to `POST /api/subscriptions/webhook` notifying the system of subscription lifecycle changes.
- **ATS**: Applicant Tracking System — software used by employers to parse resume text. PDFs must contain selectable, machine-readable text to pass ATS scanning.
- **Export_Button**: The React component `ExportButton` at `src/components/export/ExportButton.tsx` that triggers PDF generation from the UI.
- **Premium_UI**: The set of React components in `src/components/premium/PremiumUI.tsx` that render lock indicators and upgrade prompts.
- **ResumeVersion**: A MongoDB document (model: `ResumeVersion`) that stores a full snapshot of a resume's data, template, theme, font, and spacing at a specific point in time, identified by a sequential `versionNumber` scoped to the parent resume.
- **AI_Usage_Meter**: The combination of `aiUsageCount` and `aiUsageResetDate` fields on the `User` document that track and enforce the monthly AI rewrite quota for Free plan users.
- **Rate_Limiter**: The `express-rate-limit` middleware instances applied per endpoint group to restrict request frequency by IP or authenticated user identity.
- **Template_Registry**: The `TEMPLATE_REGISTRY` constant exported from `src/templates/TemplateRegistry.ts` that maps each template key to its corresponding React component, serving as the single source of truth for template resolution across the live preview and PDF pipeline.
- **Analytics_Event**: A MongoDB document written to the `analytics_events` collection recording a user action (e.g., PDF export, AI rewrite, subscription change) with fields `userId`, `eventType`, `metadata`, and `createdAt`.
- **Export_Store**: The Zustand store slice (`exportStore`) that manages export lifecycle state (`idle`, `preparing`, `rendering`, `generating`, `downloading`, `error`) and exposes `startExport()`, `setStage()`, `setError()`, and `reset()` actions consumed by the Export_Button.
- **Subscription_Store**: The Zustand store slice (`subscriptionStore`) that mirrors the user's current plan, subscription status, and feature flags, kept in sync with `authStore` during subscription lifecycle events.

---

## Requirements

### Requirement 1: Server-Side PDF Generation via Puppeteer

**User Story:** As a job seeker, I want to download my resume as a PDF, so that I can submit it to employers and ATS systems with confidence that the formatting and text are preserved exactly.

#### Acceptance Criteria

1. WHEN `POST /api/export/pdf` is called with a valid `resumeId`, THE Export_API SHALL fetch the resume from MongoDB, verify ownership, and pass the resume data to the PDF_Service.
2. WHEN the PDF_Service receives a generation request, THE PDF_Service SHALL launch a Puppeteer browser instance with `--no-sandbox`, `--disable-setuid-sandbox`, and `--disable-dev-shm-usage` flags.
3. WHEN Puppeteer renders the Print_Renderer, THE PDF_Service SHALL set the viewport to 794×1123 pixels (A4 at 96 DPI) with `deviceScaleFactor: 1`.
4. WHEN generating the PDF, THE PDF_Service SHALL call `page.pdf()` with `format: 'A4'`, `printBackground: true`, and all margins set to `0`.
5. THE PDF_Service SHALL wait for `document.fonts.ready` before capturing the PDF to ensure all custom fonts are embedded.
6. THE PDF_Service SHALL set `waitUntil: 'networkidle0'` when loading the Print_Renderer URL so that all assets are fully loaded before capture.
7. THE Export_API SHALL respond with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="<encoded-filename>"` headers when returning the PDF buffer.
8. WHEN a PDF generation error occurs, THE Export_API SHALL respond with HTTP 500 and a JSON body containing `{ success: false, error: "<message>" }`.
9. THE PDF_Service SHALL reuse a single Puppeteer browser instance across requests and open a new `Page` per request, closing the page after generation completes.
10. WHEN `POST /api/export/pdf-base64` is called, THE Export_API SHALL return the PDF as a base64-encoded string in `{ success: true, data: { pdf, mimeType, fileName } }`.

---

### Requirement 2: ATS-Safe Print Renderer

**User Story:** As a job seeker, I want the exported PDF to contain selectable, machine-readable text, so that ATS systems can parse my resume content accurately.

#### Acceptance Criteria

1. THE Print_Renderer SHALL render the resume using the same React template components (Modern, Tech, Executive, Creative, Minimal, ATSClassic) used in the live preview, selected by `currentResume.template`.
2. THE Print_Renderer SHALL apply `user-select: text` and `-webkit-user-select: text` to the document body so that all text in the PDF is selectable.
3. THE Print_Renderer SHALL apply `-webkit-print-color-adjust: exact`, `print-color-adjust: exact`, and `color-adjust: exact` to all elements to preserve colors in the PDF output.
4. THE Print_Renderer SHALL set the root container to `width: 210mm` and `minHeight: 297mm` with `margin: 0` and `padding: 0`.
5. WHEN the Print_Renderer mounts, THE Print_Renderer SHALL wait for both `document.fonts.ready` and a 500ms settling delay before setting the `isReady` flag to `true`.
6. WHEN `isReady` is `false`, THE Print_Renderer SHALL render a loading placeholder at A4 dimensions so Puppeteer does not capture an empty page.
7. THE Print_Renderer SHALL include an `@page { size: A4; margin: 0; }` CSS rule to ensure correct page sizing when printed.
8. THE Print_Renderer SHALL apply `page-break-inside: avoid` to all block-level elements to prevent content from being split mid-element across pages.

---

### Requirement 3: Multi-Page PDF Support Without Content Cutoffs

**User Story:** As a job seeker with extensive experience, I want my resume to flow across multiple pages without any content being cut off at page boundaries, so that the PDF is complete and professional.

#### Acceptance Criteria

1. WHEN resume content exceeds a single A4 page, THE PDF_Service SHALL produce a multi-page PDF where each page is exactly 297mm tall.
2. THE Print_Renderer SHALL apply `page-break-inside: avoid` to each resume section container so that section headings and their first entry are never split across pages.
3. THE Print_Renderer SHALL apply `page-break-inside: avoid` to each individual experience, education, and project entry so that a single entry is not split mid-entry.
4. WHEN a section must continue on the next page, THE Print_Renderer SHALL allow a `page-break-before: auto` between entries within the same section.
5. THE PDF_Service SHALL not impose a maximum page count, allowing resumes of any length to be exported completely.

---

### Requirement 4: Template and Theme Fidelity in PDF

**User Story:** As a job seeker, I want the exported PDF to look identical to the live preview in the browser, so that I can trust what I see is what employers receive.

#### Acceptance Criteria

1. WHEN generating a PDF, THE Print_Renderer SHALL receive and apply the resume's `theme`, `font`, `spacing`, and `template` values identically to how the live preview applies them.
2. THE Print_Renderer SHALL load the same Google Fonts used in the live preview via `@import url(...)` within the embedded `<style>` block so fonts are available during Puppeteer rendering.
3. THE Print_Renderer SHALL pass `theme`, `font`, and `spacing` as props to the selected template component, matching the prop interface used by the live preview.
4. WHEN a `template` value does not match any registered template key, THE Print_Renderer SHALL fall back to the `Modern` template component.
5. THE Print_Renderer SHALL set `background-color: white` on the root container to ensure a white page background regardless of the active UI theme.

---

### Requirement 5: Export Feature Gating

**User Story:** As a product owner, I want PDF export to be available to all users on the Free plan for basic use, and unlimited high-fidelity export to be a Pro feature, so that the export capability drives subscription upgrades.

#### Acceptance Criteria

1. WHEN a Free plan user calls `POST /api/export/pdf`, THE Export_API SHALL permit the request and generate the PDF using the basic export path.
2. WHEN a Free plan user has `user.features.unlimitedExports === false` and calls `POST /api/export/pdf` for a second resume, THE Export_API SHALL respond with HTTP 403 and `{ success: false, error: "...", code: "EXPORT_LIMIT_REACHED", requiredPlan: "pro" }`.
3. WHEN the Export_Button receives an HTTP 403 response with `code: "EXPORT_LIMIT_REACHED"`, THE Export_Button SHALL display a toast notification prompting the user to upgrade.
4. WHEN a Pro plan user calls `POST /api/export/pdf`, THE Export_API SHALL permit the request without restriction.
5. THE Export_API SHALL verify the authenticated user's ownership of the requested `resumeId` before generating the PDF, responding with HTTP 403 if ownership does not match.

---

### Requirement 6: Stripe Customer and Checkout Session Creation

**User Story:** As a Free plan user, I want to upgrade to Pro by completing a Stripe-hosted checkout, so that I can access premium features immediately after payment.

#### Acceptance Criteria

1. WHEN `POST /api/subscriptions/checkout` is called with `{ planType: "pro" }`, THE Subscription_API SHALL create or retrieve a Stripe customer for the authenticated user.
2. WHEN a Stripe customer does not yet exist for the user, THE Stripe_Service SHALL call `stripe.customers.create` with the user's email and name, and THE Subscription_API SHALL persist the returned `customer.id` to `user.stripeCustomerId`.
3. WHEN creating a Checkout_Session, THE Stripe_Service SHALL call `stripe.checkout.sessions.create` with `mode: "subscription"`, the configured Pro price ID from `STRIPE_PRICE_PRO_MONTHLY`, and `metadata: { userId, planType }`.
4. THE Subscription_API SHALL set `success_url` to `${FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}` and `cancel_url` to `${FRONTEND_URL}/subscription`.
5. WHEN the Checkout_Session is created successfully, THE Subscription_API SHALL respond with `{ success: true, data: { sessionId, url } }`.
6. WHEN `planType` is not `"pro"` or `"enterprise"`, THE Subscription_API SHALL respond with HTTP 400 and `{ success: false, error: "Invalid plan type" }`.
7. IF the Stripe API call fails, THEN THE Subscription_API SHALL respond with HTTP 500 and `{ success: false, error: "<stripe error message>" }`.

---

### Requirement 7: Stripe Webhook Processing and Subscription Sync

**User Story:** As a system operator, I want subscription state changes from Stripe to be reliably reflected in the database, so that users gain or lose feature access immediately when their payment status changes.

#### Acceptance Criteria

1. WHEN `POST /api/subscriptions/webhook` is called, THE Subscription_API SHALL verify the `stripe-signature` header using `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`.
2. IF the webhook signature is invalid or missing, THEN THE Subscription_API SHALL respond with HTTP 400 and `{ success: false, error: "Invalid webhook signature" }`.
3. WHEN a `checkout.session.completed` event is received, THE Subscription_API SHALL update the `Subscription` document with `stripeCustomerId`, `stripeSubscriptionId`, `plan: planType`, and `status: "active"`.
4. WHEN a `checkout.session.completed` event is received, THE Subscription_API SHALL update the `User` document with `currentPlan: planType`, `subscriptionStatus: "active"`, `subscriptionStartDate: new Date()`, and `features` computed by `getUserFeatureFlags(planType)`.
5. WHEN a `customer.subscription.updated` event is received, THE Subscription_API SHALL update the `Subscription` document's `status` and `renewalDate` fields to reflect the new Stripe subscription state.
6. WHEN a `customer.subscription.deleted` event is received, THE Subscription_API SHALL set the `Subscription` document to `plan: "free"` and `status: "cancelled"`, and update the `User` document to `currentPlan: "free"` with Free plan feature flags.
7. WHEN an `invoice.payment_failed` event is received, THE Subscription_API SHALL set `Subscription.status` and `User.subscriptionStatus` to `"past_due"`.
8. THE Subscription_API SHALL respond with HTTP 200 and `{ received: true }` for all successfully processed webhook events.
9. THE Subscription_API SHALL log each processed event type to the server console for observability.

---

### Requirement 8: Subscription Status Retrieval

**User Story:** As a logged-in user, I want to see my current subscription plan and feature access, so that I know what I can and cannot do on the platform.

#### Acceptance Criteria

1. WHEN `GET /api/subscriptions/current` is called by an authenticated user, THE Subscription_API SHALL respond with `{ success: true, data: { plan, status, features, startDate, endDate, subscription } }`.
2. THE Subscription_API SHALL read `currentPlan`, `subscriptionStatus`, `features`, `subscriptionStartDate`, and `subscriptionEndDate` from the `User` document.
3. IF the authenticated user is not found in the database, THEN THE Subscription_API SHALL respond with HTTP 404 and `{ success: false, error: "User not found" }`.
4. WHEN `GET /api/subscriptions/plans` is called, THE Subscription_API SHALL respond with the static plan definitions for Free, Pro, and Enterprise tiers without requiring authentication.

---

### Requirement 9: Subscription Cancellation

**User Story:** As a Pro plan user, I want to cancel my subscription, so that I am not charged after my current billing period ends.

#### Acceptance Criteria

1. WHEN `POST /api/subscriptions/cancel` is called by an authenticated Pro user, THE Subscription_API SHALL call `stripe.subscriptions.update` with `cancel_at_period_end: true` on the user's `stripeSubscriptionId`.
2. WHEN cancellation succeeds, THE Subscription_API SHALL update the `Subscription` document to `status: "cancelled"`, `plan: "free"`, and set `cancelledAt` to the current timestamp.
3. WHEN cancellation succeeds, THE Subscription_API SHALL update the `User` document to `currentPlan: "free"`, `subscriptionStatus: "canceled"`, and `features` computed by `getUserFeatureFlags("free")`.
4. IF no active subscription with a `stripeSubscriptionId` exists for the user, THEN THE Subscription_API SHALL respond with HTTP 400 and `{ success: false, error: "No active subscription to cancel" }`.
5. WHEN cancellation succeeds, THE Subscription_API SHALL respond with `{ success: true, data: { message: "Subscription canceled successfully" } }`.

---

### Requirement 10: Feature-Flag Gating Middleware

**User Story:** As a product owner, I want all premium feature access to be enforced through a feature-flag system rather than hardcoded plan checks, so that feature availability can be adjusted per user without code changes.

#### Acceptance Criteria

1. THE Feature_Gate SHALL expose a `requireFeature(feature: string)` middleware factory that reads `req.user.features[feature]` and calls `next()` if the value is `true`.
2. WHEN `req.user.features[feature]` is `false` or absent, THE Feature_Gate SHALL respond with HTTP 403 and `{ success: false, error: "...", code: "FEATURE_LOCKED", requiredPlan: "<plan>" }`.
3. THE Feature_Gate SHALL expose a `getUserFeatureFlags(planType)` function that returns the correct `UserFeatures` object for `"free"`, `"pro"`, and `"enterprise"` plan types without referencing plan names in conditional logic outside this function.
4. WHEN `planType` is `"pro"`, THE Feature_Gate SHALL return `{ premiumTemplates: true, unlimitedExports: true, advancedAI: true, coverLetterGenerator: true, advancedATS: false, unlimitedResumes: false }`.
5. WHEN `planType` is `"free"`, THE Feature_Gate SHALL return all feature flags set to `false`.
6. WHEN `planType` is `"enterprise"`, THE Feature_Gate SHALL return all feature flags set to `true`.
7. THE Feature_Gate SHALL not contain any direct comparisons of the form `plan === "pro"` or `plan === "free"` outside of the `getUserFeatureFlags` function.

---

### Requirement 11: Premium UI Lock Indicators and Upgrade Prompts

**User Story:** As a Free plan user, I want to see clear visual indicators on locked features with an easy path to upgrade, so that I understand what I am missing and can act on it.

#### Acceptance Criteria

1. WHEN a Free plan user views a premium template in the template selector, THE Premium_UI SHALL render a `LockIndicator` component overlaid on the template thumbnail.
2. WHEN a Free plan user clicks a locked template or feature, THE Premium_UI SHALL display an `UpgradeModal` identifying the locked feature by name and the required plan.
3. THE `UpgradeModal` SHALL include an "Upgrade Now" button that navigates the user to the subscription page (`/subscription`).
4. THE `UpgradeModal` SHALL include a "Maybe Later" button that dismisses the modal without navigation.
5. WHEN a Free plan user views the Export_Button and has reached the export limit, THE Export_Button SHALL render in a visually distinct locked state and display a tooltip indicating the feature requires Pro.
6. THE Premium_UI components SHALL read feature availability from `user.features` via the auth store, not from a hardcoded plan name comparison.
7. WHEN a Pro plan user views any previously locked feature, THE Premium_UI SHALL render the feature without any lock overlay or upgrade prompt.

---

### Requirement 12: Billing Portal Access

**User Story:** As a Pro plan user, I want to manage my payment method and billing history through Stripe's portal, so that I can update my card or download invoices without contacting support.

#### Acceptance Criteria

1. WHEN `POST /api/subscriptions/billing-portal` is called by an authenticated user with a `stripeCustomerId`, THE Subscription_API SHALL call `stripe.billingPortal.sessions.create` and respond with `{ success: true, data: { url } }`.
2. THE Subscription_API SHALL set the portal `return_url` to `${FRONTEND_URL}/subscription`.
3. IF the authenticated user does not have a `stripeCustomerId`, THEN THE Subscription_API SHALL respond with HTTP 400 and `{ success: false, error: "No Stripe customer found" }`.

---

### Requirement 13: Database Subscription Model Integrity

**User Story:** As a system operator, I want subscription and user data to be stored consistently in MongoDB, so that subscription state is always recoverable from the database.

#### Acceptance Criteria

1. THE `Subscription` MongoDB document SHALL store `userId`, `plan`, `stripeCustomerId`, `stripeSubscriptionId`, `status`, `startDate`, `renewalDate`, `cancelledAt`, and `endDate` fields.
2. THE `User` MongoDB document SHALL store `stripeCustomerId`, `currentPlan`, `subscriptionStatus`, `subscriptionStartDate`, `subscriptionEndDate`, and `features` (as a `UserFeatures` subdocument) fields.
3. WHEN a new user registers, THE system SHALL initialize `User.currentPlan` to `"free"`, `User.subscriptionStatus` to `"active"`, and `User.features` to the Free plan feature flags.
4. THE `Subscription` collection SHALL enforce a unique index on `userId` so that each user has at most one subscription document.
5. WHEN `stripeCustomerId` is stored on the `User` document, THE system SHALL also index this field for efficient webhook lookups.

---

### Requirement 14: Checkout Success Page

**User Story:** As a user who has just completed payment, I want to see a confirmation page that reflects my new Pro status, so that I know the upgrade was successful.

#### Acceptance Criteria

1. WHEN the user is redirected to `/subscription/success?session_id=<id>`, THE CheckoutSuccess page SHALL call `GET /api/subscriptions/checkout-session/:sessionId` to verify the session status.
2. WHEN `session.payment_status` is `"paid"`, THE CheckoutSuccess page SHALL display a success message and the user's new plan name.
3. WHEN `session.payment_status` is not `"paid"`, THE CheckoutSuccess page SHALL display an error message and a link back to the subscription page.
4. THE CheckoutSuccess page SHALL refresh the authenticated user's subscription data from `GET /api/subscriptions/current` after verifying the session, so that the UI reflects the new plan immediately.
5. IF the `session_id` query parameter is absent, THEN THE CheckoutSuccess page SHALL redirect the user to `/subscription`.

---

### Requirement 15: Resume Version History

**User Story:** As a job seeker, I want to view and restore previous versions of my resume, so that I can recover from unwanted changes and track my editing history.

#### Acceptance Criteria

1. WHEN a user performs a major save action on a resume, THE system SHALL create a `ResumeVersion` snapshot storing the full resume data, timestamp, template, theme, font, and spacing values.
2. THE system SHALL retain the most recent 20 versions per resume, automatically pruning older snapshots beyond that limit.
3. WHEN `GET /api/resumes/:id/versions` is called by the authenticated owner, THE API SHALL return a list of version summaries (`versionNumber`, `createdAt`, `template`, `theme`).
4. WHEN `POST /api/resumes/:id/versions/:versionId/restore` is called, THE API SHALL overwrite the current resume document with the snapshot data and create a new version snapshot of the pre-restore state.
5. THE version history UI SHALL display each version with its timestamp and template/theme label, and provide a "Restore" button per entry.

---

### Requirement 16: AI Usage Metering

**User Story:** As a product owner, I want AI rewrite usage to be tracked and enforced per user per month, so that Free plan limits are reliably enforced and Pro users are never blocked.

#### Acceptance Criteria

1. THE `User` document SHALL store `aiUsageCount: number` and `aiUsageResetDate: Date` fields.
2. WHEN a Free plan user calls an AI rewrite endpoint and `aiUsageCount >= 5`, THE API SHALL respond with HTTP 429 and `{ success: false, error: "Monthly AI limit reached", code: "AI_LIMIT_REACHED", requiredPlan: "pro" }`.
3. WHEN a Pro plan user calls an AI rewrite endpoint, THE API SHALL not apply any usage limit check.
4. WHEN `aiUsageResetDate` is in the past relative to the current date, THE API SHALL reset `aiUsageCount` to `0` and set `aiUsageResetDate` to the first day of the next calendar month before processing the request.
5. WHEN an AI rewrite request is successfully processed, THE API SHALL increment `aiUsageCount` by 1.

---

### Requirement 17: API Rate Limiting

**User Story:** As a system operator, I want all sensitive API endpoints to be rate-limited, so that the platform is protected against abuse, spam, and denial-of-service attacks.

#### Acceptance Criteria

1. THE server SHALL apply `express-rate-limit` middleware to the following endpoint groups with the specified windows and limits:
   - Auth endpoints (`/api/auth/*`): 20 requests per 15-minute window per IP.
   - Export endpoints (`/api/export/*`): 10 requests per 15-minute window per authenticated user.
   - AI endpoints (`/api/ai/*`): 30 requests per 15-minute window per authenticated user.
   - Stripe/subscription endpoints (`/api/subscriptions/checkout`, `/api/subscriptions/cancel`): 10 requests per 60-minute window per authenticated user.
2. WHEN a rate limit is exceeded, THE server SHALL respond with HTTP 429 and `{ success: false, error: "Too many requests. Please try again later.", retryAfter: <seconds> }`.
3. THE webhook endpoint (`POST /api/subscriptions/webhook`) SHALL be exempt from rate limiting.

---

### Requirement 18: PDF Generation Scalability Architecture

**User Story:** As a system architect, I want the PDF generation pipeline to be designed for future async queue support, so that the system can scale under concurrent load without architectural rewrites.

#### Acceptance Criteria

1. THE PDF_Service SHALL encapsulate all generation logic behind a `generatePDF(options)` interface that can be called synchronously now and wrapped in a queue worker in the future without changing the interface.
2. THE system documentation SHALL note that BullMQ + Redis is the recommended queue adapter for async PDF jobs when concurrent load exceeds single-instance capacity.
3. WHEN a PDF generation request takes longer than 30 seconds, THE Export_API SHALL respond with HTTP 504 and `{ success: false, error: "PDF generation timed out" }`.

---

### Requirement 19: Template Registry

**User Story:** As a developer, I want all resume templates to be registered in a single centralized registry, so that template selection logic is consistent across the live preview, print renderer, and future features.

#### Acceptance Criteria

1. THE codebase SHALL export a `TEMPLATE_REGISTRY` constant from `src/templates/TemplateRegistry.ts` mapping each template key (`"modern"`, `"tech"`, `"executive"`, `"creative"`, `"minimal"`, `"atsClassic"`) to its React component.
2. THE Print_Renderer and live preview SHALL both resolve template components exclusively via `TEMPLATE_REGISTRY[key]`, with no inline conditional chains.
3. WHEN a template key is not found in `TEMPLATE_REGISTRY`, both the Print_Renderer and live preview SHALL fall back to `TEMPLATE_REGISTRY["modern"]`.

---

### Requirement 20: Font Embedding and Preload Strategy

**User Story:** As a job seeker, I want the fonts in my exported PDF to match the fonts shown in the live preview, so that the PDF looks exactly as designed.

#### Acceptance Criteria

1. THE Print_Renderer SHALL include `<link rel="preload">` tags for each Google Font used by the active resume before the `@import` CSS rule, so the browser fetches fonts before rendering begins.
2. THE Print_Renderer SHALL define a CSS fallback font stack for each font category (serif, sans-serif, monospace) so that layout does not break if a Google Font fails to load.
3. THE PDF_Service SHALL call `page.evaluateHandle(() => document.fonts.ready)` and await its resolution before calling `page.pdf()`, ensuring all fonts are fully loaded.
4. WHEN a font fails to load within the `networkidle0` wait period, THE Print_Renderer SHALL render using the fallback font stack rather than showing blank text.

---

### Requirement 21: Input Sanitization for PDF Rendering

**User Story:** As a security engineer, I want all user-supplied resume content to be sanitized before it is rendered by Puppeteer, so that script injection and XSS attacks through the PDF pipeline are prevented.

#### Acceptance Criteria

1. THE Export_API SHALL sanitize all string fields of the resume data using DOMPurify (server-side via `isomorphic-dompurify` or equivalent) before passing the data to the PDF_Service.
2. THE sanitization SHALL strip all `<script>`, `<iframe>`, `<object>`, and event handler attributes from any string value.
3. WHEN sanitization removes content from a field, THE Export_API SHALL log a warning with the affected field name and the authenticated user's ID, but SHALL still proceed with PDF generation using the sanitized data.
4. THE sanitization layer SHALL be applied regardless of whether the user is on the Free or Pro plan.

---

### Requirement 22: Resume Creation Limit Enforcement

**User Story:** As a product owner, I want Free plan users to be blocked from creating more than one resume at the API level, so that the resume limit is enforced even if the frontend check is bypassed.

#### Acceptance Criteria

1. WHEN `POST /api/resumes` is called by a user whose `features.unlimitedResumes === false` and who already has 1 or more resume documents in the database, THE API SHALL respond with HTTP 403 and `{ success: false, error: "Resume limit reached", code: "RESUME_LIMIT_REACHED", requiredPlan: "pro" }`.
2. WHEN `features.unlimitedResumes === true`, THE API SHALL permit resume creation without restriction.
3. THE resume creation limit check SHALL occur after authentication and before any database write.

---

### Requirement 23: Analytics Event Logging

**User Story:** As a product owner, I want key user actions to be logged as analytics events in MongoDB, so that I can track feature adoption, conversion rates, and usage patterns.

#### Acceptance Criteria

1. THE system SHALL write an analytics event document to a MongoDB `analytics_events` collection for each of the following actions: PDF export initiated, AI rewrite used, ATS score generated, template changed, subscription checkout started, subscription activated, subscription cancelled.
2. EACH analytics event document SHALL store: `userId`, `eventType`, `metadata` (event-specific payload), and `createdAt`.
3. Analytics event writes SHALL be fire-and-forget (non-blocking) and SHALL NOT cause the parent request to fail if the write fails.
4. THE analytics collection SHALL have a TTL index of 90 days on `createdAt` so that old events are automatically pruned.

---

### Requirement 24: Export Progress UX States

**User Story:** As a job seeker, I want to see clear progress feedback during PDF export, so that I know the system is working and am not left wondering if my click registered.

#### Acceptance Criteria

1. THE Export_Button SHALL cycle through the following labeled states during an export: `idle` → `preparing` → `rendering` → `generating` → `downloading` → `idle`.
2. EACH state SHALL display a distinct label and a spinner or progress indicator so the user can see progress.
3. WHEN an export fails, THE Export_Button SHALL display an error state with a "Retry" button that re-triggers the export without requiring a page reload.
4. WHEN the PDF download begins, THE Export_Button SHALL display a brief success state ("Downloaded!") for 2 seconds before returning to `idle`.

---

### Requirement 25: AI Rewrite Prompt Safety

**User Story:** As a product owner, I want AI-generated resume content to be validated before it is returned to the user, so that the output is professional, accurate, and free of harmful or unrealistic content.

#### Acceptance Criteria

1. THE AI rewrite service SHALL validate that the generated output does not contain profanity using a word-list filter before returning the result to the client.
2. THE AI rewrite service SHALL check that the rewritten bullet point length does not exceed 3× the length of the original input, to prevent hallucinated padding.
3. WHEN the output fails validation, THE AI rewrite service SHALL retry the generation once with an explicit instruction to the model to keep the output concise and professional.
4. WHEN the retry also fails validation, THE AI rewrite service SHALL return the original unmodified text rather than the invalid output, and SHALL log the failure with the user ID and prompt hash.

---

### Requirement 26: Cover Letter Architecture

**User Story:** As a Pro plan user, I want to generate a cover letter from my resume data using a structured template, so that I can produce a professional cover letter without starting from scratch.

#### Acceptance Criteria

1. THE cover letter generator SHALL accept `resumeId`, `jobTitle`, `companyName`, and `tone` (`"professional"`, `"friendly"`, `"confident"`) as inputs.
2. THE system SHALL use a reusable prompt template that injects the resume's personal info, experience summary, and target job details into the Gemini API call.
3. THE generated cover letter SHALL be stored as a `CoverLetter` MongoDB document linked to the `userId` and `resumeId`.
4. WHEN `POST /api/cover-letters/export-pdf` is called, THE system SHALL render the cover letter through the same Puppeteer PDF pipeline used for resumes, returning a downloadable PDF.
5. THE cover letter generator SHALL be gated behind `features.coverLetterGenerator`, returning HTTP 403 with `code: "FEATURE_LOCKED"` for Free plan users.

---

### Requirement 27: Centralized SaaS State Management

**User Story:** As a developer, I want all global application state (auth, features, subscription, theme, export) to be managed in a single centralized store, so that feature gating, premium sync, and theme consistency work reliably across the entire UI.

#### Acceptance Criteria

1. THE frontend SHALL use Zustand stores to manage the following state slices: `authStore` (user identity, JWT, features), `subscriptionStore` (currentPlan, status, features mirror), `themeStore` (active theme, font, spacing), `exportStore` (export status, progress state, last error).
2. THE `authStore` SHALL be the single source of truth for `user.features`; all premium UI components SHALL read feature flags exclusively from `authStore.user.features`.
3. WHEN a subscription event updates the user's plan (checkout success, cancellation, webhook sync), THE `authStore` and `subscriptionStore` SHALL both be updated atomically so no component reads stale feature flags.
4. THE `exportStore` SHALL expose `startExport()`, `setStage(stage)`, `setError(error)`, and `reset()` actions that the Export_Button uses to drive its progress states.
5. THE `themeStore` SHALL persist the active theme, font, and spacing selections to `localStorage` so that user preferences survive page reloads.

---

### Requirement 28: Environment Configuration

**User Story:** As a developer or DevOps engineer, I want all required environment variables to be documented and validated at server startup, so that misconfigured deployments fail fast with a clear error rather than silently misbehaving.

#### Acceptance Criteria

1. THE server SHALL validate the presence of the following environment variables at startup and throw a descriptive error if any are missing: `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `GEMINI_API_KEY`, `FRONTEND_URL`, `PUPPETEER_EXECUTABLE_PATH` (optional, with fallback to bundled Chromium).
2. THE repository SHALL include a `.env.example` file listing all required variables with placeholder values and inline comments describing each.
3. THE server SHALL log a startup summary listing which optional variables are absent and which defaults are being used.

---

### Requirement 29: Deployment Compatibility

**User Story:** As a DevOps engineer, I want the application to be deployable on Railway, Render, or any VPS with Docker support, so that Puppeteer's Chromium dependency does not block deployment.

#### Acceptance Criteria

1. THE server's Puppeteer configuration SHALL support a `PUPPETEER_EXECUTABLE_PATH` environment variable that overrides the bundled Chromium path, enabling use of a system-installed Chromium on constrained hosts.
2. THE repository SHALL include a `Dockerfile` (or document the required system packages) that installs the Chromium dependencies needed for Puppeteer to run in a Linux container.
3. THE PDF_Service SHALL pass `executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined` to `puppeteer.launch()` so that both local and containerized environments work without code changes.
4. THE deployment documentation SHALL note that Vercel and shared hosting are NOT supported due to Chromium binary requirements, and SHALL recommend Railway, Render, or a VPS as deployment targets.
