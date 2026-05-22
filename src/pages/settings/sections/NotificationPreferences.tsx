import { useState, useEffect } from 'react';
import { useSettingsStore, UserPreferences } from '../../../stores/settingsStore';
import { Bell, Save, Loader2, FileText, Zap, BarChart3, CreditCard, CheckCircle2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const NOTIFICATION_OPTIONS = [
  { key: 'resumeSavedAlerts' as const,    icon: CheckCircle2, title: 'Resume Saved',         desc: 'When you save a resume' },
  { key: 'exportNotifications' as const,  icon: FileText,     title: 'Export Completed',      desc: 'When your resume is exported as PDF' },
  { key: 'aiRewriteCompletion' as const,  icon: Zap,          title: 'AI Rewrite Completed',  desc: 'When AI finishes enhancing your resume' },
  { key: 'atsScoreUpdates' as const,      icon: BarChart3,    title: 'ATS Score Updates',     desc: 'When your ATS score changes significantly' },
  { key: 'subscriptionAlerts' as const,   icon: CreditCard,   title: 'Subscription Alerts',   desc: 'Billing and subscription updates' },
  { key: 'emailNotifications' as const,   icon: Mail,         title: 'Email Notifications',   desc: 'Receive notifications via email' },
];

export default function NotificationPreferences() {
  const { preferences, isSaving, updateNotificationPreferences } = useSettingsStore();

  const [prefs, setPrefs] = useState<UserPreferences['notificationPreferences']>({
    exportNotifications: true,
    aiRewriteCompletion: true,
    atsScoreUpdates: true,
    subscriptionAlerts: true,
    resumeSavedAlerts: true,
    emailNotifications: false,
  });

  useEffect(() => {
    if (preferences?.notificationPreferences) setPrefs(preferences.notificationPreferences);
  }, [preferences]);

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateNotificationPreferences(prefs);
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save notification preferences');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-zinc-400" /> Notification Channels
        </h3>
        <div className="space-y-2">
          {NOTIFICATION_OPTIONS.map(({ key, icon: Icon, title, desc }) => (
            <label key={key}
              className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[hsl(var(--accent))] dark:bg-[hsl(var(--primary))/12] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
                </div>
              </div>
              {/* Toggle switch */}
              <div className="relative flex-shrink-0">
                <input type="checkbox" checked={prefs[key]} onChange={() => toggle(key)} className="sr-only" />
                <div
                  onClick={() => toggle(key)}
                  className={`w-10 h-5.5 rounded-full cursor-pointer transition-colors ${prefs[key] ? 'bg-[hsl(var(--primary))]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                  style={{ height: '22px', width: '40px' }}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="p-4 bg-[hsl(var(--accent))] dark:bg-[hsl(var(--primary))/10] border border-[hsl(var(--primary))/20] dark:border-[hsl(var(--primary))/30] rounded-xl">
        <p className="text-sm text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]">
          <strong>Tip:</strong> In-app notifications always show when actions complete. These settings control additional reminders.
        </p>
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
