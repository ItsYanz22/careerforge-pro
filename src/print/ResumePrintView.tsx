import React, { useEffect, useState } from 'react';
import { getTemplate } from '../templates/TemplateRegistry';

interface ResumePrintViewProps {
  resume: any;
  theme?: string;
  font?: string;
  spacing?: any;
  template?: string;
}

/**
 * ATS-safe print renderer for Puppeteer PDF generation.
 *
 * Design decisions:
 * - Resolves template via TEMPLATE_REGISTRY — no inline conditionals
 * - Waits for document.fonts.ready + 500ms before setting isReady
 * - Shows A4-sized placeholder while loading so Puppeteer never captures empty page
 * - Applies print-color-adjust: exact and user-select: text for ATS compatibility
 * - @page rule ensures correct A4 sizing when printed
 * - page-break-inside: avoid on all section containers and entries
 */
const ResumePrintView: React.FC<ResumePrintViewProps> = ({
  resume,
  theme,
  font,
  spacing,
  template,
}) => {
  const [isReady, setIsReady] = useState(false);

  const activeTemplate = template ?? resume?.template ?? 'modern';
  const activeTheme    = theme    ?? resume?.theme    ?? 'light';
  const activeFont     = font     ?? resume?.font     ?? 'inter';
  const activeSpacing  = spacing  ?? resume?.spacing;

  // Font family map for Google Fonts preload
  const fontFamilyMap: Record<string, string> = {
    inter:        'Inter',
    manrope:      'Manrope',
    plusjakarta:  'Plus+Jakarta+Sans',
    roboto:       'Roboto',
    opensans:     'Open+Sans',
    lato:         'Lato',
    poppins:      'Poppins',
    montserrat:   'Montserrat',
    merriweather: 'Merriweather',
    playfair:     'Playfair+Display',
    sourcesanspro:'Source+Sans+3',
    ibmplexsans:  'IBM+Plex+Sans',
    lora:         'Lora',
    outfit:       'Outfit',
    urbanist:     'Urbanist',
    spacegrotesk: 'Space+Grotesk',
  };

  const googleFontName = fontFamilyMap[activeFont] ?? 'Inter';
  const googleFontUrl  = `https://fonts.googleapis.com/css2?family=${googleFontName}:wght@400;500;600;700&display=swap`;

  // Fallback font stacks by category
  const fallbackStacks: Record<string, string> = {
    serif:      'Georgia, "Times New Roman", Times, serif',
    sansSerif:  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    mono:       '"Courier New", Courier, monospace',
  };

  useEffect(() => {
    const prepare = async () => {
      try {
        await document.fonts.ready;
      } catch {
        // fonts.ready may not be available in all environments
      }
      // Extra 500ms settling time for layout stability
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
      setIsReady(true);
    };
    prepare();
  }, []);

  const TemplateComponent = getTemplate(activeTemplate);

  return (
    <>
      {/* Inject print-specific styles */}
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        *, *::before, *::after {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        html, body {
          margin: 0;
          padding: 0;
          background: white;
          -webkit-user-select: text;
          user-select: text;
          font-family: '${googleFontName.replace(/\+/g, ' ')}', ${fallbackStacks.sansSerif};
        }

        /* Prevent content cutoffs at page boundaries */
        .resume-section {
          page-break-inside: avoid;
        }

        .resume-entry {
          page-break-inside: avoid;
        }

        p, h1, h2, h3, h4, h5, h6, li {
          page-break-inside: avoid;
        }

        ul, ol {
          page-break-inside: avoid;
        }
      `}</style>

      {/* Google Font preload + stylesheet */}
      <link rel="preload" href={googleFontUrl} as="style" />
      <link rel="stylesheet" href={googleFontUrl} />

      {!isReady ? (
        /* Loading placeholder — A4 dimensions so Puppeteer doesn't capture empty page */
        <div
          style={{
            width: '210mm',
            minHeight: '297mm',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>Preparing document…</span>
        </div>
      ) : (
        <div
          style={{
            width: '210mm',
            minHeight: '297mm',
            margin: 0,
            padding: 0,
            background: 'white',
          }}
        >
          <TemplateComponent
            resume={resume}
            theme={activeTheme as any}
            font={activeFont}
            spacing={activeSpacing}
          />
        </div>
      )}
    </>
  );
};

export default ResumePrintView;
