import { useState, useEffect } from 'react';
import { useSettingsStore, UserPreferences } from '../../../stores/settingsStore';
import { FileText, Save, Loader2, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const selectClass =
  'w-full px-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/30] focus:border-[hsl(var(--primary))] transition-all';

const sectionClass = 'bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5';

export default function ResumePreferences() {
  const { preferences, isSaving, updatePreferences } = useSettingsStore();

  const [prefs, setPrefs] = useState<UserPreferences['resumePreferences']>({
    defaultTemplate: 'Modern',
    defaultFont: 'Inter',
    defaultExportFormat: 'pdf',
    autoSaveInterval: 30,
    atsOptimizationMode: false,
  });

  useEffect(() => {
    if (preferences?.resumePreferences) setPrefs(preferences.resumePreferences);
  }, [preferences]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPrefs((p) => ({
      ...p,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePreferences({ resumePreferences: prefs });
      toast.success('Resume preferences saved');
    } catch {
      toast.error('Failed to save resume preferences');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Template */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-zinc-400" /> Default Template
        </h3>
        <select name="defaultTemplate" value={prefs.defaultTemplate} onChange={handleChange} className={selectClass}>
          {['Modern', 'Executive', 'Creative', 'Minimal', 'Tech', 'ATSClassic'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">New resumes will use this template by default</p>
      </div>

      {/* Font */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Default Font</h3>
        <select name="defaultFont" value={prefs.defaultFont} onChange={handleChange} className={selectClass}>
          {['Inter', 'Manrope', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Merriweather', 'Playfair Display'].map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Export format */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Default Export Format</h3>
        <div className="space-y-2">
          {[
            { value: 'pdf',  label: 'PDF',           desc: 'Best for ATS compatibility' },
            { value: 'docx', label: 'Word Document',  desc: 'Editable format' },
            { value: 'json', label: 'JSON',           desc: 'For developers' },
          ].map((fmt) => (
            <label key={fmt.value}
              className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
              <input type="radio" name="defaultExportFormat" value={fmt.value}
                checked={prefs.defaultExportFormat === fmt.value} onChange={handleChange}
                className="w-4 h-4 accent-[hsl(var(--primary))]" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{fmt.label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{fmt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Auto-save */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Auto-save Interval</h3>
        <div className="flex items-center gap-3">
          <input type="number" name="autoSaveInterval" value={prefs.autoSaveInterval}
            onChange={handleChange} min="5" max="300" step="5"
            className="w-24 px-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))/30] focus:border-[hsl(var(--primary))]" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">seconds</span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
          Resume auto-saves every {prefs.autoSaveInterval}s while editing
        </p>
      </div>

      {/* ATS mode */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-zinc-400" /> ATS Optimization Mode
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Automatically optimize resumes for ATS systems
            </p>
          </div>
          <label className="relative cursor-pointer">
            <input type="checkbox" name="atsOptimizationMode" checked={prefs.atsOptimizationMode}
              onChange={handleChange} className="sr-only" />
            <div className={`w-10 rounded-full transition-colors ${prefs.atsOptimizationMode ? 'bg-[hsl(var(--primary))]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
              style={{ height: '22px' }}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs.atsOptimizationMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60"
          style={{ background: 'var(--gradient-primary)' }}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
