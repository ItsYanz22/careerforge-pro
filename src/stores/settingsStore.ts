import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/apiClient';

export interface UserPreferences {
  _id?: string;
  userId?: string;
  profile: {
    phone?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    profilePictureUrl?: string;
  };
  appearance: {
    darkMode: boolean;
    themeMode: 'system' | 'light' | 'dark';
    accentColor: 'emerald' | 'forest' | 'sage' | 'green';
    spacing: 'compact' | 'comfortable' | 'spacious';
    typography: 'default' | 'comfortable' | 'wide';
  };
  resumePreferences: {
    defaultTemplate: string;
    defaultFont: string;
    defaultExportFormat: 'pdf' | 'docx' | 'json';
    autoSaveInterval: number;
    atsOptimizationMode: boolean;
  };
  notificationPreferences: {
    exportNotifications: boolean;
    aiRewriteCompletion: boolean;
    atsScoreUpdates: boolean;
    subscriptionAlerts: boolean;
    resumeSavedAlerts: boolean;
    emailNotifications: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChangeAt?: string;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  profile: {},
  appearance: {
    darkMode: false,
    themeMode: 'system',
    accentColor: 'emerald',
    spacing: 'comfortable',
    typography: 'default',
  },
  resumePreferences: {
    defaultTemplate: 'Modern',
    defaultFont: 'Inter',
    defaultExportFormat: 'pdf',
    autoSaveInterval: 30,
    atsOptimizationMode: false,
  },
  notificationPreferences: {
    exportNotifications: true,
    aiRewriteCompletion: true,
    atsScoreUpdates: true,
    subscriptionAlerts: true,
    resumeSavedAlerts: true,
    emailNotifications: false,
  },
  security: {
    twoFactorEnabled: false,
  },
};

interface SettingsState {
  preferences: UserPreferences;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  updateProfile: (profile: UserPreferences['profile']) => Promise<void>;
  updateAppearance: (appearance: UserPreferences['appearance']) => Promise<void>;
  updateNotificationPreferences: (
    notificationPreferences: UserPreferences['notificationPreferences']
  ) => Promise<void>;
  updateResumePreferences: (
    resumePreferences: UserPreferences['resumePreferences']
  ) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,
      isLoading: false,
      isSaving: false,
      error: null,

      fetchPreferences: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get<{ data: UserPreferences }>('/settings/preferences');
          const data = (response as any)?.data ?? response;
          set({ preferences: { ...DEFAULT_PREFERENCES, ...data }, isLoading: false });
          // Sync with UI Store to apply globally
          if (data?.appearance?.accentColor) {
            import('./uiStore').then(({ useUIStore }) => {
              useUIStore.getState().setActiveTheme(data.appearance.accentColor);
            });
          }
        } catch {
          // Silently fall back to persisted/default preferences — don't crash the page
          set({ isLoading: false });
        }
      },

      updatePreferences: async (updates) => {
        // Optimistic update
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
          isSaving: true,
        }));
        try {
          await apiClient.put('/settings/preferences', updates);
          set({ isSaving: false });
        } catch {
          set({ isSaving: false });
        }
      },

      updateProfile: async (profile) => {
        set((state) => ({
          preferences: { ...state.preferences, profile },
          isSaving: true,
        }));
        try {
          await apiClient.put('/settings/profile', profile);
          set({ isSaving: false });
        } catch {
          set({ isSaving: false });
          throw new Error('Failed to save profile');
        }
      },

      updateAppearance: async (appearance) => {
        set((state) => ({
          preferences: { ...state.preferences, appearance },
          isSaving: true,
        }));
        try {
          await apiClient.put('/settings/appearance', appearance);
          set({ isSaving: false });
        } catch {
          set({ isSaving: false });
          throw new Error('Failed to save appearance');
        }
      },

      updateNotificationPreferences: async (notificationPreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, notificationPreferences },
          isSaving: true,
        }));
        try {
          await apiClient.put('/settings/notification-preferences', notificationPreferences);
          set({ isSaving: false });
        } catch {
          set({ isSaving: false });
          throw new Error('Failed to save notification preferences');
        }
      },

      updateResumePreferences: async (resumePreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, resumePreferences },
          isSaving: true,
        }));
        try {
          await apiClient.put('/settings/resume-preferences', resumePreferences);
          set({ isSaving: false });
        } catch {
          set({ isSaving: false });
          throw new Error('Failed to save resume preferences');
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isSaving: true });
        try {
          await apiClient.post('/settings/change-password', { currentPassword, newPassword });
          set({ isSaving: false });
        } catch (err: any) {
          set({ isSaving: false });
          throw new Error(err?.message ?? 'Failed to change password');
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'careerforge-settings',
      partialize: (state) => ({ preferences: state.preferences }),
    }
  )
);
