import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Globe, Lock, Copy, Check, ExternalLink, Mail } from 'lucide-react';
import { resumeApi } from '../../api/resume.api';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: any;
  onUpdate: (updatedResume: any) => void;
}

export default function ShareModal({ isOpen, onClose, resume, onUpdate }: ShareModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${resume.shareId}`;

  const togglePublic = async () => {
    setIsUpdating(true);
    try {
      const updated = await resumeApi.updateResume(resume._id, { isPublic: !resume.isPublic });
      onUpdate(updated);
      toast.success(resume.isPublic ? 'Resume is now private' : 'Resume is now public!');
    } catch (err) {
      toast.error('Failed to update visibility');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border dark:border-border"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-border flex items-center justify-between bg-background/50 dark:bg-card/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)_/_0.1)] flex items-center justify-center text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))]">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Share Resume</h3>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">Manage public access and sharing</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-4 bg-background dark:bg-card/50 rounded-2xl border border-zinc-100 dark:border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${resume.isPublic ? 'bg-[hsl(var(--primary)_/_0.15)] text-[hsl(var(--primary))]' : 'bg-zinc-200 text-muted-foreground'}`}>
                    {resume.isPublic ? <Globe size={18} /> : <Lock size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Public Visibility</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      {resume.isPublic ? 'Anyone with the link can view' : 'Only you can view this resume'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={togglePublic}
                  disabled={isUpdating}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    resume.isPublic 
                      ? 'bg-muted text-foreground-muted' 
                      : 'bg-[hsl(var(--primary))] text-white shadow-lg shadow-accent'
                  }`}
                >
                  {resume.isPublic ? 'Make Private' : 'Go Public'}
                </button>
              </div>

              {/* Share Link */}
              <div className={`space-y-3 transition-all duration-300 ${resume.isPublic ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale'}`}>
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Shareable Link</h4>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-2.5 bg-background dark:bg-card border border-border dark:border-border rounded-xl text-xs text-muted-foreground truncate select-all">
                    {shareUrl}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`grid grid-cols-2 gap-3 transition-all duration-300 ${resume.isPublic ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-secondary text-foreground text-xs font-bold rounded-2xl hover:bg-muted transition-colors"
                >
                  <ExternalLink size={14} /> Preview Public
                </a>
                <a
                  href={`mailto:?subject=My Resume&body=Check out my resume here: ${shareUrl}`}
                  className="flex items-center justify-center gap-2 py-3 bg-secondary text-foreground text-xs font-bold rounded-2xl hover:bg-muted transition-colors"
                >
                  <Mail size={14} /> Send via Email
                </a>
              </div>

              {!resume.isPublic && (
                <p className="text-center text-[10px] text-muted-foreground italic">
                  Turn on public visibility to enable sharing features.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-background/50 flex justify-end">
              <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-foreground-muted hover:text-foreground transition-colors">
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
