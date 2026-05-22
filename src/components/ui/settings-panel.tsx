import { useNavigate } from '@tanstack/react-router';
import { Settings } from 'lucide-react';

/**
 * Quick-access settings button in the TopBar.
 * Navigates to the full settings page.
 */
export function SettingsPanel() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate({ to: '/dashboard/settings' })}
      aria-label="Open settings"
      className="p-2 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
    >
      <Settings className="w-4 h-4" />
    </button>
  );
}
