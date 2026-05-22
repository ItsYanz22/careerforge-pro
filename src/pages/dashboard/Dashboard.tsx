import { useEffect, useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useResumeStore } from '../../stores/resumeStore'
import { useAuthStore } from '../../stores/authStore'
import {
  Plus, Loader2, FileText, MoreVertical, Edit3, Eye,
  Target, TrendingUp, Sparkles, Copy, Trash2, Crown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 28 } },
}

export default function Dashboard() {
  const { resumes, loadResumes, isLoading, createResume, deleteResume, cloneResume } = useResumeStore()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    loadResumes()
    const close = () => setOpenMenuId(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const handleCreate = async () => {
    try {
      const r = await createResume('Untitled Resume')
      toast.success('Resume created!')
      navigate({ to: '/dashboard/resumes/$resumeId', params: { resumeId: r._id } })
    } catch { toast.error('Failed to create resume') }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Delete this resume?')) return
    try { await deleteResume(id); toast.success('Deleted') }
    catch { toast.error('Failed to delete') }
    setOpenMenuId(null)
  }

  const handleDuplicate = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    try { await cloneResume(id, `${title} (Copy)`); toast.success('Duplicated') }
    catch { toast.error('Failed to duplicate') }
    setOpenMenuId(null)
  }

  const isPro = user?.features?.premiumTemplates === true

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard/ats"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-all shadow-sm"
          >
            <Target size={15} className="text-[hsl(var(--primary))]" />
            ATS Matcher
          </Link>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all shadow-accent"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Plus size={15} />
            New Resume
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Resumes',
            value: isLoading ? '—' : resumes.length,
            icon: FileText,
            iconBg: 'bg-[hsl(var(--primary)_/_0.1)]',
            iconColor: 'text-[hsl(var(--primary))]',
          },
          {
            label: 'Avg ATS Score',
            value: '85',
            suffix: '/100',
            icon: TrendingUp,
            iconBg: 'bg-[hsl(var(--primary)_/_0.1)]',
            iconColor: 'text-[hsl(var(--primary))]',
          },
          {
            label: 'Plan',
            value: isPro ? 'Pro' : 'Free',
            icon: isPro ? Crown : Sparkles,
            iconBg: isPro ? 'bg-[hsl(var(--primary)_/_0.1)]' : 'bg-secondary',
            iconColor: isPro ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground',
            gradient: isPro,
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl border p-5 flex items-center gap-4 transition-all ${
              stat.gradient
                ? 'border-[hsl(var(--primary)_/_0.3)]'
                : 'border-border bg-card'
            }`}
            style={stat.gradient ? { background: 'var(--gradient-primary)' } : undefined}
          >
            {stat.gradient && (
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20" />
              </div>
            )}
            <div className={`relative w-11 h-11 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <stat.icon size={20} className={stat.gradient ? 'text-white' : stat.iconColor} />
            </div>
            <div className="relative">
              <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${stat.gradient ? 'text-white/90' : 'text-muted-foreground'}`}>
                {stat.label}
              </p>
              <p className={`text-2xl font-black tracking-tight ${stat.gradient ? 'text-white' : 'text-foreground'}`}>
                {stat.value}
                {stat.suffix && <span className={`text-sm font-semibold ml-0.5 ${stat.gradient ? 'text-white/70' : 'text-muted-foreground'}`}>{stat.suffix}</span>}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Resume grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-foreground">Your Resumes</h2>
          <span className="text-xs text-muted-foreground">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-[hsl(var(--primary))]" size={28} />
          </div>
        ) : resumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-card border border-dashed border-border rounded-2xl flex flex-col items-center"
          >
            <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-4">
              <FileText size={26} className="text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No resumes yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Create your first resume to start applying and tracking your ATS score.
            </p>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Plus size={15} />
              Create First Resume
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {resumes.map((resume) => (
              <motion.div
                variants={itemVariants}
                key={resume._id}
                whileHover={{ y: -2 }}
                className="group bg-card rounded-2xl border border-border overflow-hidden flex flex-col transition-all hover:border-[hsl(var(--primary)_/_0.5)] hover:shadow-md"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                {/* Preview area */}
                <div className="h-28 bg-secondary border-b border-border flex items-center justify-center relative">
                  <FileText size={28} className="text-muted-foreground group-hover:text-[hsl(var(--primary))] transition-colors" />
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === resume._id ? null : resume._id) }}
                      className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all ${openMenuId === resume._id ? 'opacity-100 bg-secondary' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <MoreVertical size={14} />
                    </button>
                    <AnimatePresence>
                      {openMenuId === resume._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 mt-1 w-44 bg-popover rounded-xl border border-border py-1 z-20 shadow-lg"
                        >
                          {[
                            { icon: Edit3, label: 'Edit', action: () => { navigate({ to: '/dashboard/resumes/$resumeId', params: { resumeId: resume._id } }); setOpenMenuId(null) } },
                            { icon: Copy, label: 'Duplicate', action: (e: React.MouseEvent) => handleDuplicate(e, resume._id, resume.title) },
                          ].map(({ icon: Icon, label, action }) => (
                            <button key={label} onClick={action as any} className="w-full text-left px-3 py-2 text-sm font-medium text-popover-foreground hover:bg-secondary flex items-center gap-2.5 transition-colors">
                              <Icon size={14} /> {label}
                            </button>
                          ))}
                          <div className="my-1 border-t border-border" />
                          <button onClick={(e) => handleDelete(e, resume._id)} className="w-full text-left px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2.5 transition-colors">
                            <Trash2 size={14} /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-foreground text-sm mb-0.5 truncate">{resume.title}</h3>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-5 capitalize">{resume.template}</p>
                  <div className="flex gap-2.5 mt-auto">
                    <button
                      onClick={() => navigate({ to: '/dashboard/resumes/$resumeId', params: { resumeId: resume._id } })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-all shadow-accent"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => navigate({ to: '/dashboard/resumes/$resumeId', params: { resumeId: resume._id } })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-muted-foreground bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-all"
                    >
                      <Eye size={12} /> Preview
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
