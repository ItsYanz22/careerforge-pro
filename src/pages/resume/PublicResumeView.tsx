import { useEffect, useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { Loader, Globe, ChevronLeft } from 'lucide-react';
import { resumeApi } from '../../api/resume.api';
import { PageTransition } from '../../components/ui/PageTransition';
import Modern from '../../templates/Modern';
import Minimal from '../../templates/Minimal';
import ATSClassic from '../../templates/ATSClassic';
import Executive from '../../templates/Executive';

const TEMPLATES: Record<string, any> = {
  'modern-blue': Modern,
  'modern': Modern,
  'minimalist': Minimal,
  'minimal': Minimal,
  'ats-optimized': ATSClassic,
  'classic': ATSClassic,
  'executive': Executive,
};

const DEFAULT_TEMPLATE = Modern;

export default function PublicResumeView() {
  const { shareId } = useParams({ strict: false });
  const [resume, setResume] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareId) fetchPublicResume();
  }, [shareId]);

  const fetchPublicResume = async () => {
    try {
      setIsLoading(true);
      const res = await resumeApi.getPublicResume(shareId as string);
      setResume(res);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Resume not found or private');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="animate-spin text-[hsl(var(--primary))]" size={40} />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card border-border p-10 rounded-3xl border shadow-xl text-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
             <Globe size={40} />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mb-8">{error || 'This resume is private or doesn\'t exist.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 text-[hsl(var(--primary))] font-bold hover:underline">
            <ChevronLeft size={16} /> Back to CareerForge
          </Link>
        </div>
      </div>
    );
  }

  const Template = TEMPLATES[resume.template] || DEFAULT_TEMPLATE;

  return (
    <PageTransition>
      <div className="min-h-screen bg-secondary dark:bg-card/50 pb-20">
        {/* Public Header */}
        <div className="sticky top-0 z-30 w-full bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border dark:border-border px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[hsl(var(--primary))] rounded-lg flex items-center justify-center text-white font-black text-xs">CF</div>
              <div>
                <h4 className="text-sm font-bold text-foreground leading-tight">{resume.data?.personal?.firstName} {resume.data?.personal?.lastName}</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Shared via CareerForge Pro</p>
              </div>
            </div>
            <Link 
              to="/" 
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-lg hover:scale-105 transition-all"
            >
              Create Your Own
            </Link>
          </div>
        </div>

        {/* Resume Content */}
        <div className="max-w-5xl mx-auto pt-10 px-4 flex flex-col items-center">
          <div className="w-full bg-white shadow-2xl rounded-sm overflow-hidden" style={{ minHeight: '1122px' }}>
             <Template data={resume.data} theme={resume.theme} font={resume.font} spacing={resume.spacing} />
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-foreground-muted">
           <p className="text-xs">Build your career with <span className="font-bold text-foreground-muted">CareerForge Pro</span></p>
        </div>
      </div>
    </PageTransition>
  );
}
