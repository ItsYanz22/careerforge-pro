import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { Upload, Mail, Phone, Linkedin, Github, Globe, Save, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

const inputClass =
  'w-full bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-white';

const fieldClass =
  'flex items-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus-within:ring-2 focus-within:ring-[hsl(var(--primary))/30] focus-within:border-[hsl(var(--primary))] transition-all';

export default function ProfileSettings() {
  const { user } = useAuthStore();
  const { preferences, isSaving, updateProfile } = useSettingsStore();

  const [formData, setFormData] = useState({
    phone: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    profilePictureUrl: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (preferences?.profile) {
      setFormData({
        phone: preferences.profile.phone || '',
        linkedinUrl: preferences.profile.linkedinUrl || '',
        githubUrl: preferences.profile.githubUrl || '',
        portfolioUrl: preferences.profile.portfolioUrl || '',
        profilePictureUrl: preferences.profile.profilePictureUrl || '',
      });
      setProfileImage(preferences.profile.profilePictureUrl || null);
    }
  }, [preferences]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setProfileImage(url);
      setFormData((p) => ({ ...p, profilePictureUrl: url }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const sectionClass = 'bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-zinc-400" /> Profile Picture
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <label className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--accent))] border border-[hsl(var(--primary))/20] rounded-xl hover:bg-[hsl(var(--primary))/10] dark:bg-[hsl(var(--primary))/12] dark:hover:bg-[hsl(var(--primary))/20] transition-colors cursor-pointer">
            <Upload size={14} />
            Upload Photo
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Basic info */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Account Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Full Name</label>
            <input value={user?.name || ''} disabled
              className="w-full px-3 py-2.5 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-not-allowed" />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-1">Cannot be changed here</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Email</label>
            <div className={`${fieldClass} opacity-60 cursor-not-allowed`}>
              <Mail size={14} className="text-zinc-400 flex-shrink-0" />
              <input type="email" value={user?.email || ''} disabled className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className={sectionClass}>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Contact & Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'phone', label: 'Phone', icon: Phone, placeholder: '+1 (555) 000-0000', type: 'tel' },
            { name: 'linkedinUrl', label: 'LinkedIn', icon: Linkedin, placeholder: 'linkedin.com/in/yourname', type: 'url' },
            { name: 'githubUrl', label: 'GitHub', icon: Github, placeholder: 'github.com/yourname', type: 'url' },
            { name: 'portfolioUrl', label: 'Portfolio', icon: Globe, placeholder: 'yourportfolio.com', type: 'url' },
          ].map(({ name, label, icon: Icon, placeholder, type }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">{label}</label>
              <div className={fieldClass}>
                <Icon size={14} className="text-zinc-400 flex-shrink-0" />
                <input type={type} name={name} value={(formData as any)[name]}
                  onChange={handleChange} placeholder={placeholder} className={inputClass} />
              </div>
            </div>
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
