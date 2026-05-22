import { RootRoute, Route, Router } from '@tanstack/react-router'
import RootLayout from '@layouts/RootLayout'
import AuthLayout from '@layouts/AuthLayout'
import DashboardLayout from '@layouts/DashboardLayout'

// Pages
import { lazy } from 'react'

// Pages (Code Split)
const HomePage = lazy(() => import('@pages/Home'))
const LoginPage = lazy(() => import('@pages/auth/Login'))
const RegisterPage = lazy(() => import('@pages/auth/Register'))
const DashboardPage = lazy(() => import('@pages/dashboard/Dashboard'))
const ResumeBuilderPage = lazy(() => import('@pages/resume/ResumeBuilder'))
const ResumePreviewPage = lazy(() => import('@pages/resume/ResumePreview'))
const SettingsPage = lazy(() => import('@pages/settings/Settings'))
const SubscriptionPage = lazy(() => import('@pages/subscription/SubscriptionPage'))
const CheckoutSuccessPage = lazy(() => import('@pages/subscription/CheckoutSuccess'))
const NotFoundPage = lazy(() => import('@pages/NotFound'))
const ATSDashboardPage = lazy(() => import('@pages/ats/ATSDashboard'))
const CoverLetterGeneratorPage = lazy(() => import('@pages/cover-letter/CoverLetterGenerator'))
const PrintResumePage = lazy(() => import('@pages/print/PrintResumePage'))
const AnalyticsDashboardPage = lazy(() => import('@pages/dashboard/AnalyticsDashboard'))
const PublicResumeView = lazy(() => import('@pages/resume/PublicResumeView'))

// Root route
const rootRoute = new RootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

// Auth routes
const authRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'auth',
  component: AuthLayout,
})

const loginRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'login',
  component: LoginPage,
})

const registerRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'register',
  component: RegisterPage,
})

// Dashboard routes
const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
  component: DashboardLayout,
})

const dashboardIndexRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: DashboardPage,
})

const resumeBuilderRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: 'resumes/$resumeId',
  component: ResumeBuilderPage,
})

const resumePreviewRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: 'resumes/$resumeId/preview',
  component: ResumePreviewPage,
})

const settingsRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: 'settings',
  component: SettingsPage,
})

const subscriptionRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: 'subscription',
  component: SubscriptionPage,
})

const checkoutSuccessRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: 'subscription/success',
  component: CheckoutSuccessPage,
})

const atsRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: 'ats',
  component: ATSDashboardPage,
})

const coverLetterRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: 'cover-letters',
  component: CoverLetterGeneratorPage,
})

const analyticsRoute = new Route({
  getParentRoute: () => dashboardRoute,
  path: 'analytics',
  component: AnalyticsDashboardPage,
})

// Print route (used by Puppeteer — no dashboard layout)
const printRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'print/$resumeId',
  component: PrintResumePage,
})

const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const shareRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'share/$shareId',
  component: PublicResumeView,
})

// Route tree
const routeTree = rootRoute.addChildren([
  homeRoute,
  printRoute,
  authRoute.addChildren([loginRoute, registerRoute]),
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    resumeBuilderRoute,
    resumePreviewRoute,
    settingsRoute,
    subscriptionRoute,
    checkoutSuccessRoute,
    atsRoute,
    coverLetterRoute,
    analyticsRoute,
  ]),
  shareRoute,
])

export const router = new Router({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router
