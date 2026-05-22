import { useState, useEffect } from 'react';
import { Target, CheckCircle2, XCircle, AlertCircle, Loader2, FileSearch, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumeStore } from '../../stores/resumeStore';
import { atsApi } from '../../api/ats.api';
import { aiApi } from '../../api/ai.api';
import { ATSSkeleton } from '../../components/ui/Skeleton';
import { PageTransition } from '../../components/ui/PageTransition';
import { notify } from '../../stores/notificationStore';
import TailorResumeModal from '../../components/ats/TailorResumeModal';
import toast from 'react-hot-toast';

const inputClass = 'w-full px-3.5 py-2.5 text-sm bg-input border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground';

export default function ATSDashboard() {
  const { resumes, loadResumes } = useResumeStore();
  const [jobDescription, setJobDescription] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [uploadMode, setUploadMode] = useState<'select' | 'upload'>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<null | {
    score: number;
    recruiterLikelihood: number;
    foundKeywords: string[];
    missingKeywords: string[];
    hardSkills: string[];
    softSkills: string[];
    suggestions: string[];
    overallFeedback?: string;
  }>(null);
  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);

  useEffect(() => { loadResumes(); }, []);
  useEffect(() => { if (resumes.length > 0 && !selectedResumeId) setSelectedResumeId(resumes[0]._id); }, [resumes]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please provide a job description.');
      return;
    }
    
    if (uploadMode === 'select' && !selectedResumeId) {
      toast.error('Please select a resume.');
      return;
    }
    
    if (uploadMode === 'upload' && !selectedFile) {
      toast.error('Please upload a PDF or TXT file.');
      return;
    }

    setIsAnalyzing(true);
    try {
      let report: any;
      let found: string[] = [];
      let missing: string[] = [];
      let suggestions: string[] = [];

      if (uploadMode === 'select') {
        report = await atsApi.analyzeResume({ resumeId: selectedResumeId, jobDescription });
        const { keywords } = await aiApi.extractKeywords({ jobDescription });
        const selectedResume = resumes.find((r) => r._id === selectedResumeId);
        const resumeText = JSON.stringify(selectedResume?.data || {}).toLowerCase();

        keywords.forEach((kw) => (resumeText.includes(kw.toLowerCase()) ? found : missing).push(kw));
        suggestions = report.suggestions.map((s: any) => s.suggestion);
        if (!suggestions.length) {
          suggestions.push('Add more quantified achievements to your experience.');
          if (missing.length) suggestions.push(`Consider adding keywords: ${missing.slice(0, 3).join(', ')}`);
        }
      } else {
        const formData = new FormData();
        formData.append('file', selectedFile!);
        formData.append('jobDescription', jobDescription);
        
        report = await atsApi.analyzeFile(formData);
        found = report.matchedKeywords || [];
        missing = report.missingKeywords || [];
        suggestions = report.suggestions?.map((s: any) => s.suggestion) || [];
      }

      setResults({ 
        score: report.overallScore, 
        recruiterLikelihood: report.recruiterLikelihood || 0,
        foundKeywords: report.matchedKeywords || found.slice(0, 15), 
        missingKeywords: report.missingKeywords || missing.slice(0, 15), 
        hardSkills: report.hardSkills || [],
        softSkills: report.softSkills || [],
        suggestions,
        overallFeedback: report.overallFeedback
      });
      notify.atsScoreUpdated(report.overallScore);
    } catch (err: any) {
      console.error('[ATSDashboard.handleAnalyze]', err);
      // Ensure the error message is a string to prevent React "Objects are not valid as a React child" errors
      const errorMessage = typeof err.data?.error === 'string' 
        ? err.data.error 
        : typeof err.message === 'string' 
          ? err.message 
          : 'Failed to analyze resume.';
          
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-primary' : s >= 60 ? 'text-warning' : 'text-destructive';
  const scoreStroke = (s: number) => s >= 80 ? 'hsl(var(--success))' : s >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">ATS Matcher</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Compare your resume against job descriptions to optimize your ATS score.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input panel */}
          <div className="lg:col-span-5">
            <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="px-5 py-4 border-b border-border dark:border-border bg-secondary dark:bg-card/30">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Target size={15} className="text-[hsl(var(--primary))]" /> Target Job
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Paste the job description you're applying for.</p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Job Description</label>
                  <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                    className={`${inputClass} h-52 resize-none`} placeholder="Paste the full job description here..." />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resume</label>
                    <div className="flex bg-secondary dark:bg-card p-0.5 rounded-lg border border-border dark:border-border">
                      <button onClick={() => setUploadMode('select')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${uploadMode === 'select' ? 'bg-secondary text-[hsl(var(--primary))] shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}>Select Existing</button>
                      <button onClick={() => setUploadMode('upload')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${uploadMode === 'upload' ? 'bg-secondary text-[hsl(var(--primary))] shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}>Upload File</button>
                    </div>
                  </div>
                  
                  {uploadMode === 'select' ? (
                    <select value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)} className={inputClass}>
                      <option value="" disabled>Select a resume…</option>
                      {resumes.map((r) => <option key={r._id} value={r._id}>{r.title || 'Untitled'}</option>)}
                    </select>
                  ) : (
                    <div className="relative">
                      <input 
                        type="file" 
                        accept=".pdf,.txt"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className={`block w-full text-sm text-muted-foreground dark:text-muted-foreground
                          file:mr-4 file:py-2.5 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-[hsl(var(--primary)_/_0.1)] file:text-[hsl(var(--primary))]
                          hover:file:bg-[hsl(var(--primary)_/_0.2)] dark:file:bg-[hsl(var(--primary)_/_0.15)] dark:hover:file:bg-[hsl(var(--primary)_/_0.2)]
                          border border-border dark:border-border rounded-xl p-1 bg-card dark:bg-card cursor-pointer
                        `}
                      />
                    </div>
                  )}
                </div>
                <button onClick={handleAnalyze} disabled={!jobDescription.trim() || (uploadMode === 'select' && !selectedResumeId) || (uploadMode === 'upload' && !selectedFile) || isAnalyzing}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[hsl(var(--btn-primary-text))] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--gradient-primary)' }}>
                  {isAnalyzing ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</> : <><FileSearch size={15} /> Analyze Match Score</>}
                </button>
              </div>
            </div>
          </div>

          {/* Results panel */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!results && !isAnalyzing && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-card dark:bg-card border border-dashed border-border dark:border-border rounded-2xl">
                  <div className="w-14 h-14 bg-secondary dark:bg-card rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp size={24} className="text-muted-foreground dark:text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Ready to Optimize</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Paste a job description and hit analyze to see how well your resume matches.
                  </p>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col justify-center p-8 bg-card dark:bg-card border border-border dark:border-border rounded-2xl">
                  <ATSSkeleton />
                </motion.div>
              )}

              {results && !isAnalyzing && (
                <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Score card */}
                  <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border overflow-hidden flex flex-col sm:flex-row" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <div className="p-6 flex flex-col items-center justify-center sm:w-44 flex-shrink-0" style={{ background: 'var(--gradient-dark)' }}>
                      <div className="relative">
                        <svg className="w-28 h-28 -rotate-90">
                          <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
                          <motion.circle cx="56" cy="56" r="48" fill="none" stroke={scoreStroke(results.score)} strokeWidth="7"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: '0 302' }}
                            animate={{ strokeDasharray: `${(results.score / 100) * 302} 302` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-3xl font-black ${scoreColor(results.score)}`}>{results.score}</span>
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">/100</span>
                        </div>
                      </div>
                      <p className={`text-xs font-bold mt-2 ${scoreColor(results.score)}`}>
                        {results.score >= 80 ? 'Great Match' : results.score >= 60 ? 'Needs Work' : 'Low Match'}
                      </p>
                    </div>
                    <div className="p-5 flex-1">
                      <h3 className="text-base font-bold text-foreground mb-1.5">Resume Score Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {results.overallFeedback || (results.score >= 80
                          ? 'Strong match. Adding a few missing keywords could push you past the 85% threshold.'
                          : 'Your resume is missing key requirements. Focus on integrating missing keywords.')}
                      </p>
                      <div className="flex gap-3">
                        <div className="flex-1 bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.15)] border border-[hsl(var(--primary)_/_0.3)] dark:border-[hsl(var(--primary)_/_0.3)] rounded-xl px-3 py-2.5 text-center">
                          <div className="text-xl font-black text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]">{results.foundKeywords.length}</div>
                          <div className="text-[10px] font-bold text-[hsl(var(--primary)_/_0.8)] dark:text-[hsl(var(--primary)_/_0.6)] uppercase tracking-wider">Matched</div>
                        </div>
                        <div className="flex-1 bg-warning/10 dark:bg-warning/20 border border-warning/30 dark:border-warning/50 rounded-xl px-3 py-2.5 text-center">
                          <div className="text-xl font-black text-warning">{results.missingKeywords.length}</div>
                          <div className="text-[10px] font-bold text-warning uppercase tracking-wider">Missing</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsTailorModalOpen(true)}
                        disabled={uploadMode === 'upload'}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-xs font-bold text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))] bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.15)] border border-[hsl(var(--primary)_/_0.3)] dark:border-[hsl(var(--primary)_/_0.3)] rounded-xl hover:bg-[hsl(var(--primary)_/_0.2)] dark:hover:bg-[hsl(var(--primary)_/_0.25)] transition-all disabled:opacity-50"
                      >
                        <Target size={14} />
                        Tailor Resume with AI
                      </button>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                    <div className="px-5 py-3.5 border-b border-border dark:border-border flex items-center gap-2">
                      <AlertCircle size={14} className="text-warning" />
                      <h3 className="text-sm font-semibold text-foreground">Actionable Suggestions</h3>
                    </div>
                    <div className="p-4 space-y-2.5">
                      {results.suggestions.map((s, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning/60 mt-2 flex-shrink-0" />
                          <p className="text-sm text-foreground">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Skills Analysis */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: 'Hard Skills', icon: Target, color: 'text-primary-500', keywords: results.hardSkills, chipClass: 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-800' },
                      { title: 'Soft Skills', icon: CheckCircle2, color: 'text-primary-500', keywords: results.softSkills, chipClass: 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-800' },
                    ].map(({ title, icon: Icon, color, keywords, chipClass }) => (
                      <div key={title} className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border overflow-hidden shadow-sm">
                        <div className="px-4 py-3 border-b border-border dark:border-border flex items-center gap-2">
                          <Icon size={14} className={color} />
                          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</h4>
                        </div>
                        <div className="p-4 flex flex-wrap gap-1.5">
                          {keywords.length > 0 ? keywords.map((kw) => (
                            <span key={kw} className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${chipClass}`}>{kw}</span>
                          )) : (
                            <span className="text-xs text-muted-foreground italic">No {title.toLowerCase()} identified</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recruiter Likelihood & Heatmap Placeholder */}
                  <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border overflow-hidden shadow-sm">
                    <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-black text-primary-500 mb-1">{results.recruiterLikelihood}%</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recruiter Match</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-foreground mb-2">Recruiter Likelihood Analysis</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          This score estimates how likely a human recruiter is to approve your resume based on keyword density, readability, and section completeness. 
                          {results.recruiterLikelihood > 80 ? ' Your resume has a very high chance of making it to a human review.' : ' Focus on improving readability and adding missing hard skills to boost this score.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: 'Matched Keywords', icon: CheckCircle2, color: 'text-primary-500', keywords: results.foundKeywords, chipClass: 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-800' },
                      { title: 'Missing Keywords', icon: XCircle, color: 'text-destructive', keywords: results.missingKeywords, chipClass: 'bg-destructive/10 dark:bg-destructive/5 text-destructive dark:text-red-400 border border-destructive/20 dark:border-destructive/30' },
                    ].map(({ title, icon: Icon, color, keywords, chipClass }) => (
                      <div key={title} className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                        <div className="px-4 py-3 border-b border-border dark:border-border flex items-center gap-2">
                          <Icon size={14} className={color} />
                          <h4 className="text-xs font-semibold text-foreground">{title}</h4>
                        </div>
                        <div className="p-4 flex flex-wrap gap-1.5">
                          {keywords.length > 0 ? keywords.map((kw) => (
                            <span key={kw} className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${chipClass}`}>{kw}</span>
                          )) : (
                            <span className="text-xs text-muted-foreground italic">None found</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {results && uploadMode === 'select' && (
        <TailorResumeModal
          isOpen={isTailorModalOpen}
          onClose={() => setIsTailorModalOpen(false)}
          resumeId={selectedResumeId}
          jobDescription={jobDescription}
        />
      )}
    </PageTransition>
  );
}

