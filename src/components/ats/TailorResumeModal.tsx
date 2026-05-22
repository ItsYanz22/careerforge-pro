import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, X, Check, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { aiApi } from '../../api/ai.api';
import { useResumeStore } from '../../stores/resumeStore';
import toast from 'react-hot-toast';

interface TailorResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  jobDescription: string;
}

export default function TailorResumeModal({ isOpen, onClose, resumeId, jobDescription }: TailorResumeModalProps) {
  const [isTailoring, setIsTailoring] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { updateResumeData } = useResumeStore();

  const handleTailor = async () => {
    setIsTailoring(true);
    try {
      const response = await aiApi.tailorResume({ resumeId, jobDescription });
      setResult(response);
    } catch (err: any) {
      toast.error('Failed to tailor resume. Please try again.');
    } finally {
      setIsTailoring(false);
    }
  };

  const applyTailoredSummary = () => {
    if (!result?.tailoredSummary) return;
    updateResumeData(resumeId, { summary: result.tailoredSummary });
    toast.success('Tailored summary applied!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-card w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden border border-border dark:border-border flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-border flex items-center justify-between bg-background/50 dark:bg-card/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary">
                  <Wand2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">AI Resume Tailor</h3>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">Optimize your resume for this specific job</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {!result && !isTailoring ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={32} className="text-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">Ready to optimize?</h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground max-w-md mx-auto mb-8">
                    Our AI will analyze the job description and suggest specific changes to your summary, experience, and skills to maximize your match score.
                  </p>
                  <button
                    onClick={handleTailor}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                  >
                    Start AI Optimization
                  </button>
                </div>
              ) : isTailoring ? (
                <div className="text-center py-12 space-y-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Analyzing job requirements and tailoring your content...</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Strategy */}
                  <div className="p-4 bg-accent rounded-2xl border border-border flex gap-4">
                    <AlertCircle size={20} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-bold text-primary mb-1">Overall Strategy</h5>
                      <p className="text-xs text-primary/80 leading-relaxed">{result.overallStrategy}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Tailored Summary</h4>
                      <button onClick={applyTailoredSummary} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                        <Check size={14} /> Apply to Resume
                      </button>
                    </div>
                    <div className="p-4 bg-background dark:bg-card/50 rounded-2xl border border-border text-sm text-muted-foreground leading-relaxed">
                      {result.tailoredSummary}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Experience Optimizations</h4>
                    <div className="space-y-3">
                      {result.experienceOptimizations.map((opt: any, i: number) => (
                        <div key={i} className="p-4 bg-background dark:bg-card/50 rounded-2xl border border-border dark:border-border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recommendation {i+1}</span>
                            <div className="px-2 py-0.5 bg-warning/10 text-warning text-[10px] font-bold rounded-lg border border-warning/20 uppercase">
                              High Impact
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Original</div>
                              <p className="text-xs text-muted-foreground line-through">{opt.originalBullet}</p>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-[hsl(var(--primary))] uppercase mb-1">Tailored</div>
                              <p className="text-xs text-foreground font-medium">{opt.optimizedBullet}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-zinc-100 dark:border-border flex items-center justify-between gap-4">
                            <p className="text-[10px] italic text-muted-foreground">Reason: {opt.reason}</p>
                            <button className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 hover:text-foreground dark:hover:text-white transition-colors">
                              Copy <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Added Skills */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Recommended Skills to Add</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.addedSkills.map((skill: string) => (
                            <div className="px-3 py-1.5 bg-secondary text-muted-foreground text-xs font-bold rounded-xl border border-border">
                          + {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-100 dark:border-border bg-background/50 dark:bg-card/50 flex justify-end">
              <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
