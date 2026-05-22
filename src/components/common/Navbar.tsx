import { Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@stores/authStore'
import { Menu, LogOut, User, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationCenter from '@components/notifications/NotificationCenter'
import logo from '../../assets/logo.jpg'

export default function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  return (
    <nav className="bg-card/80 dark:bg-card/50 backdrop-blur-md border-b border-border sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src={logo} 
            alt="CareerForge Pro Logo" 
            className="w-8 h-8 rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 object-cover" 
            onError={(e) => {
              // Fallback if image isn't added yet
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          {/* Fallback box if image is missing */}
          <div className="hidden w-8 h-8 bg-[hsl(var(--primary))] rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-all duration-300">
            CF
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">CareerForge</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <NotificationCenter />
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <User size={18} />
                  <span>{user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-xl shadow-premium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                  <Link to="/dashboard/settings" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-secondary hover:text-foreground first:rounded-t-xl transition-colors">
                    Settings
                  </Link>
                  <Link to="/dashboard/subscription" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-secondary hover:text-foreground transition-colors">
                    Subscription
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 last:rounded-b-xl flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="bg-gradient-primary hover:shadow-accent text-white px-5 py-2 rounded-xl text-sm font-medium shadow-sm transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-sm font-medium text-destructive hover:text-destructive flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block bg-gradient-primary text-white px-4 py-2 rounded-xl text-sm font-medium text-center shadow-sm hover:shadow transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
