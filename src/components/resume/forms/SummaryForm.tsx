import { useState } from 'react';
import { useResumeStore } from '@stores/resumeStore';
import { useAuthStore } from '@stores/authStore';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import AIAssistantModal from '@components/ai/AIAssistantModal';
import { apiClient } from '@api/apiClient';
import toast from 'react-hot-toast';

export default function SummaryForm() {
  const { currentResume, updateResumeData } = useResumeStore();
  const user = useAuthStore((s) => s.user);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState('');

  if (!currentResume) return null;

  const summary = currentResume.data?.summary ?? '';

  const handleChange = (value: string) => {
    updateResumeData(currentResume._id, { summary: value });
  };

  const handleGenerateFromScratch = async () => {
    setIsGenerating(true);
    try {
      const result: any = await apiClient.post('/ai/generate-summary', {
        resumeData: currentResume.data,
        targetRole: targetRole.trim() || undefined,
      });
      const generated = result?.data?.summary ?? result?.summary ?? '';
      if (generated) {
        handleChange(generated);
        toast.success('Summary generated!');
      }
    } catch (err: any) {
      if (err?.status === 429) {
        toast.error('Monthly AI limit reached. Upgrade to Pro for unlimited rewrites.');
      } else {
        toast.error(err?.message ?? 'Failed to generate summary');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const aiUsageLeft = user?.features?.advancedAI
    ? '∞'
    : Math.max(0, 5 - (user?.aiUsageCount ?? 0));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Professional Summary
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            A compelling 2–3 sentence overview of your career.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!user?.features?.advancedAI && (
            <span className="text-[10px] font-semibold text-muted-foreground">
              {aiUsageLeft} rewrites left
            </span>
          )}
          <button
            onClick={() => setIsAIModalOpen(true)}
            disabled={!summary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Rewrite
          </button>
        </div>
      </div>

      {/* Generate from scratch */}
      <div className="bg-secondary dark:bg-card/50 border border-border dark:border-border rounded-2xl p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">
          Generate from scratch using your resume data
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target role (optional, e.g. Senior Engineer)"
            className="flex-1 px-3 py-2 text-sm bg-secondary border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handleGenerateFromScratch}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <textarea
          value={summary}
          onChange={(e) => handleChange(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-input border border-input rounded-xl text-foreground focus:bg-secondary focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all resize-y placeholder:text-muted-foreground leading-relaxed text-sm"
          placeholder="Experienced Software Engineer with a demonstrated history of working in the tech industry..."
        />
        <div className="flex justify-end text-xs text-muted-foreground">
          {summary.length} characters
        </div>
      </div>

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        originalText={summary}
        onAccept={handleChange}
        contextType="summary"
      />
    </div>
  );
}
