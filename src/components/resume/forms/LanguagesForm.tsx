import { useResumeStore } from '@stores/resumeStore';
import { Plus, Trash2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROFICIENCY_LEVELS = ['Elementary', 'Intermediate', 'Advanced', 'Native'] as const;

const inputClass =
  'w-full px-3 py-2 text-sm bg-input border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all';

export default function LanguagesForm() {
  const { currentResume, updateResumeData } = useResumeStore();
  const languages = currentResume?.data?.languages ?? [];

  const update = (updated: any[]) => {
    if (!currentResume) return;
    updateResumeData(currentResume._id, { languages: updated });
  };

  const add = () => update([...languages, { name: '', proficiency: 'Intermediate' }]);
  const remove = (i: number) => update(languages.filter((_: any, idx: number) => idx !== i));
  const change = (i: number, field: string, value: string) =>
    update(languages.map((l: any, idx: number) => (idx === i ? { ...l, [field]: value } : l)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary-500" />
            Languages
          </h2>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">
            Languages you speak and your proficiency level
          </p>
        </div>
        <button
          onClick={add}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-950 dark:bg-primary-950 text-primary-700 dark:text-primary-400 rounded-xl text-xs font-semibold hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      <AnimatePresence initial={false}>
        {languages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-foreground-muted text-sm"
          >
            No languages added yet.
          </motion.div>
        )}

        {languages.map((lang: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card dark:bg-card dark:bg-card border border-border dark:border-border dark:border-border rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                Language {i + 1}
              </span>
              <button
                onClick={() => remove(i)}
                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-destructive/10 dark:hover:bg-red-950 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Language *
                </label>
                <input
                  type="text"
                  value={lang.name}
                  onChange={(e) => change(i, 'name', e.target.value)}
                  placeholder="e.g. Spanish"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Proficiency
                </label>
                <select
                  value={lang.proficiency}
                  onChange={(e) => change(i, 'proficiency', e.target.value)}
                  className={inputClass}
                >
                  {PROFICIENCY_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visual proficiency indicator */}
            <div className="mt-3 flex gap-1">
              {PROFICIENCY_LEVELS.map((level, li) => {
                const currentIdx = PROFICIENCY_LEVELS.indexOf(lang.proficiency as any);
                return (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      li <= currentIdx ? 'bg-primary-50 dark:bg-primary-9500' : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}
                  />
                );
              })}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
