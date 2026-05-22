import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard, FileText, Settings, CreditCard,
  LogOut, ChevronLeft, ChevronRight, Target, Mail,
  Sparkles, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumBadge } from '../premium/PremiumUI';
import { Logo } from '../branding/Logo';

const NAV_ITEMS = [
  { to: '/dashboard',              icon: LayoutDashboard, label: 'Dashboard',     exact: true },
  { to: '/dashboard/ats',          icon: Target,          label: 'ATS Matcher' },
  { to: '/dashboard/cover-letters',icon: Mail,            label: 'Cover Letters', pro: true },
  { to: '/dashboard/analytics',    icon: TrendingUp,      label: 'Performance' },
];

const ACCOUNT_ITEMS = [
  { to: '/dashboard/settings',     icon: Settings,        label: 'Settings' },
  { to: '/dashboard/subscription', icon: CreditCard,      label: 'Subscription' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { logout } = useAuthStore();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? currentPath === to : currentPath.startsWith(to);

  const linkClass = (to: string, exact?: boolean) =>
    [
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
      isActive(to, exact)
        ? 'bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.12)] text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-card/60',
    ].join(' ');

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm md:hidden z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="
          fixed md:relative left-0 top-0 h-screen
          bg-card
          border-r border-border
          flex flex-col overflow-hidden shrink-0
          z-30 md:z-0
          shadow-soft md:shadow-none
        "
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
          <Logo size="md" variant="icon" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-bold text-foreground tracking-tight whitespace-nowrap overflow-hidden"
              >
                CareerForge
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {/* Section label */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2"
              >
                Workspace
              </motion.p>
            )}
          </AnimatePresence>

          {NAV_ITEMS.map(({ to, icon: Icon, label, exact, pro }) => (
            <Link key={to} to={to} className={linkClass(to, exact)}>
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.12 }}
                    className="whitespace-nowrap overflow-hidden flex items-center gap-2"
                  >
                    {label}
                    {pro && <PremiumBadge size="sm" />}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}

          <AnimatePresence>
            {sidebarOpen && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2 mt-6"
              >
                Account
              </motion.p>
            )}
          </AnimatePresence>

          {ACCOUNT_ITEMS.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={linkClass(to)}>
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.12 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-2 py-3 border-t border-border space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive dark:text-red-400 hover:bg-destructive/10 dark:hover:bg-destructive/5 transition-colors"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Sign out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="
            absolute -right-3 top-1/2 -translate-y-1/2
            w-6 h-6 bg-card
            border border-border
            rounded-full flex items-center justify-center
            text-muted-foreground hover:text-foreground
            shadow-soft hover:shadow-card
            transition-all duration-150
            hidden md:flex
          "
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      </motion.div>
    </>
  );
}
