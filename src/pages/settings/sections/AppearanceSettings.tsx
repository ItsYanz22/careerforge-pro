import { useState, useEffect } from 'react';
import { useSettingsStore, UserPreferences } from '../../../stores/settingsStore';
import { useUIStore } from '../../../stores/uiStore';
import { Moon, Sun, Monitor, Save, Loader2, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { THEME_PALETTES } from '../../../config/themeSystem';

const ACCENT_COLORS = Object.values(THEME_PALETTES).map(theme => ({
  name: theme.id,
  label: theme.label,
  description: theme.description,
  // Use primary light color for preview swatch
  bg: `hsl(${theme.primary_light})`,
}));

const SPACING_OPTIONS = [
  { value: 'compact',     label: 'Compact',     desc: 'Reduced spacing' },
  { value: 'comfortable', label: 'Comfortable', desc: 'Default spacing' },
  { value: 'spacious',    label: 'Spacious',    desc: 'Extra breathing room' },
];

const TYPOGRAPHY_OPTIONS = [
  { value: 'default',     label: 'Default',     desc: 'Standard typography' },
  { value: 'comfortable', label: 'Comfortable', desc: 'Slightly larger text' },
  { value: 'wide',        label: 'Wide',        desc: 'More letter spacing' },
];

const inputClass = 'w-full px-3 py-2 text-sm bg-background dark:bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all';

export default function AppearanceSettings() {
  const { preferences, isSaving, updateAppearance } = useSettingsStore();
  const { toggleTheme, theme, setActiveTheme } = useUIStore();

  const [appearance, setAppearance] = useState<UserPreferences['appearance']>({
    darkMode: false,
    themeMode: 'system',
    accentColor: 'emerald',
    spacing: 'comfortable',
    typography: 'default',
  });

  useEffect(() => {
    if (preferences?.appearance) setAppearance(preferences.appearance);
  }, [preferences]);

  const handleThemeMode = (mode: 'system' | 'light' | 'dark') => {
    setAppearance((p) => ({ ...p, themeMode: mode }));
    // Apply immediately
    if (mode === 'dark' && theme !== 'dark') toggleTheme();
    if (mode === 'light' && theme !== 'light') toggleTheme();
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark && theme !== 'dark') toggleTheme();
      if (!prefersDark && theme !== 'light') toggleTheme();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAppearance(appearance);
      // Apply accent color theme immediately
      setActiveTheme(appearance.accentColor);
      toast.success('Appearance settings saved');
    } catch {
      toast.error('Failed to save appearance settings');
    }
  };

  const sectionClass = 'bg-card rounded-2xl border border-border p-5';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Theme Mode */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sun className="w-4 h-4 text-muted-foreground" /> Theme Mode
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { mode: 'light',  icon: Sun,     label: 'Light' },
            { mode: 'dark',   icon: Moon,    label: 'Dark' },
            { mode: 'system', icon: Monitor, label: 'System' },
          ].map(({ mode, icon: Icon, label }) => (
            <motion.button
              key={mode}
              type="button"
              onClick={() => handleThemeMode(mode as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                appearance.themeMode === mode
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.12)]'
                  : 'border-border hover:border-muted-foreground/30 dark:hover:border-muted-foreground/30 hover:bg-muted/50 dark:hover:bg-muted'
              }`}
            >
              <Icon className={`w-5 h-5 ${appearance.themeMode === mode ? 'text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span className={`text-xs font-semibold ${appearance.themeMode === mode ? 'text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" /> Accent Color Theme
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {ACCENT_COLORS.map((color) => (
            <motion.button
              key={color.name}
              type="button"
              onClick={() => setAppearance((p) => ({ ...p, accentColor: color.name as any }))}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                appearance.accentColor === color.name
                  ? 'border-foreground bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.12)]'
                  : 'border-border hover:border-muted-foreground/40'
              }`}
              title={color.description}
            >
              <div className="w-6 h-6 rounded-lg shadow-soft" style={{ backgroundColor: color.bg }} />
              <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">{color.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-foreground mb-3">Spacing</h3>
        <div className="space-y-2">
          {SPACING_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted dark:hover:bg-muted cursor-pointer transition-colors">
              <input type="radio" name="spacing" value={opt.value} checked={appearance.spacing === opt.value}
                onChange={() => setAppearance((p) => ({ ...p, spacing: opt.value as any }))}
                className="w-4 h-4 accent-primary-600" />
              <div>
                <div className="text-sm font-medium text-foreground">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-foreground mb-3">Typography</h3>
        <div className="space-y-2">
          {TYPOGRAPHY_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted dark:hover:bg-muted cursor-pointer transition-colors">
              <input type="radio" name="typography" value={opt.value} checked={appearance.typography === opt.value}
                onChange={() => setAppearance((p) => ({ ...p, typography: opt.value as any }))}
                className="w-4 h-4 accent-primary-600" />
              <div>
                <div className="text-sm font-medium text-foreground">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </div>
            </label>
          ))}
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
