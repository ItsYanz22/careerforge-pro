import { useState } from 'react';
import { useResumeStore } from '@stores/resumeStore';
import { resumeApi } from '../../../api/resume.api';
import { X, Sparkles, Loader, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistantModal from '@components/ai/AIAssistantModal';
import toast from 'react-hot-toast';

interface SkillSuggestion {
  skill: string;
  reason: string;
  category: string;
}

export default function SkillsForm() {
  const { currentResume, updateResumeData } = useResumeStore();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  if (!currentResume) return null;

  // Ensure skills is handled as SkillCategory[] but flattened for the tag UI
  const rawSkills = currentResume.data?.skills || [];
  const skills: string[] = Array.isArray(rawSkills) 
    ? rawSkills.flatMap((cat: any) => cat.items || [])
    : [];

  const handleAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addSkills(inputValue.trim());
      setInputValue('');
    }
  };

  const addSkills = (skillInput: string) => {
    const newSkillNames = skillInput.split(',').map((s: string) => s.trim()).filter((s: string) => s && !skills.includes(s));
    if (newSkillNames.length === 0) return;

    // Update by adding to the first category, or creating one "Technical Skills"
    const updatedSkills = [...rawSkills];
    if (updatedSkills.length === 0) {
      updatedSkills.push({ category: 'Technical Skills', items: newSkillNames });
    } else {
      updatedSkills[0] = {
        ...updatedSkills[0],
        items: [...(updatedSkills[0].items || []), ...newSkillNames]
      };
    }

    updateResumeData(currentResume._id, { skills: updatedSkills });
    // Remove from suggestions if present
    setSuggestions(prev => prev.filter(s => !newSkillNames.includes(s.skill)));
  };

  const handleRemove = (skillToRemove: string) => {
    const updatedSkills = rawSkills.map((cat: any) => ({
      ...cat,
      items: (cat.items || []).filter((s: string) => s !== skillToRemove)
    })).filter((cat: any) => cat.items.length > 0);

    updateResumeData(currentResume._id, { skills: updatedSkills });
  };

  const fetchSuggestions = async () => {
    if (isSuggesting) return;
    setIsSuggesting(true);
    try {
      const res = await resumeApi.getSkillSuggestions(currentResume._id);
      setSuggestions(res.suggestions || []);
      if (res.suggestions?.length === 0) {
        toast("AI couldn't find more suggestions. Try adding more experience/projects first.", { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Failed to fetch suggestions', error);
      toast.error('Failed to get suggestions');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAIAccept = (newText: string) => {
    addSkills(newText);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight flex items-center gap-2">
            Skills
            <Sparkles className="w-5 h-5 text-primary" />
          </h2>
          <p className="text-sm font-medium text-muted-foreground">Add your technical and soft skills. Press Enter or comma to separate.</p>
        </div>
        <button 
          onClick={() => setIsAIModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-primary-700 bg-primary-50 dark:bg-primary-950 border border-primary-200/50 dark:border-primary-200/20 rounded-xl hover:bg-primary-100 hover:text-primary-800 transition-all shadow-sm hover:shadow"
        >
          <Sparkles size={14} className="text-primary-500" />
          AI Rewrite
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2.5 p-5 border border-border dark:border-border rounded-2xl bg-secondary/50 min-h-[120px] focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary focus-within:bg-card dark:bg-card transition-all shadow-sm">
            <AnimatePresence>
              {skills.map((skill: string, index: number) => (
                <motion.div 
                  key={`${skill}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-card dark:bg-card border border-border dark:border-border rounded-lg text-sm font-semibold text-foreground shadow-sm group"
                >
                  {skill}
                  <button 
                    onClick={() => handleRemove(skill)}
                    className="p-0.5 text-muted-foreground hover:text-red-500 hover:bg-destructive/10 rounded-md transition-colors ml-1"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleAdd}
              placeholder={skills.length === 0 ? "Type a skill and press Enter..." : "Add more..."}
              className="flex-1 min-w-[180px] bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground py-1.5"
            />
          </div>
        </div>

        {/* AI Suggestions Section */}
        <div className="bg-secondary/30 border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Suggested Skills
            </h3>
            <button
              onClick={fetchSuggestions}
              disabled={isSuggesting}
              className="px-3 py-1.5 bg-card hover:bg-secondary border border-border rounded-lg text-xs font-bold text-foreground transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSuggesting ? <Loader className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-primary" />}
              {suggestions.length > 0 ? 'Refresh' : 'Get Suggestions'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {isSuggesting && suggestions.length === 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 italic">
                <Loader className="w-3 h-3 animate-spin" />
                Analyzing your experience and projects...
              </div>
            )}
            
            {!isSuggesting && suggestions.length === 0 && (
              <p className="text-xs text-muted-foreground py-2 italic font-medium">
                Click "Get Suggestions" to see skills based on your projects and experience.
              </p>
            )}

            <AnimatePresence>
              {suggestions.map((s) => (
                <motion.button
                  key={s.skill}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => addSkills(s.skill)}
                  title={s.reason}
                  className="px-3 py-1.5 bg-card hover:bg-primary-50 dark:hover:bg-primary-950 border border-border hover:border-primary/30 rounded-xl text-xs font-bold text-foreground flex items-center gap-2 transition-all shadow-sm group"
                >
                  <PlusCircle size={14} className="text-primary opacity-50 group-hover:opacity-100" />
                  {s.skill}
                  <span className="sr-only">({s.reason})</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AIAssistantModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        originalText={skills.join(', ')} 
        onAccept={handleAIAccept} 
        contextType="skills" 
      />
    </div>
  );
}
