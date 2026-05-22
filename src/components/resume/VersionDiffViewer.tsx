import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, ArrowLeft, ArrowRight, Save, AlertCircle } from 'lucide-react';
import { diffWordsWithSpace } from 'diff';
import { resumeApi } from '../../api/resume.api';
import { useResumeStore } from '../../stores/resumeStore';
import toast from 'react-hot-toast';

interface VersionDiffViewerProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  versionId: string;
  versionNumber: number;
}

export default function VersionDiffViewer({ isOpen, onClose, resumeId, versionId, versionNumber }: VersionDiffViewerProps) {
  const [versionData, setVersionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentResume, loadResume } = useResumeStore();

  useEffect(() => {
    if (isOpen && versionId) {
      fetchVersion();
    }
  }, [isOpen, versionId]);

  const fetchVersion = async () => {
    setIsLoading(true);
    try {
      const response = await resumeApi.getVersion(resumeId, versionId);
      setVersionData(response);
    } catch (err) {
      toast.error('Failed to load version data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('Are you sure you want to restore this version? This will overwrite your current progress (a backup will be saved).')) return;
    
    try {
      await resumeApi.restoreVersion(resumeId, versionId);
      await loadResume(resumeId);
      toast.success(`Restored Version ${versionNumber}`);
      onClose();
    } catch (err) {
      toast.error('Failed to restore version');
    }
  };

  const renderDiff = (oldText: string, newText: string) => {
    if (!oldText) oldText = '';
    if (!newText) newText = '';
    
    const diff = diffWordsWithSpace(oldText, newText);
    
    return (
      <div className="p-4 bg-background dark:bg-card/50 rounded-xl border border-border dark:border-border text-sm leading-relaxed">
        {diff.map((part, i) => (
          <span
            key={i}
            className={
              part.added 
                ? 'bg-[hsl(var(--primary)_/_0.15)] dark:bg-[hsl(var(--primary)_/_0.2)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] font-medium px-0.5 rounded' 
                : part.removed 
                  ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 line-through px-0.5 rounded' 
                  : 'text-foreground-muted'
            }
          >
            {part.value}
          </span>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden border border-border flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-border flex items-center justify-between bg-background/50 dark:bg-card/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-foreground shadow-lg">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Compare Versions</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-[10px] font-bold rounded uppercase tracking-wider">Current</span>
                    <ArrowRight size={12} className="text-muted-foreground" />
                    <span className="px-2 py-0.5 bg-[hsl(var(--primary)_/_0.1)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] text-[10px] font-bold rounded uppercase tracking-wider">Version {versionNumber}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRestore}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.1)] text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-accent/20 active:scale-95 disabled:opacity-50"
                >
                  <Save size={16} />
                  Restore This Version
                </button>
                <button onClick={onClose} className="p-2.5 text-muted-foreground hover:text-foreground dark:hover:text-white bg-secondary dark:bg-card rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                  <div className="w-10 h-10 border-4 border-[hsl(var(--primary)_/_0.2)] border-t-[hsl(var(--primary))] rounded-full animate-spin" />
                  <p className="text-sm font-medium text-muted-foreground">Calculating differences...</p>
                </div>
              ) : versionData && currentResume ? (
                <div className="space-y-10">
                  <div className="p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/20 flex gap-4">
                    <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-bold text-amber-900 dark:text-amber-400">Reviewing Changes</h5>
                      <p className="text-xs text-amber-800/70 dark:text-amber-400/70 leading-relaxed">
                        Text highlighted in <span className="bg-[hsl(var(--primary)_/_0.15)] dark:bg-[hsl(var(--primary)_/_0.2)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] px-1 rounded">green</span> was added in Version {versionNumber}, 
                        while <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-1 rounded line-through">red</span> text was removed.
                      </p>
                    </div>
                  </div>

                  {/* Summary Diff */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Professional Summary</h4>
                    {renderDiff(versionData.data?.summary || '', currentResume.data?.summary || '')}
                  </div>

                  {/* Experience Diff */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Work Experience</h4>
                    <div className="space-y-4">
                      {currentResume.data?.experience?.map((exp: any, i: number) => {
                        const oldExp = versionData.data?.experience?.[i];
                        return (
                          <div key={exp._id || i} className="space-y-2">
                            <div className="text-sm font-bold text-foreground">{exp.jobTitle} at {exp.company}</div>
                            {renderDiff(oldExp?.description, exp.description)}
                            <div className="pl-4 border-l-2 border-zinc-100 dark:border-border space-y-2 mt-2">
                              {exp.bulletPoints?.map((bullet: string, bIndex: number) => (
                                <div key={bIndex}>
                                  {renderDiff(oldExp?.bulletPoints?.[bIndex], bullet)}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills Diff */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Skills</h4>
                    {renderDiff(
                      (versionData.data?.skills || []).join(', '),
                      (currentResume.data?.skills || []).join(', ')
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">Error loading data.</div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-zinc-100 dark:border-border bg-background/50 dark:bg-card/30 flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Created on {versionData?.createdAt ? new Date(versionData.createdAt).toLocaleString() : 'Unknown'}
              </div>
              <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-foreground-muted hover:text-foreground transition-colors bg-secondary rounded-xl">
                Close Diff
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
