import { useResumeStore } from '@stores/resumeStore';
import { Plus, Trash2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const inputClass =
  'w-full px-3 py-2 text-sm bg-input border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all';

export default function VolunteerForm() {
  const { currentResume, updateResumeData } = useResumeStore();
  const volunteer = currentResume?.data?.volunteer ?? [];

  const update = (updated: any[]) => {
    if (!currentResume) return;
    updateResumeData(currentResume._id, { volunteer: updated });
  };

  const add = () =>
    update([
      ...volunteer,
      { organization: '', role: '', location: '', startDate: '', endDate: '', description: '' },
    ]);

  const remove = (i: number) => update(volunteer.filter((_: any, idx: number) => idx !== i));

  const change = (i: number, field: string, value: string) =>
    update(volunteer.map((v: any, idx: number) => (idx === i ? { ...v, [field]: value } : v)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary-500" />
            Volunteer Experience
          </h2>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">
            Community service and volunteer work
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
        {volunteer.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground dark:text-zinc-600 text-sm"
          >
            No volunteer experience added yet.
          </motion.div>
        )}

        {volunteer.map((vol: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card dark:bg-card dark:bg-card border border-border dark:border-border dark:border-border rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                Volunteer {i + 1}
              </span>
              <button
                onClick={() => remove(i)}
                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-destructive/10 dark:hover:bg-red-950 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Organization *
                </label>
                <input
                  type="text"
                  value={vol.organization}
                  onChange={(e) => change(i, 'organization', e.target.value)}
                  placeholder="e.g. Red Cross"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Role *
                </label>
                <input
                  type="text"
                  value={vol.role}
                  onChange={(e) => change(i, 'role', e.target.value)}
                  placeholder="e.g. Event Coordinator"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={vol.location}
                  onChange={(e) => change(i, 'location', e.target.value)}
                  placeholder="City, Country"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Start
                  </label>
                  <input
                    type="month"
                    value={vol.startDate}
                    onChange={(e) => change(i, 'startDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    End
                  </label>
                  <input
                    type="month"
                    value={vol.endDate}
                    onChange={(e) => change(i, 'endDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  value={vol.description}
                  onChange={(e) => change(i, 'description', e.target.value)}
                  placeholder="Describe your contributions and impact..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
