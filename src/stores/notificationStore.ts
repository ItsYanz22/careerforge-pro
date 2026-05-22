import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'success' | 'warning' | 'info' | 'premium';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string; // ISO string
  actionUrl?: string;
}

interface NotificationState {
  notifications: AppNotification[];

  // Actions
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;

  // Computed helpers (not stored)
  unreadCount: () => number;
}

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (n) => {
        const notification: AppNotification = {
          ...n,
          id: generateId(),
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          // Keep max 50 notifications, newest first
          notifications: [notification, ...state.notifications].slice(0, 50),
        }));
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: 'careerforge-notifications',
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);

// ── Convenience helpers ───────────────────────────────────────────────────────
// Call these from anywhere in the app to generate real notifications.

export const notify = {
  resumeSaved: (title: string) =>
    useNotificationStore.getState().addNotification({
      title: 'Resume saved',
      message: `"${title}" has been saved successfully.`,
      type: 'success',
      actionUrl: '/dashboard',
    }),

  pdfExported: (title: string) =>
    useNotificationStore.getState().addNotification({
      title: 'PDF exported',
      message: `"${title}" has been downloaded as a PDF.`,
      type: 'success',
    }),

  aiRewriteComplete: () =>
    useNotificationStore.getState().addNotification({
      title: 'AI rewrite complete',
      message: 'Your resume section has been enhanced by AI.',
      type: 'info',
    }),

  atsScoreUpdated: (score: number) =>
    useNotificationStore.getState().addNotification({
      title: 'ATS score updated',
      message: `Your resume scored ${score}/100 on the latest ATS analysis.`,
      type: score >= 80 ? 'success' : 'warning',
      actionUrl: '/dashboard/ats',
    }),

  subscriptionUpgraded: (plan: string) =>
    useNotificationStore.getState().addNotification({
      title: 'Subscription upgraded',
      message: `Welcome to ${plan}! All premium features are now unlocked.`,
      type: 'premium',
      actionUrl: '/dashboard/subscription',
    }),

  subscriptionCancelled: () =>
    useNotificationStore.getState().addNotification({
      title: 'Subscription cancelled',
      message: 'Your subscription has been cancelled. Access continues until the billing period ends.',
      type: 'warning',
      actionUrl: '/dashboard/subscription',
    }),

  versionRestored: (versionNumber: number) =>
    useNotificationStore.getState().addNotification({
      title: 'Version restored',
      message: `Resume restored to version ${versionNumber}.`,
      type: 'info',
    }),

  paymentFailed: () =>
    useNotificationStore.getState().addNotification({
      title: 'Payment failed',
      message: 'Your last payment could not be processed. Please update your billing details.',
      type: 'warning',
      actionUrl: '/dashboard/subscription',
    }),
};
