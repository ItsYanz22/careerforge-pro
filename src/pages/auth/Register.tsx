import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useAuthStore } from '../../stores/authStore'
import { Mail, Lock, User, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { isValidEmail } from '../../utils'
import { Logo } from '../../components/branding/Logo'

export default function Register() {
  const navigate = useNavigate()
  const { register, error, isLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) { toast.error('Please fill in all fields'); return }
    if (!isValidEmail(email)) { toast.error('Please enter a valid email address'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    try {
      await register(email, name, password)
      toast.success('Account created successfully!')
      navigate({ to: '/dashboard' })
    } catch {
      toast.error(error || 'Registration failed. Please try again.')
    }
  }

  const inputClass = 'w-full pl-9 pr-4 py-2.5 bg-background text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground text-sm transition-all'

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border p-8">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <Logo size="md" variant="icon" />
        <span className="font-bold text-foreground tracking-tight">CareerForge Pro</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Create Account</h1>
        <p className="text-muted-foreground text-sm">Join CareerForge Pro and start building amazing resumes</p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={16} />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn btn-primary py-2.5 rounded-xl mt-2 disabled:opacity-60"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {isLoading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-muted-foreground text-sm mt-6">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))] font-semibold hover:underline">
          Sign in
        </Link>
      </p>

      <p className="text-xs text-muted-foreground text-center mt-4">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}
