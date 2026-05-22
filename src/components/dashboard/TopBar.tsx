import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { NotificationsDropdown } from '../ui/notifications-dropdown';

export default function TopBar() {
  const { setSidebarOpen, sidebarOpen, theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  return (
    <div className="
      bg-card/80 backdrop-blur-md
      border-b border-border
      px-6 py-3.5 flex justify-between items-center
      sticky top-0 z-20 transition-colors duration-200
    ">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <NotificationsDropdown />

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-secondary transition-colors"
          >
            <img
              src={`https://avatar.vercel.sh/${user?.email ?? 'guest'}`}
              alt={user?.name ?? 'User'}
              className="w-7 h-7 rounded-full border border-border"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {user?.name ?? 'Guest'}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight capitalize">
                {user?.currentPlan ?? 'free'} plan
              </p>
            </div>
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="
                    absolute right-0 top-full mt-2 w-48 z-20
                    bg-card
                    border border-border
                    rounded-xl shadow-card overflow-hidden
                  "
                >
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { navigate({ to: '/dashboard/settings' }); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => { navigate({ to: '/dashboard/subscription' }); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Subscription
                    </button>
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/5 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
