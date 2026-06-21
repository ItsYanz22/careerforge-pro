import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuthStore } from '../../stores/authStore'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '../../components/branding/Logo'

export default function Login() {
  const navigate = useNavigate()
  const { login, loginWithGoogle, error, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await loginWithGoogle(tokenResponse.access_token)
        toast.success('Welcome back via Google!')
        navigate({ to: '/dashboard' })
      } catch (err: any) {
        toast.error(err?.message || 'Google sign-in failed. Please try again.')
      }
    },
    onError: () => toast.error('Google sign-in failed. Please try again.')
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate({ to: '/dashboard' })
    } catch {
      toast.error(error || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="bg-card dark:bg-card rounded-2xl shadow-card border border-border dark:border-border p-8">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <Logo size="md" variant="icon" />
        <span className="font-bold text-foreground tracking-tight">CareerForge Pro</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Welcome Back</h1>
        <p className="text-muted-foreground text-sm">Sign in to your CareerForge Pro account</p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-destructive/10 dark:bg-destructive/5 border border-destructive/20 dark:border-destructive/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={16} />
          <p className="text-destructive dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-9 pr-4 py-2.5 bg-input text-foreground border border-input border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground text-sm transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-4 py-2.5 bg-input text-foreground border border-input border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground text-sm transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[hsl(var(--btn-primary-bg))] hover:bg-[hsl(var(--btn-primary-hover-bg))] disabled:opacity-60 text-[hsl(var(--btn-primary-text))] font-semibold py-2.5 rounded-xl transition-colors shadow-soft mt-2"
        >
          {isLoading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="relative flex py-4 items-center mt-2">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase tracking-wider">or continue with</span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      <button
        onClick={() => handleGoogleLogin()}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2.5 bg-background hover:bg-secondary text-foreground border border-border font-semibold py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-60"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>

      <p className="text-center text-muted-foreground text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))] font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
