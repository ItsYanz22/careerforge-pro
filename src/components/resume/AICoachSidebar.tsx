import { useState } from 'react';
import { Bot, Loader2, Target, Type, Zap, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiApi } from '../../api/ai.api';
import toast from 'react-hot-toast';

interface AICoachSidebarProps {
  contentToAnalyze: string;
  type: string;
  onApply?: (suggestedText: string) => void;
}

export default function AICoachSidebar({ contentToAnalyze, type, onApply }: AICoachSidebarProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!contentToAnalyze.trim()) {
      toast.error('Nothing to analyze.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const response = await aiApi.coachSection({ content: contentToAnalyze, type });
      setAnalysis(response);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to analyze section');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-card border-l border-border dark:border-border h-full flex flex-col shadow-xl">
      <div className="px-5 py-4 border-b border-border dark:border-border flex items-center gap-3 bg-background dark:bg-card/50">
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)_/_0.15)] dark:bg-[hsl(var(--primary)_/_0.2)] flex items-center justify-center text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))]">
          <Bot size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">AI Resume Coach</h3>
          <p className="text-xs text-muted-foreground">Live Feedback</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !contentToAnalyze.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50"
        >
          {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Selection'}
        </button>

        <AnimatePresence mode="wait">
          {analysis && !isAnalyzing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              
              <div className="p-4 bg-background dark:bg-card/50 rounded-xl border border-border dark:border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Score</div>
                  <div className="text-2xl font-black text-[hsl(var(--primary))]">{analysis.score}/100</div>
                </div>
                {analysis.score >= 80 ? <CheckCircle2 size={32} className="text-[hsl(var(--primary))] opacity-20" /> : <AlertTriangle size={32} className="text-amber-500 opacity-20" />}
              </div>

              {analysis.overallFeedback && (
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Bot size={14} className="text-[hsl(var(--primary))]" /> Recruiter Feedback</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{analysis.overallFeedback}</p>
                </div>
              )}

              {analysis.grammarIssues?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Type size={14} className="text-warning"/> Grammar & Clarity</h4>
                  <ul className="space-y-1">
                    {analysis.grammarIssues.map((issue: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2"><ChevronRight size={14} className="mt-0.5 text-muted-foreground"/> <span>{issue}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.weakWords?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertTriangle size={14} className="text-destructive"/> Weak Words Detected</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.weakWords.map((word: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg border border-destructive/20">{word}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.suggestedActionVerbs?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Zap size={14} className="text-[hsl(var(--primary))]" /> Action Verbs to Use</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.suggestedActionVerbs.map((verb: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.15)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))] text-xs font-semibold rounded-lg border border-[hsl(var(--primary)_/_0.3)] dark:border-[hsl(var(--primary)_/_0.3)]">{verb}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.impactSuggestions && (
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Target size={14} className="text-[hsl(var(--primary))]" /> Measurable Impact</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-primary/10 p-3 rounded-xl border border-primary/20">{analysis.impactSuggestions}</p>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

