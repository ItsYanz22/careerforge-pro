import { useState } from 'react';
import { Lock, Key, LogOut, Shield, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useAuthStore } from '../../../stores/authStore';
import toast from 'react-hot-toast';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Contains number', pass: /\d/.test(password) },
    { label: 'Contains special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ['bg-error', 'bg-warning', 'bg-info', 'bg-primary/10', 'bg-primary'];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? colors[score] : 'bg-border'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-3 h-3 flex-shrink-0 ${c.pass ? 'text-[hsl(var(--primary))]' : 'text-border'}`}
            />
            <span className={`text-[11px] ${c.pass ? 'text-foreground' : 'text-muted-foreground'}`}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SecuritySettings() {
  const { changePassword, isSaving } = useSettingsStore();
  const { logout } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await changePassword(form.currentPassword, form.newPassword);
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to change password');
    }
  };

  const handleLogoutAll = () => {
    if (!confirm('This will sign you out on all devices. Continue?')) return;
    logout();
    toast.success('Signed out from all devices');
  };

  const inputClass =
    'w-full px-3 py-2.5 text-sm bg-input text-foreground border border-border rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] outline-none transition-all placeholder:text-muted-foreground';

  return (
    <div className="space-y-5">
      {/* Change Password */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-muted-foreground" />
          Change Password
        </h3>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.1)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] rounded-xl hover:bg-[hsl(var(--primary)_/_0.15)] dark:hover:bg-[hsl(var(--primary)_/_0.1)] transition-colors font-medium text-sm"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter current password"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter new password"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.newPassword && <PasswordStrength password={form.newPassword} />}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm new password"
                  className={`${inputClass} ${
                    form.confirmPassword && form.confirmPassword !== form.newPassword
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                <p className="text-xs text-destructive mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.1)] text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-xl font-semibold text-sm transition-colors hover:bg-muted dark:hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Session Management */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          Session Management
        </h3>

        <div className="space-y-3">
          {/* Current session */}
          <div className="flex items-center justify-between p-3.5 bg-muted rounded-xl border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Current session</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                This browser · Active now
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-[hsl(var(--primary)_/_0.15)] dark:bg-[hsl(var(--primary)_/_0.1)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] rounded-full">
              ACTIVE
            </span>
          </div>

          <button
            onClick={handleLogoutAll}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors font-medium text-sm">
            <LogOut className="w-4 h-4" />
            Sign out from all devices
          </button>
        </div>
      </div>

      {/* 2FA — coming soon */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between p-3.5 bg-muted rounded-xl border border-border">
          <div>
            <p className="text-sm font-medium text-foreground">Authenticator app</p>
            <p className="text-xs text-muted-foreground mt-0.5">Coming soon</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-muted text-muted-foreground rounded-full">
            SOON
          </span>
        </div>
      </div>

      {/* Security tips */}
      <div className="bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.1)] border border-[hsl(var(--primary)_/_0.3)] dark:border-[hsl(var(--primary)_/_0.2)] rounded-2xl p-4">
        <p className="text-sm font-semibold text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] mb-2">
          🔒 Security tips
        </p>
        <ul className="text-sm text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] space-y-1 list-disc list-inside">
          <li>Use a unique password you don't use elsewhere</li>
          <li>Never share your login credentials</li>
          <li>Sign out when using shared devices</li>
        </ul>
      </div>
    </div>
  );
}
