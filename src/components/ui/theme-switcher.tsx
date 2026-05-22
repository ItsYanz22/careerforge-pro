import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../context/theme-context';

export function ThemeSwitcher() {
  const { mode, setMode } = useTheme();

  const buttonClasses = (isActive: boolean) => 
    `p-1.5 rounded-lg transition-all ${
      isActive 
        ? 'bg-card text-foreground shadow-sm' 
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <div className="flex items-center gap-1 bg-secondary dark:bg-card p-1 rounded-xl">
      <button
        onClick={() => setMode('light')}
        className={buttonClasses(mode === 'light')}
        title="Light Mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setMode('system')}
        className={buttonClasses(mode === 'system')}
        title="System Preference"
      >
        <Monitor size={16} />
      </button>
      <button
        onClick={() => setMode('dark')}
        className={buttonClasses(mode === 'dark')}
        title="Dark Mode"
      >
        <Moon size={16} />
      </button>
    </div>
  );
}
