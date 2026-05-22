import React, { useCallback, useState } from 'react';
import { Download, Loader2, Lock, ChevronDown, FileText, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useExportStore } from '../../stores/exportStore';
import { useAuthStore } from '../../stores/authStore';
import { exportApi } from '../../api/export.api';
import { notify } from '../../stores/notificationStore';
import { useResumeStore } from '../../stores/resumeStore';
import { TEMPLATES } from '../resume/ThemeCustomizer';

interface ExportButtonProps {
  resumeId: string;
  resumeTitle?: string;
  className?: string;
}

const STAGE_LABELS: Record<string, string> = {
  idle:        'Export',
  preparing:   'Preparing�',
  rendering:   'Rendering�',
  generating:  'Generating�',
  downloading: 'Downloading�',
  error:       'Retry Export',
};

export const ExportButton: React.FC<ExportButtonProps> = ({
  resumeId,
  resumeTitle = 'resume',
  className = '',
}) => {
  const { stage, startExport, setStage, setError, reset } = useExportStore();
  const user = useAuthStore((s) => s.user);
  const { currentResume } = useResumeStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const isPro = user?.features?.unlimitedExports === true;
  const hasPremiumTemplates = user?.features?.premiumTemplates === true;
  const currentTemplateDef = TEMPLATES.find(t => t.id === currentResume?.template);
  const isPremiumTemplate = currentTemplateDef?.isPremium;
  const isUsingPremiumWithoutAccess = isPremiumTemplate && !hasPremiumTemplates;
  const isActive = stage !== 'idle' && stage !== 'error';
  const isError = stage === 'error';

  const triggerExport = useCallback(async (format: 'pdf' | 'docx' = 'pdf') => {
    if (isActive) return;
    setShowDropdown(false);

    // Block premium template export for free users
    if (format === 'pdf' && isUsingPremiumWithoutAccess) {
      toast.error('Upgrade to Pro to export premium templates.', { icon: '??', duration: 4000 });
      return;
    }

    // Block DOCX for free users
    if (format === 'docx' && !isPro) {
      toast.error('DOCX export requires a Pro subscription.', { icon: '??', duration: 4000 });
      return;
    }

    startExport();

    try {
      setStage('rendering');
      await new Promise((r) => setTimeout(r, 200));
      setStage('generating');

      let blob: Blob;
      const ext = format === 'docx' ? 'docx' : 'pdf';

      if (format === 'pdf') {
        blob = await exportApi.exportPDF(resumeId);
      } else {
        blob = await exportApi.exportDOCX(resumeId);
      }

      setStage('downloading');
      exportApi.downloadBlob(blob, `${resumeTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${ext}`);
      notify.pdfExported(resumeTitle);
      toast.success(`${format.toUpperCase()} exported successfully!`, { duration: 2500 });
      await new Promise((r) => setTimeout(r, 1500));
      reset();
    } catch (err: any) {
      const msg: string = err?.message ?? 'Export failed';
      if (err?.status === 403) {
        reset();
        toast.error('Upgrade to Pro for this export option.', { icon: '??', duration: 4000 });
        return;
      }
      if (err?.status === 504) {
        setError('Generation timed out. Please try again.');
        return;
      }
      setError(msg);
    }
  }, [isActive, resumeId, resumeTitle, startExport, setStage, setError, reset, isUsingPremiumWithoutAccess, isPro]);

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Main export button */}
      <button
        onClick={() => triggerExport('pdf')}
        disabled={isActive}
        className={`
          inline-flex items-center gap-2 h-9 pl-3.5 pr-3 text-sm font-semibold
          rounded-l-xl border-r border-white/20
          transition-all duration-150 active:scale-[0.98]
          disabled:opacity-70 disabled:cursor-not-allowed
          ${isError
            ? 'bg-destructive hover:bg-destructive/90 text-white'
            : 'hover:shadow-lg text-[hsl(var(--btn-primary-text))]'
          }
        `}
        style={!isError ? { background: 'var(--gradient-primary)' } : undefined}
      >
        {isActive
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : isError
            ? <span className="text-xs">?</span>
            : <Download className="w-3.5 h-3.5" />
        }
        <span className="hidden sm:inline">{STAGE_LABELS[stage] ?? 'Export'}</span>
      </button>

      {/* Dropdown toggle */}
      <button
        onClick={() => !isActive && setShowDropdown(v => !v)}
        disabled={isActive}
        className={`
          inline-flex items-center justify-center w-8 h-9 rounded-r-xl
          transition-all duration-150 active:scale-[0.98]
          disabled:opacity-70 disabled:cursor-not-allowed
          ${isError
            ? 'bg-destructive hover:bg-destructive/90 text-white'
            : 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.9)] text-[hsl(var(--btn-primary-text))]'
          }
        `}
        style={!isError ? { background: 'var(--gradient-primary)' } : undefined}
        aria-label="More export options"
      >
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="
                absolute right-0 bottom-full mb-2 w-48 z-50
                bg-card dark:bg-card
                border border-border dark:border-border
                rounded-2xl shadow-xl overflow-hidden p-1
              "
            >
              {/* PDF option */}
              <button
                onClick={() => triggerExport('pdf')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary dark:hover:bg-card rounded-xl transition-colors"
              >
                <div className="w-7 h-7 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-destructive" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-foreground">PDF Document</div>
                  <div className="text-[10px] text-muted-foreground">
                    {isPro ? 'Watermark-free' : 'Basic export'}
                  </div>
                </div>
              </button>

              {/* DOCX option */}
              <button
                onClick={() => triggerExport('docx')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary dark:hover:bg-card rounded-xl transition-colors"
              >
                <div className="w-7 h-7 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm flex items-center justify-center text-[8px] text-white font-bold">W</div>
                </div>
                <div className="text-left flex-1">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    DOCX Document
                    {!isPro && <Crown size={10} className="text-warning" />}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {isPro ? 'ATS-safe Word format' : 'Pro required'}
                  </div>
                </div>
                {!isPro && <Lock size={12} className="text-muted-foreground flex-shrink-0" />}
              </button>

              {/* Free user note */}
              {!isPro && (
                <div className="mx-2 mt-1 mb-1 px-2 py-1.5 bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.12)] rounded-lg">
                  <p className="text-[10px] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))] font-medium">
                    Upgrade to Pro for watermark-free exports & DOCX
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportButton;
