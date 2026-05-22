import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useResumeStore } from '../../stores/resumeStore'
import { useAuthStore } from '../../stores/authStore'
import { coverLetterApi } from '../../api/coverLetter.api'
import { FileText, Loader, Sparkles, Copy, Check, Lock, Crown, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { UpgradeModal } from '../../components/premium/PremiumUI'

interface SavedCoverLetter {
  _id: string;
  title: string;
  content: string;
  tone: string;
  createdAt: string;
}

export default function CoverLetterGenerator() {
  const navigate = useNavigate()
  const { resumes, loadResumes, isLoading: isLoadingResumes } = useResumeStore()
  const user = useAuthStore((s) => s.user)
  const hasCoverLetterAccess = user?.features?.coverLetterGenerator === true

  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [tone, setTone] = useState('professional')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [savedLetters, setSavedLetters] = useState<SavedCoverLetter[]>([])
  const [copied, setCopied] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    loadResumes()
    if (hasCoverLetterAccess) loadSavedLetters()
  }, [hasCoverLetterAccess])

  const loadSavedLetters = async () => {
    try {
      const res = await coverLetterApi.getAll()
      setSavedLetters(res ?? [])
    } catch {
      // non-critical
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size too large (max 10MB)')
        return
      }
      setUploadedFile(file)
      setSelectedResumeId('') // Clear resume selection
    }
  }

  const handleGenerate = async () => {
    if (!hasCoverLetterAccess) {
      setShowUpgradeModal(true)
      return
    }
    if (!selectedResumeId && !uploadedFile) { 
      toast.error('Please select a resume or upload one')
      return 
    }
    if (!jobTitle.trim()) { toast.error('Please enter a job title'); return }
    if (!companyName.trim()) { toast.error('Please enter a company name'); return }

    setIsGenerating(true)
    setGeneratedLetter('')
    const toastId = toast.loading('Parsing resume and generating cover letter...')
    
    try {
      let payload: any = {
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        tone: tone as any,
      };

      if (uploadedFile) {
        try {
          // Parse the uploaded file
          console.log('📤 Parsing uploaded file:', uploadedFile.name)
          const parseRes = await coverLetterApi.parseResume(uploadedFile);
          
          if (!parseRes || Object.keys(parseRes).length === 0) {
            throw new Error('Resume parsing failed - could not extract data from file');
          }

          console.log('✓ Parsed resume data:', parseRes);
          payload.parsedData = parseRes;
          payload.uploadedResumeName = uploadedFile.name;
          
          toast.loading('Generating cover letter...', { id: toastId });
        } catch (parseErr: any) {
          throw new Error(`Resume parsing failed: ${parseErr?.message || 'Unsupported file format'}`);
        }
      } else if (selectedResumeId) {
        // Use existing resume
        payload.resumeId = selectedResumeId;
      }

      console.group('📨 Cover Letter Payload');
      console.log(payload);
      console.groupEnd();

      const result = await coverLetterApi.generate(payload)

      const content = result?.content ?? ''
      setGeneratedLetter(content)
      toast.success('Cover letter generated and saved!', { id: toastId })
      loadSavedLetters()
    } catch (error: any) {
      toast.dismiss(toastId)
      
      // Provide user-friendly error messages
      let errorMsg = 'Failed to generate cover letter';
      
      if (error?.status === 403) {
        setShowUpgradeModal(true)
        return
      } else if (error?.status === 400) {
        errorMsg = error?.message || 'Please provide valid resume and job information';
      } else if (error?.status === 404) {
        errorMsg = 'Resume not found';
      } else if (error?.status === 500) {
        errorMsg = error?.message || 'Server error - please try again';
      } else {
        errorMsg = error?.message || errorMsg;
      }
      
      console.error('❌ Cover letter generation error:', error);
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLoadSaved = (letter: SavedCoverLetter) => {
    setGeneratedLetter(letter.content)
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-full space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Cover Letter Generator
            {!hasCoverLetterAccess && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-400 rounded-full">
                <Crown className="w-3 h-3" /> Pro
              </span>
            )}
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1 text-sm">
            AI-powered cover letters tailored to your resume and target role.
          </p>
        </div>
      </div>

      {/* Pro gate banner */}
      {!hasCoverLetterAccess && (
        <div className="flex items-center gap-4 p-4 bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.1)] border border-[hsl(var(--primary)_/_0.3)] dark:border-[hsl(var(--primary)_/_0.2)] rounded-2xl">
          <Lock className="w-5 h-5 text-[hsl(var(--primary))] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))]">
              Cover Letter Generator is a Pro feature
            </p>
            <p className="text-xs text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] mt-0.5">
              Upgrade to Pro to generate unlimited AI-powered cover letters saved to your account.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: '/dashboard/subscription' })}
            className="flex-shrink-0 px-4 py-2 bg-[hsl(var(--btn-primary-bg))] hover:bg-[hsl(var(--btn-primary-hover-bg))] text-[hsl(var(--btn-primary-text))] text-sm font-semibold rounded-xl transition-colors"
          >
            Upgrade
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-card border-border rounded-2xl border shadow-sm p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-foreground">
                Resume Context
              </label>
              <div className="flex p-1 bg-secondary rounded-lg border border-border">
                <button
                  onClick={() => { setUploadedFile(null); setSelectedResumeId(''); }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!uploadedFile ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Select Existing
                </button>
                <button
                  onClick={() => { setSelectedResumeId(''); }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${uploadedFile ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Upload New
                </button>
              </div>
            </div>

            {!uploadedFile && (
              <div className="animate-in fade-in duration-300">
                {isLoadingResumes ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                    <Loader className="animate-spin" size={14} /> Loading resumes…
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    disabled={!hasCoverLetterAccess}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-foreground disabled:opacity-50"
                  >
                    <option value="">— Select a resume —</option>
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>{r.title}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {(uploadedFile || !selectedResumeId) && !(!uploadedFile && selectedResumeId !== '') && (
              <div className="animate-in fade-in duration-300">
                {!uploadedFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-secondary/40 transition-all bg-secondary/20">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground font-medium">
                        <span className="font-bold text-foreground">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">PDF, DOCX, or TXT (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-primary-50/50 dark:bg-primary-950/20 border border-primary/30 rounded-xl">
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <FileText size={18} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-foreground truncate">{uploadedFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to parse</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setUploadedFile(null)}
                      className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Engineer"
                disabled={!hasCoverLetterAccess}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-foreground disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Company
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                disabled={!hasCoverLetterAccess}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-foreground disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={!hasCoverLetterAccess}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-foreground disabled:opacity-50"
            >
              <option value="professional">Professional & Formal</option>
              <option value="friendly">Friendly & Approachable</option>
              <option value="confident">Confident & Direct</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-[hsl(var(--btn-primary-bg))] hover:bg-[hsl(var(--btn-primary-hover-bg))] disabled:opacity-60 text-[hsl(var(--btn-primary-text))] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {isGenerating ? (
              <><Loader className="animate-spin" size={16} /> Generating…</>
            ) : !hasCoverLetterAccess ? (
              <><Lock size={16} /> Upgrade to Generate</>
            ) : (
              <><Sparkles size={16} /> Generate Cover Letter</>
            )}
          </button>

          {/* Saved letters */}
          {hasCoverLetterAccess && savedLetters.length > 0 && (
            <div className="pt-4 border-t border-zinc-100 dark:border-border">
              <p className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider mb-2">
                Recent Letters
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {savedLetters.slice(0, 5).map((letter) => (
                  <button
                    key={letter._id}
                    onClick={() => handleLoadSaved(letter)}
                className="w-full text-left px-3 py-2 text-xs text-muted-foreground hover:bg-background rounded-lg transition-colors truncate"
                  >
                    {letter.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="bg-card border-border rounded-2xl border shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="text-[hsl(var(--primary))]" size={18} />
              Generated Output
            </h2>
            {generatedLetter && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-2.5 py-1.5 bg-secondary dark:bg-card rounded-lg border border-border dark:border-border"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-secondary border border-border rounded-xl p-4 overflow-y-auto max-h-[520px] whitespace-pre-wrap text-sm text-foreground leading-relaxed custom-scrollbar">
            {generatedLetter ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {generatedLetter}
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-3 py-12">
                <Sparkles size={28} className="opacity-30" />
                <p className="text-sm">Your cover letter will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Cover Letter Generator"
        description="Generate unlimited AI-powered cover letters tailored to each job application. Saved to your account for easy access."
      />
    </div>
  )
}
