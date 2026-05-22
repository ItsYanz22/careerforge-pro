import puppeteer, { Browser, Page } from 'puppeteer';

export interface PDFGenerationOptions {
  resumeId: string;
  token: string;           // JWT — passed as Authorization header to the print page
  fileName?: string;
  frontendUrl?: string;    // e.g. http://localhost:5173
}

export interface PDFResult {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

const PDF_TIMEOUT_MS = 30_000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

/**
 * Production-grade PDF generation service.
 *
 * Architecture:
 *   Puppeteer navigates to /print/:resumeId (the React print route).
 *   The print page renders the SAME template components used in the live preview.
 *   We wait for window.__RESUME_READY__ === true before capturing.
 *
 * This guarantees:
 *   - PDF matches live preview exactly (same TEMPLATE_REGISTRY)
 *   - All templates work (Modern, Executive, Creative, etc.)
 *   - Typography, colors, and spacing are preserved
 *   - ATS-safe selectable text (real DOM, not rasterized)
 */
class PDFService {
  private browser: Browser | null = null;
  private launching = false;

  // Concurrency control
  private activeGenerations = 0;
  private maxConcurrency = 3;
  private queue: (() => void)[] = [];

  private async acquireLock(): Promise<void> {
    if (this.activeGenerations < this.maxConcurrency) {
      this.activeGenerations++;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }

  private releaseLock(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    } else {
      this.activeGenerations--;
    }
  }

  // ── Browser lifecycle ────────────────────────────────────────────────────

  private async getBrowser(): Promise<Browser> {
    if (this.browser) return this.browser;

    if (this.launching) {
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (!this.launching) { clearInterval(interval); resolve(); }
        }, 100);
      });
      return this.browser!;
    }

    this.launching = true;
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });

      this.browser.on('disconnected', () => {
        console.warn('[pdf-service] Browser disconnected — will relaunch on next request');
        this.browser = null;
      });

      console.log('[pdf-service] Puppeteer browser launched');
    } finally {
      this.launching = false;
    }

    return this.browser!;
  }

  // ── Core generation ──────────────────────────────────────────────────────

  async generatePDF(options: PDFGenerationOptions): Promise<PDFResult> {
    await this.acquireLock();
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('PDF generation timed out after 30 seconds')),
          PDF_TIMEOUT_MS
        )
      );
      return await Promise.race([this._generate(options), timeoutPromise]);
    } finally {
      this.releaseLock();
    }
  }

  private async _generate(options: PDFGenerationOptions): Promise<PDFResult> {
    const browser = await this.getBrowser();
    let page: Page | null = null;

    try {
      page = await browser.newPage();

      // A4 at 96 DPI
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

      // Pass JWT so the print page can fetch the resume
      await page.setExtraHTTPHeaders({
        Authorization: `Bearer ${options.token}`,
      });

      // Also set it in localStorage so the apiClient picks it up
      const printUrl = `${FRONTEND_URL}/print/${options.resumeId}`;

      // Navigate to the print route
      await page.goto(printUrl, { waitUntil: 'networkidle0', timeout: 25_000 });

      // Wait for the React print component to signal readiness or error
      await page.waitForFunction(
        'window.__RESUME_READY__ === true || window.__RESUME_ERROR__ === true',
        { timeout: 20_000 }
      );

      const hasError = await page.evaluate('window.__RESUME_ERROR__ === true');
      if (hasError) {
        throw new Error('Frontend encountered an error rendering the resume for PDF.');
      }

      // Wait for all fonts to be fully loaded
      await page.evaluateHandle('document.fonts.ready');

      // Extra 300ms for layout stability
      await new Promise((r) => setTimeout(r, 300));

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        scale: 1,
      });

      const fileName = options.fileName ?? `resume-${Date.now()}.pdf`;

      return {
        buffer: Buffer.from(pdfBuffer),
        fileName,
        mimeType: 'application/pdf',
      };
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }

  // ── Shutdown ─────────────────────────────────────────────────────────────

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
      console.log('[pdf-service] Browser closed');
    }
  }
}

export const pdfService = new PDFService();

process.on('SIGTERM', () => pdfService.closeBrowser());
process.on('SIGINT', () => pdfService.closeBrowser());
