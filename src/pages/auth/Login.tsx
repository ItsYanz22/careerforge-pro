import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useAuthStore } from '../../stores/authStore'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo } from '../../components/branding/Logo'

export default function Login() {
  const navigate = useNavigate()
  const { login, error, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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

      <p className="text-center text-muted-foreground text-sm mt-6">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))] font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
