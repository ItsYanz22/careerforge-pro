import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useResumeStore } from '../../stores/resumeStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { ChevronLeft, Save, Layout, Loader, History, X, Check, Pencil, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import EditorTabs from '../../components/resume/forms/EditorTabs';
import ResumePreview from './ResumePreview';
import ThemeCustomizer from '../../components/resume/ThemeCustomizer';
import { VersionHistory } from '../../components/resume/VersionHistory';
import { ExportButton } from '../../components/export/ExportButton';
import { resumeApi } from '../../api/resume.api';
import { notify } from '../../stores/notificationStore';
import { useAICoachStore } from '../../stores/aiCoachStore';
import AICoachSidebar from '../../components/resume/AICoachSidebar';
import ShareModal from '../../components/resume/ShareModal';

export default function ResumeBuilder() {
  const { resumeId } = useParams({ strict: false });
  const { currentResume, loadResume, updateResume, isLoading, isSaving } = useResumeStore();
  const { preferences } = useSettingsStore();
  const aiCoach = useAICoachStore();
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'theme'>('editor');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedData = useRef<string>('');

  const autoSaveInterval = preferences?.resumePreferences?.autoSaveInterval ?? 30;

  useEffect(() => {
    if (resumeId) loadResume(resumeId);
  }, [resumeId]);

  // Auto-save: debounce on resume data changes
  useEffect(() => {
    if (!currentResume) return;
    const currentData = JSON.stringify(currentResume);
    if (currentData === lastSavedData.current) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        await updateResume(currentResume._id, currentResume);
        lastSavedData.current = currentData;
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch {
        setAutoSaveStatus('idle');
      }
    }, autoSaveInterval * 1000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [currentResume?.data, currentResume?.template, currentResume?.theme, currentResume?.font, currentResume?.spacing]);

  const handleSave = async () => {
    if (!currentResume) return;
    try {
      await updateResume(currentResume._id, currentResume);
      await resumeApi.saveVersion(currentResume._id).catch(() => {});
      lastSavedData.current = JSON.stringify(currentResume);
      notify.resumeSaved(currentResume.title);
      toast.success('Resume saved');
    } catch {
      toast.error('Failed to save resume');
    }
  };

  const handleTitleSave = async () => {
    if (!currentResume || !titleDraft.trim()) { setIsEditingTitle(false); return; }
    try {
      await updateResume(currentResume._id, { ...currentResume, title: titleDraft.trim() });
    } catch { /* non-critical */ }
    setIsEditingTitle(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background dark:bg-background">
        <Loader className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  if (!currentResume) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background">
        <div className="bg-card border border-border p-8 rounded-2xl shadow-card flex flex-col items-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Resume Not Found</h2>
          <p className="text-muted-foreground mb-6 text-center">We couldn't find the resume you're looking for.</p>
          <Link 
            to="/dashboard" 
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border px-6 py-3.5 flex items-center justify-between shrink-0 z-20 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex flex-col">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setIsEditingTitle(false); }}
                  className="text-base font-bold text-foreground bg-secondary dark:bg-card px-2 py-0.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 max-w-[200px]"
                />
                <button onClick={handleTitleSave} className="p-1 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-lg transition-colors">
                  <Check size={14} />
                </button>
                <button onClick={() => setIsEditingTitle(false)} className="p-1 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setTitleDraft(currentResume.title); setIsEditingTitle(true); }}
                className="flex items-center gap-1.5 group text-left"
              >
                <h1 className="text-lg font-bold text-foreground truncate max-w-[200px] sm:max-w-sm tracking-tight leading-tight">
                  {currentResume.title}
                </h1>
                <Pencil size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">{currentResume.template}</span>
              {autoSaveStatus === 'saving' && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Loader size={10} className="animate-spin" /> Saving…
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="text-[10px] text-primary-600 dark:text-primary-400 flex items-center gap-1">
                  <Check size={10} /> Saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl lg:hidden">
          {(['editor', 'preview', 'theme'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="mobileTabIndicator"
                  className="absolute inset-0 bg-card rounded-lg shadow-sm"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 capitalize">{tab}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-all shadow-sm hover:shadow"
            onClick={() => setActiveTab(activeTab === 'theme' ? 'editor' : 'theme')}
          >
            <Layout size={16} />
            {activeTab === 'theme' ? 'Back to Editor' : 'Templates & Theme'}
          </button>

          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-all shadow-sm hover:shadow"
          >
            <History size={16} />
            History
          </button>

          <ExportButton
            resumeId={currentResume._id}
            resumeTitle={currentResume.title}
          />

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="hidden lg:flex items-center gap-2 h-9 px-4 text-sm font-semibold text-primary bg-accent border border-border rounded-xl hover:bg-accent/80 active:scale-[0.98] transition-all shadow-sm"
          >
            <Share2 size={16} />
            Share
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 h-9 px-5 text-sm font-semibold text-[hsl(var(--btn-primary-text))] rounded-xl hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:hover:shadow-none transition-all shadow-sm gradient-primary"
          >
            {isSaving ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Panel (Left) */}
        <div 
          className={`flex-1 flex flex-col bg-card border-r border-border z-10 transition-all duration-300 ease-in-out shadow-sm print:hidden ${
            activeTab === 'preview' ? 'hidden lg:flex lg:w-[45%] lg:max-w-[650px]' : 'w-full lg:w-[45%] lg:max-w-[650px]'
          }`}
        >
          {activeTab === 'theme' ? (
            <div className="p-6 overflow-y-auto h-full custom-scrollbar bg-background/50">
              <ThemeCustomizer />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <EditorTabs />
            </div>
          )}
        </div>

        {/* Preview Panel (Right) */}
        <div 
          className={`flex-1 bg-background overflow-hidden relative ${
            activeTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ResumePreview />
        </div>

        {/* Version History Drawer */}
        <AnimatePresence>
          {showVersionHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="hidden lg:flex flex-col bg-card border-l border-border overflow-hidden shrink-0 shadow-sm"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">History</span>
                <button
                  onClick={() => setShowVersionHistory(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <VersionHistory
                  resumeId={currentResume._id}
                  onClose={() => setShowVersionHistory(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Coach Sidebar */}
        <AnimatePresence>
          {aiCoach.isOpen && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full z-50 flex"
            >
              <div className="w-80 h-full flex flex-col relative shadow-2xl">
                <button
                  onClick={aiCoach.closeCoach}
                  className="absolute top-4 right-4 p-1.5 bg-zinc-200 dark:bg-card rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-white z-50"
                >
                  <X size={16} />
                </button>
                <AICoachSidebar 
                  contentToAnalyze={aiCoach.content} 
                  type={aiCoach.type} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        resume={currentResume}
        onUpdate={() => {
          if (resumeId) loadResume(resumeId);
        }}
      />
    </div>
  );
}
