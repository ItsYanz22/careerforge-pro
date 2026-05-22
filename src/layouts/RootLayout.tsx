import { useEffect, Suspense } from 'react'
import { Outlet, useRouterState } from '@tanstack/react-router'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@stores/authStore'
import { authApi } from '../api/auth.api'
import { useAccentColor } from '../hooks/useAccentColor'
import Navbar from '@components/common/Navbar'
import PageTransition from '@components/ui/PageTransition'

export default function RootLayout() {
  const { setUser, setToken } = useAuthStore()
  const routerState = useRouterState()
  const location = routerState.location

  // Apply accent color globally
  useAccentColor()

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const currentUser = await authApi.getMe()
          setUser(currentUser.user)
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background text-foreground dark:text-foreground transition-colors duration-200">
      <Navbar />
      <main className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname} className="flex-1 flex flex-col">
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center bg-secondary/50 dark:bg-secondary/50 backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            }>
              <Outlet />
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>
    </div>
  )
}
