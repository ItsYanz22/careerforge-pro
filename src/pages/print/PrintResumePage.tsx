/**
 * Dedicated print page for Puppeteer PDF generation.
 * Route: /print/:resumeId
 *
 * This page:
 * 1. Fetches the resume by ID from the API (using token from URL param for Puppeteer)
 * 2. Renders it through ResumePrintView (which uses TEMPLATE_REGISTRY)
 * 3. Sets window.__RESUME_READY__ = true when fonts + layout are settled
 *
 * Puppeteer waits for window.__RESUME_READY__ before capturing the PDF.
 */
import { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import ResumePrintView from '../../print/ResumePrintView';
import { resumeApi } from '../../api/resume.api';

export default function PrintResumePage() {
  const { resumeId } = useParams({ strict: false }) as { resumeId: string };
  const [resume, setResume] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Force light mode for PDF rendering
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    
    if (!resumeId) {
      setError('No resume ID provided');
      (window as any).__RESUME_ERROR__ = true;
      return;
    }

    // Puppeteer passes the JWT via Authorization header which sets it in localStorage
    // via page.evaluateOnNewDocument — but as a fallback, also check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      localStorage.setItem('token', tokenParam);
    }

    resumeApi
      .getResume(resumeId)
      .then((data: any) => {
        setResume(data);
      })
      .catch((err: any) => {
        setError(err?.message ?? 'Failed to load resume');
        (window as any).__RESUME_ERROR__ = true;
      });
  }, [resumeId]);

  // Signal Puppeteer that the page is ready
  useEffect(() => {
    if (resume) {
      // Give fonts and layout an extra 600ms to settle after resume loads
      const timer = setTimeout(() => {
        (window as any).__RESUME_READY__ = true;
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [resume]);

  if (error) {
    return (
      <div
        style={{
          width: '210mm',
          minHeight: '297mm',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          color: '#ef4444',
          fontSize: '14px',
        }}
      >
        Error: {error}
      </div>
    );
  }

  if (!resume) {
    return (
      <div
        style={{
          width: '210mm',
          minHeight: '297mm',
          background: 'white',
        }}
      />
    );
  }

  return (
    <ResumePrintView
      resume={resume}
      template={resume.template}
      theme={resume.theme}
      font={resume.font}
      spacing={resume.spacing}
    />
  );
}
