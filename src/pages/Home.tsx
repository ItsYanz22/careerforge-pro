import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../stores/authStore'
import {
  ArrowRight, Zap, Shield, Sparkles, Check, Star,
  FileText, Target, Brain, TrendingUp, Users, Award,
  ChevronRight, Play
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Logo } from '../components/branding/Logo'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
})

const stagger = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const cardVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Resume Coach',
    desc: 'Get real-time feedback on every section. Detect weak bullets, suggest action verbs, and improve impact scores instantly.',
    color: 'text-[hsl(var(--primary))]',
    bg: 'bg-[hsl(var(--primary)_/_0.1)]',
  },
  {
    icon: Target,
    title: 'ATS Score Engine',
    desc: 'Deterministic scoring across keyword match, readability, formatting, and section completeness — no guesswork.',
    color: 'text-[hsl(var(--primary))]',
    bg: 'bg-[hsl(var(--primary)_/_0.1)]',
  },
  {
    icon: Zap,
    title: 'Job Match Analysis',
    desc: 'Paste any job description and instantly see your match percentage with missing keywords highlighted.',
    color: 'text-[hsl(var(--primary))]',
    bg: 'bg-[hsl(var(--primary)_/_0.1)]',
  },
  {
    icon: FileText,
    title: 'Professional Templates',
    desc: '12+ ATS-safe templates designed by career experts. Export as pixel-perfect PDF or DOCX.',
    color: 'text-[hsl(var(--primary))]',
    bg: 'bg-[hsl(var(--primary)_/_0.1)]',
  },
  {
    icon: Shield,
    title: 'ATS-Safe Formatting',
    desc: 'Every template is tested against major ATS systems. No tables, no columns, no parsing failures.',
    color: 'text-[hsl(var(--primary))]',
    bg: 'bg-[hsl(var(--primary)_/_0.1)]',
  },
  {
    icon: TrendingUp,
    title: 'Version History',
    desc: 'Track every change with side-by-side diffs and ATS score deltas. Restore any version instantly.',
    color: 'text-[hsl(var(--primary))]',
    bg: 'bg-[hsl(var(--primary)_/_0.1)]',
  },
]

