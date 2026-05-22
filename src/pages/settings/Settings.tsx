import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import {
  Settings as SettingsIcon, User, Palette, FileText,
  Bell, Lock, CreditCard, ChevronRight, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileSettings from './sections/ProfileSettings';
import AppearanceSettings from './sections/AppearanceSettings';
import ResumePreferences from './sections/ResumePreferences';
import NotificationPreferences from './sections/NotificationPreferences';
import SecuritySettings from './sections/SecuritySettings';
import SubscriptionSettings from './sections/SubscriptionSettings';

type SettingsTab = 'profile' | 'appearance' | 'resume' | 'notifications' | 'security' | 'subscription';

const SECTIONS = [
  { id: 'profile',       label: 'Profile',       icon: User,         desc: 'Personal information' },
  { id: 'appearance',    label: 'Appearance',    icon: Palette,      desc: 'Theme & display' },
  { id: 'resume',        label: 'Resume',        icon: FileText,     desc: 'Resume preferences' },
  { id: 'notifications', label: 'Notifications', icon: Bell,         desc: 'Alert settings' },
  { id: 'security',      label: 'Security',      icon: Lock,         desc: 'Password & sessions' },
  { id: 'subscription',  label: 'Subscription',  icon: CreditCard,   desc: 'Billing & plan' },
] as const;

export default function SettingsPage() {
  const { fetchPreferences, isLoading } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  useEffect(() => { fetchPreferences(); }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-subtle)', border: '1px solid hsl(var(--border))' }}>
          <SettingsIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-xs text-muted-foreground">Manage your account and preferences</p>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-primary-500 animate-spin ml-auto" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border overflow-x-auto lg:overflow-hidden sticky top-6 flex lg:flex-col custom-scrollbar" style={{ boxShadow: 'var(--shadow-card)' }}>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeTab === section.id;
              return (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.1 }}
                  className={`flex-shrink-0 lg:w-full flex items-center justify-between px-4 py-3 text-sm transition-colors lg:border-b lg:border-r-0 border-r border-border dark:border-border last:border-0 ${
                    isActive
                      ? 'bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.12)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]'
                      : 'text-muted-foreground hover:bg-muted dark:hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={15} className="flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium leading-tight">{section.label}</div>
                      <div className="text-[11px] opacity-50 mt-0.5 hidden lg:block">{section.desc}</div>
                    </div>
                  </div>
                  {isActive && <ChevronRight size={13} className="flex-shrink-0 text-[hsl(var(--primary))]" />}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'profile'       && <ProfileSettings />}
              {activeTab === 'appearance'    && <AppearanceSettings />}
              {activeTab === 'resume'        && <ResumePreferences />}
              {activeTab === 'notifications' && <NotificationPreferences />}
              {activeTab === 'security'      && <SecuritySettings />}
              {activeTab === 'subscription'  && <SubscriptionSettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
