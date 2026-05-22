import { useEffect, useRef, useState } from 'react';
import { useResumeStore } from '../../stores/resumeStore';
import { getTemplate } from '../../templates/TemplateRegistry';
import { getThemeColors, getFontFamily, getSpacingStyles } from '../../utils/theme-mapper';
import { ZoomIn, ZoomOut, Printer } from 'lucide-react';
import { ExportButton } from '../../components/export/ExportButton';
import { ResumePreviewContainer } from '../../components/resume/ResumePreviewIsolation';

export default function ResumePreview() {
  const { currentResume } = useResumeStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Auto-scale to fit container on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 64; // 32px padding on each side
        const A4_WIDTH = 794; // A4 pixel width at 96 DPI
        const newScale = Math.min(Math.max(containerWidth / A4_WIDTH, 0.4), 1.5);
        setScale(newScale);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!currentResume) return null;

  const TemplateComponent = getTemplate(currentResume.template || 'modern-blue');
  const colors = getThemeColors(currentResume.theme);
  const fontFamily = getFontFamily(currentResume.font);
  const spacingStyles = getSpacingStyles(currentResume.spacing);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="h-14 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 shrink-0 shadow-sm z-10 transition-all print:hidden">
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
          <button 
            onClick={() => setScale(s => Math.max(s - 0.1, 0.4))}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-all"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-semibold text-muted-foreground min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => setScale(s => Math.min(s + 0.1, 1.5))}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-all"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-all shadow-sm"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Print</span>
          </button>
          {currentResume && (
            <ExportButton
              resumeId={currentResume._id}
              resumeTitle={currentResume.title}
            />
          )}
        </div>
      </div>

      {/* Preview Area */}
      <ResumePreviewContainer className="flex-1 overflow-auto bg-transparent custom-scrollbar p-8 flex justify-center items-start relative perspective-[1000px] print:p-0 print:overflow-visible print:block">
        <div 
          ref={containerRef}
          className="resume-preview-container bg-white rounded-sm transform-gpu origin-top transition-transform duration-300 ease-out print:m-0 print:shadow-none print:border-none print:w-[794px] print:h-[1123px]"
          style={{ 
            width: '794px', // A4 pixel width at 96 DPI
            minHeight: '1123px', // A4 pixel height
            transform: `scale(var(--preview-scale, ${scale})) translateZ(0)`,
            marginBottom: `calc((var(--preview-scale, ${scale}) - 1) * 1123px)`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 20px 40px -10px rgba(0,0,0,0.1), 0 30px 60px -20px rgba(0,0,0,0.15)',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            
            // Core dynamic theme variables available to ALL templates
            '--resume-primary': colors.primary,
            '--resume-background': colors.background,
            '--resume-text': colors.text,
            '--resume-font': fontFamily,
            '--resume-line-height': spacingStyles.lineHeight,
            '--resume-padding': spacingStyles.padding,
            '--resume-gap': spacingStyles.gap,
            '--resume-bullet-gap': spacingStyles.bulletGap,
            
            fontFamily: 'var(--resume-font)',
            color: 'var(--resume-text)',
            lineHeight: 'var(--resume-line-height)',
            transition: 'color 0.25s ease, background-color 0.25s ease, font-family 0.2s ease'
          } as React.CSSProperties}
        >
          {/* Paper Depth Effect */}
          <div className="absolute inset-0 pointer-events-none rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] print:hidden" />
          
          <div className="h-full w-full" style={{ padding: 'var(--resume-padding)' }}>
            <TemplateComponent resume={currentResume} />
          </div>
        </div>
      </ResumePreviewContainer>
    </div>
  );
}
