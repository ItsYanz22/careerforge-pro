import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Modal {
  isOpen: boolean;
  title?: string;
  content?: string;
}

interface UIState {
  // Modals
  createResumeModal: Modal;
  settingsModal: Modal;
  shareModal: Modal;

  // UI state
  sidebarOpen: boolean;
  previewMode: 'desktop' | 'mobile' | 'pdf';
  showAIPanel: boolean;
  showATSPanel: boolean;

  // Actions
  openCreateResumeModal: () => void;
  closeCreateResumeModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openShareModal: () => void;
  closeShareModal: () => void;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  setPreviewMode: (mode: 'desktop' | 'mobile' | 'pdf') => void;
  toggleAIPanel: () => void;
  toggleATSPanel: () => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Theme store slice — persisted to localStorage
  activeTheme: string;
  activeFont: string;
  activeSpacing: string;
  setActiveTheme: (theme: string) => void;
  setActiveFont: (font: string) => void;
  setActiveSpacing: (spacing: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial modal states
      createResumeModal: { isOpen: false },
      settingsModal: { isOpen: false },
      shareModal: { isOpen: false },

      // Initial UI state
      sidebarOpen: true,
      previewMode: 'desktop',
      showAIPanel: false,
      showATSPanel: false,

      // Modal actions
      openCreateResumeModal: () =>
        set((state) => ({ createResumeModal: { ...state.createResumeModal, isOpen: true } })),
      closeCreateResumeModal: () =>
        set((state) => ({ createResumeModal: { ...state.createResumeModal, isOpen: false } })),
      openSettingsModal: () =>
        set((state) => ({ settingsModal: { ...state.settingsModal, isOpen: true } })),
      closeSettingsModal: () =>
        set((state) => ({ settingsModal: { ...state.settingsModal, isOpen: false } })),
      openShareModal: () =>
        set((state) => ({ shareModal: { ...state.shareModal, isOpen: true } })),
      closeShareModal: () =>
        set((state) => ({ shareModal: { ...state.shareModal, isOpen: false } })),

      // Sidebar
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Preview and panels
      setPreviewMode: (mode) => set({ previewMode: mode }),
      toggleAIPanel: () => set((state) => ({ showAIPanel: !state.showAIPanel })),
      toggleATSPanel: () => set((state) => ({ showATSPanel: !state.showATSPanel })),

      // App theme (light/dark)
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          // Apply immediately to DOM
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: newTheme };
        }),

      // Resume theme/font/spacing preferences (persisted)
      activeTheme: 'emerald',
      activeFont: 'inter',
      activeSpacing: 'normal',
      setActiveTheme: (activeTheme) => set({ activeTheme }),
      setActiveFont: (activeFont) => set({ activeFont }),
      setActiveSpacing: (activeSpacing) => set({ activeSpacing }),
    }),
    {
      name: 'careerforge-ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        activeTheme: state.activeTheme,
        activeFont: state.activeFont,
        activeSpacing: state.activeSpacing,
      }),
    }
  )
);
