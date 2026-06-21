import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { router } from './router'
import './styles/globals.css'

import { ThemeProvider } from './context/theme-context'
import { initializeWebVitals } from './utils/performance'

// Initialize web vitals monitoring
initializeWebVitals()

// Initialize theme from Zustand persisted store (key: 'careerforge-ui')
// This runs before React mounts to prevent flash of wrong theme
try {
  const stored = localStorage.getItem('careerforge-ui');
  const parsed = stored ? JSON.parse(stored) : null;
  const theme = parsed?.state?.theme ?? 'light';
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
} catch {
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE'}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
