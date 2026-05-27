import { useEffect, Suspense } from 'react'
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/authStore'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import PageTransition from '../components/ui/PageTransition'
import Particles from '../components/ui/Particles'

export default function DashboardLayout() {
  const { isAuthenticated, fetchMe, token } = useAuthStore()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const location = routerState.location

  // On mount, if we have a token but no user yet, re-hydrate from /api/auth/me
  useEffect(() => {
    if (token && !isAuthenticated) {
      fetchMe()
    }
  }, [token])

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!token && !isAuthenticated) {
      navigate({ to: '/auth/login', replace: true })
    }
  }, [isAuthenticated, token])

  if (!isAuthenticated && !token) {
    return null // Brief flash prevention — redirect is in-flight
  }

  return (
    <div className="flex h-screen bg-background text-foreground selection:bg-primary/15 selection:text-foreground transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative isolate">
        {/* Fixed Particles background for the content area */}
        <div className="absolute inset-0 -z-20 opacity-50 dark:opacity-35 pointer-events-none overflow-hidden">
          <Particles
            particleCount={80}
            particleSpread={15}
            speed={0.03}
            particleBaseSize={220}
            alphaParticles={true}
            disableRotation={false}
            useThemeColor={true}
            moveParticlesOnHover={true}
            particleHoverFactor={0.5}
          />
        </div>
        <TopBar />
        <main className="flex-1 overflow-auto bg-transparent">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              }>
                <Outlet />
              </Suspense>
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