const STATS = [
  { value: '94%', label: 'ATS pass rate', sub: 'vs 43% industry avg' },
  { value: '3.2×', label: 'More interviews', sub: 'for optimized resumes' },
  { value: '12+', label: 'Pro templates', sub: 'ATS-tested & verified' },
  { value: '<10s', label: 'AI analysis', sub: 'per resume section' },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer @ Google',
    avatar: 'SC',
    text: 'CareerForge Pro helped me go from 0 callbacks to 4 interviews in 2 weeks. The ATS score engine is incredibly accurate.',
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Manager @ Stripe',
    avatar: 'MJ',
    text: 'The AI coach caught weak bullet points I never noticed. My resume score went from 62 to 91 in one session.',
  },
  {
    name: 'Priya Patel',
    role: 'Data Scientist @ Meta',
    avatar: 'PP',
    text: 'Job matching is a game-changer. I can tailor my resume for each role in minutes instead of hours.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-28 px-4 overflow-hidden">
        {/* Gradient blobs — landing page only */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-30 dark:opacity-15 blur-3xl -z-10"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, hsl(var(--gradient-start) / 0.4), transparent)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -left-40 w-[500px] h-[500px] opacity-20 dark:opacity-10 blur-3xl -z-10 animate-float"
          style={{ background: 'radial-gradient(circle, hsl(var(--gradient-middle) / 0.3), transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-20 -right-40 w-[400px] h-[400px] opacity-15 dark:opacity-8 blur-3xl -z-10 animate-float"
          style={{ background: 'radial-gradient(circle, hsl(var(--gradient-end) / 0.25), transparent 70%)', animationDelay: '3s' }}
        />

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border mb-6"
            style={{
              background: 'hsl(var(--primary) / 0.1)',
              borderColor: 'hsl(var(--primary) / 0.2)',
              color: 'hsl(var(--primary))',
            }}
          >
            <Sparkles size={12} />
            AI-Powered Resume Builder
            <ChevronRight size={12} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.05)}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-balance mb-6"
          >
            Build resumes that{' '}
            <span
              className="relative"
              style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              actually get interviews
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp(0.1)}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
          >
            CareerForge Pro combines AI coaching, real ATS scoring, and job matching
            to help you land more interviews — faster.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.15)} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {isAuthenticated ? (
              <button
                onClick={() => navigate({ to: '/dashboard' })}
                className="btn btn-primary px-8 py-3.5 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all group"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Go to Dashboard
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate({ to: '/auth/register' })}
                  className="btn px-8 py-3.5 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all group"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  Start for Free
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => navigate({ to: '/auth/login' })}
                  className="btn btn-secondary px-8 py-3.5 text-sm rounded-xl border border-border hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <Play size={14} className="text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]" />
                  View Demo
                </button>
              </>
            )}
          </motion.div>

          {/* Social proof */}
          <motion.div {...fadeUp(0.2)} className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                {['SC', 'MJ', 'PP', 'AK'].map((initials) => (
                  <div key={initials} className="w-6 h-6 rounded-full bg-[hsl(var(--primary)_/_0.15)] border-2 border-background flex items-center justify-center text-[8px] font-bold text-[hsl(var(--primary))]">
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-xs">2,400+ professionals</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-warning fill-warning" />)}
              <span className="text-xs ml-1">4.9/5 rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {STATS.map(({ value, label, sub }) => (
              <motion.div key={label} variants={cardVariant} className="text-center">
                <div
                  className="text-3xl sm:text-4xl font-black mb-1"
                  style={{
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {value}
                </div>
                <div className="text-sm font-semibold text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)] border border-[hsl(var(--primary)_/_0.2)] mb-4">
              <Zap size={12} />
              Everything you need
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-4">
              Built for serious job seekers
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature is designed to maximize your chances of getting past ATS filters and landing interviews.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <motion.div
                key={title}
                variants={cardVariant}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-6 bg-card rounded-2xl border border-border hover:border-primary/30 transition-all hover:shadow-card group"
              >
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-secondary/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-warning fill-warning" />)}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Loved by professionals
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5"
          >
            {TESTIMONIALS.map(({ name, role, avatar, text }) => (
              <motion.div
                key={name}
                variants={cardVariant}
                className="p-6 bg-card rounded-2xl border border-border shadow-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-warning fill-warning" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    {avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{name}</div>
                    <div className="text-xs text-muted-foreground">{role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--primary)_/_0.1)] border border-[hsl(var(--primary)_/_0.2)] mb-4">
              <Award size={12} />
              Simple pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-3">
              Start free, upgrade when ready
            </h2>
            <p className="text-muted-foreground">No credit card required. Cancel anytime.</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5 items-stretch"
          >
            {/* Free */}
            <motion.div
              variants={cardVariant}
              className="p-7 bg-card rounded-2xl border border-border flex flex-col"
            >
              <div className="mb-6">
                <h3 className="text-base font-bold text-foreground mb-1">Free</h3>
                <div className="text-4xl font-black text-foreground">
                  $0<span className="text-base font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Perfect for getting started</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '1 Resume',
                  'Basic templates',
                  'PDF export',
                  'ATS score check',
                  '5 AI rewrites/month',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check size={14} className="text-[hsl(var(--primary))] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate({ to: '/auth/register' })}
                className="w-full py-2.5 text-sm font-semibold text-foreground bg-secondary hover:bg-muted border border-border rounded-xl transition-colors"
              >
                Get Started Free
              </button>
            </motion.div>

            {/* Pro — highlighted */}
            <motion.div
              variants={cardVariant}
              className="relative p-7 rounded-2xl flex flex-col md:-my-3 md:shadow-xl"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-base font-bold text-white mb-1">Pro</h3>
                <div className="text-4xl font-black text-white">
                  $15<span className="text-base font-normal text-white/70">/mo</span>
                </div>
                <p className="text-xs text-white/70 mt-2">For serious job seekers</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Unlimited resumes',
                  'All 12+ premium templates',
                  'Unlimited AI rewrites',
                  'Advanced ATS engine',
                  'Job matching & tailoring',
                  'DOCX export',
                  'Version history',
                  'Cover letter generator',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/90">
                    <Check size={14} className="text-white flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate({ to: '/auth/register' })}
                className="w-full py-2.5 text-sm font-semibold text-primary bg-white hover:bg-[hsl(var(--primary)_/_0.1)] rounded-xl transition-colors shadow-sm"
              >
                Start Pro Trial
              </button>
            </motion.div>

            {/* Enterprise */}
            <motion.div
              variants={cardVariant}
              className="p-7 bg-card rounded-2xl border border-border flex flex-col"
            >
              <div className="mb-6">
                <h3 className="text-base font-bold text-foreground mb-1">Enterprise</h3>
                <div className="text-4xl font-black text-foreground">
                  Custom
                </div>
                <p className="text-xs text-muted-foreground mt-2">For teams & organizations</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Everything in Pro',
                  'Unlimited team seats',
                  'Advanced ATS analytics',
                  'Priority support',
                  'Custom branding',
                  'SSO & admin controls',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check size={14} className="text-[hsl(var(--primary))] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Contact Sales
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <Logo size="lg" variant="icon" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-4">
              Ready to land your dream job?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of professionals who use CareerForge Pro to build resumes that get results.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate({ to: '/auth/register' })}
                className="btn px-8 py-3.5 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all group"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Get Started Free
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate({ to: '/auth/login' })}
                className="btn btn-secondary px-8 py-3.5 text-sm rounded-xl border border-border transition-colors"
              >
                Sign In
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              No credit card required · Free forever plan available
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" variant="icon" />
            <span className="text-sm font-semibold text-foreground">CareerForge Pro</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CareerForge Pro. Built for job seekers.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
