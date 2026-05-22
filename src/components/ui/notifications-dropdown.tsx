import { useRef, useEffect, useState } from 'react';
import {
  Bell, X, Crown, AlertTriangle, Info,
  CheckCircle2, Check, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useNotificationStore,
  AppNotification,
  NotificationType,
} from '../../stores/notificationStore';

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  success: {
    icon: CheckCircle2,
    color: 'text-[hsl(var(--primary))]',
    bg: 'bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.1)]',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950',
  },
  info: {
    icon: Info,
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950',
  },
  premium: {
    icon: Crown,
    color: 'text-[hsl(var(--primary))]',
    bg: 'bg-[hsl(var(--primary)_/_0.15)] dark:bg-[hsl(var(--primary)_/_0.1)]',
  },
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ── Single notification row ───────────────────────────────────────────────────
function NotificationItem({
  notification,
  onRead,
  onRemove,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[notification.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
      onClick={() => onRead(notification.id)}
      className={[
        'group relative flex gap-3 px-4 py-3.5 cursor-pointer',
        'border-b border-zinc-100 dark:border-border/60 last:border-0',
        'hover:bg-background dark:hover:bg-card/40 transition-colors',
        !notification.read ? 'bg-[hsl(var(--primary)_/_0.1)]/40 dark:bg-[hsl(var(--primary)_/_0.1)]' : '',
      ].join(' ')}
    >
      {/* Unread dot */}
      {!notification.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[hsl(var(--primary))] rounded-full" />
      )}

      {/* Icon */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${cfg.bg}`}
      >
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <p
          className={`text-sm leading-snug mb-0.5 ${
            !notification.read
              ? 'font-semibold text-foreground'
              : 'font-medium text-foreground-muted'
          }`}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground dark:text-muted-foreground leading-relaxed line-clamp-2">
          {notification.message}
        </p>
        <span className="text-[10px] text-muted-foreground mt-1 block">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>

      {/* Remove */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(notification.id);
        }}
        className="
          absolute top-3 right-3 p-1 rounded-md
          text-foreground-muted hover:text-foreground
          hover:bg-secondary
          opacity-0 group-hover:opacity-100 transition-all
        "
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

// ── Main dropdown ─────────────────────────────────────────────────────────────
export function NotificationsDropdown() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = unreadCount();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
        className="relative p-2 text-foreground-muted hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
      >
        <Bell className="w-4 h-4" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[hsl(var(--primary))] text-white text-[9px] font-bold rounded-full flex items-center justify-center"
            >
              {count > 9 ? '9+' : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="
              absolute -right-2 sm:right-0 top-full mt-2 z-50
              w-[calc(100vw-2rem)] sm:w-96 max-w-[380px]
              bg-white dark:bg-card
              border border-border dark:border-border
              rounded-2xl shadow-premium overflow-hidden
              origin-top-right
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Notifications
                </h3>
                {count > 0 && (
                  <span className="px-1.5 py-0.5 bg-[hsl(var(--primary)_/_0.15)] dark:bg-[hsl(var(--primary)_/_0.1)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] text-[10px] font-bold rounded-full">
                    {count} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {count > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_0.1)] dark:hover:bg-[hsl(var(--primary)_/_0.1)] rounded-lg transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    title="Clear all"
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-10 h-10 bg-secondary dark:bg-card rounded-xl flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-foreground-muted" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                    No notifications yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Exports, AI rewrites, and more will appear here
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onRead={markAsRead}
                      onRemove={removeNotification}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-border bg-background/50 dark:bg-card/30">
                <p className="text-[11px] text-muted-foreground text-center">
                  {notifications.length} notification
                  {notifications.length !== 1 ? 's' : ''} · last 30 days
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
