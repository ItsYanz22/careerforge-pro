import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Check, RefreshCw, Wand2, ArrowRight } from 'lucide-react';
import { aiApi } from '../../api/ai.api';
import toast from 'react-hot-toast';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onAccept: (newText: string) => void;
  contextType: 'summary' | 'experience' | 'skills';
}

const prompts = {
  summary: [
    "Make it more professional",
    "Shorten to 2 sentences",
    "Focus on leadership",
    "Optimize for tech roles"
  ],
  experience: [
    "Use strong action verbs",
    "Make it sound more impactful",
    "Highlight quantifiable results",
    "Fix grammar & tone"
  ],
  skills: [
    "Group by category",
    "Suggest related skills",
    "Format consistently"
  ]
};

export default function AIAssistantModal({
  isOpen,
  onClose,
  originalText,
  onAccept,
  contextType
}: AIAssistantModalProps) {
  const [inputText, setInputText] = useState(originalText);
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputText(originalText);
      setGeneratedText('');
      setActivePrompt(null);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, originalText]);

  const handleGenerate = async (prompt?: string) => {
    if (!inputText.trim()) {
      toast.error('Please provide some text to rewrite');
      return;
    }

    setIsGenerating(true);
    setActivePrompt(prompt || 'Custom prompt');
    
    try {
      const type = contextType === 'summary' ? 'summary' : 'bullet';
      const targetKeywords = prompt ? [prompt] : undefined;
      
      const result: any = await aiApi.rewriteText({
        type,
        content: inputText,
        targetKeywords,
      });

      // The backend returns the parsed JSON from Gemini (e.g., { rewritten: "..." })
      const textToDisplay = result?.rewritten || (typeof result === 'string' ? result : 'Failed to parse response');
      setGeneratedText(textToDisplay);
    } catch (error: any) {
      console.error('AI Rewrite Error:', error);
      toast.error(error.message || 'Failed to generate content. Please try again.');
      setGeneratedText('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    onAccept(generatedText);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-card/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-xl bg-card rounded-2xl shadow-premium border border-border overflow-hidden z-10"
          >
            {/* Header — command palette style */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-border">
              <div className="flex items-center justify-center w-7 h-7 bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.15)] rounded-lg">
                <Sparkles size={14} className="text-[hsl(var(--primary))]" />
              </div>
              <span className="font-semibold text-sm text-foreground">AI Rewrite</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                {contextType}
              </span>
              <button
                onClick={onClose}
                className="ml-auto p-1.5 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Input Area */}
              {!generatedText && !isGenerating && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                    Original text
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
                    }}
                    className="
                      w-full px-3 py-2.5 text-sm
                      bg-background dark:bg-card
                      border border-border dark:border-border
                      rounded-xl text-foreground
                      focus:bg-secondary
                      focus:ring-2 focus:ring-primary/40 focus:border-primary
                      outline-none transition-all resize-none min-h-[80px]
                      placeholder:text-muted-foreground
                    "
                    placeholder="Paste text to rewrite… (⌘↵ to auto-rewrite)"
                  />
                </div>
              )}

              {/* Quick prompts */}
              {!generatedText && !isGenerating && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                    Quick actions
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {prompts[contextType].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleGenerate(prompt)}
                        className="
                          px-2.5 py-1.5 text-xs font-medium
                          text-foreground-muted
                          bg-secondary
                          border border-border dark:border-border
                          rounded-lg hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] dark:hover:text-[hsl(var(--primary-light))]
                          hover:bg-[hsl(var(--primary)_/_0.1)] dark:hover:bg-[hsl(var(--primary)_/_0.15)]
                          transition-all
                        "
                      >
                        {prompt}
                      </button>
                    ))}
                    <button
                      onClick={() => handleGenerate()}
                      className="
                        px-2.5 py-1.5 text-xs font-semibold
                        text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]
                        bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.15)]
                        border border-[hsl(var(--primary)_/_0.3)] dark:border-[hsl(var(--primary)_/_0.3)]
                        rounded-lg hover:bg-[hsl(var(--primary)_/_0.2)] dark:hover:bg-[hsl(var(--primary)_/_0.25)]
                        transition-all flex items-center gap-1
                      "
                    >
                      <Wand2 size={11} />
                      Auto Rewrite
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              )}

              {/* Loading */}
              {isGenerating && (
                <div className="py-8 flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="text-primary"
                  >
                    <RefreshCw size={20} />
                  </motion.div>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">{activePrompt ?? 'Rewriting…'}</p>
                </div>
              )}

              {/* Result */}
              {generatedText && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <label className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} /> Suggestion
                  </label>
                  <div className="
                    px-3 py-2.5 text-sm leading-relaxed
                    bg-[hsl(var(--primary)_/_0.1)]/60 dark:bg-[hsl(var(--primary)_/_0.1)]
                    border border-[hsl(var(--primary)_/_0.2)] dark:border-[hsl(var(--primary)_/_0.2)]
                    rounded-xl text-foreground
                    whitespace-pre-wrap
                  ">
                    {generatedText}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleGenerate(activePrompt ?? undefined)}
                      className="
                        flex-1 flex items-center justify-center gap-1.5
                        px-3 py-2 text-xs font-semibold
                        text-foreground-muted
                        bg-secondary
                        border border-border dark:border-border
                        rounded-xl hover:bg-background dark:hover:bg-muted
                        transition-colors
                      "
                    >
                      <RefreshCw size={12} />
                      Regenerate
                    </button>
                    <button
                      onClick={handleAccept}
                      className="
                        flex-1 flex items-center justify-center gap-1.5
                        px-3 py-2 text-xs font-semibold
                        text-white bg-primary hover:bg-primary/90
                        rounded-xl transition-colors shadow-soft
                      "
                    >
                      <Check size={12} />
                      Apply
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
