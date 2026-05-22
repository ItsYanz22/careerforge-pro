import React, { useEffect, useState } from 'react';
import { History, RotateCcw, Clock, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { resumeApi } from '../../api/resume.api';
import { useResumeStore } from '../../stores/resumeStore';
import VersionDiffViewer from './VersionDiffViewer';
import toast from 'react-hot-toast';

interface VersionSummary {
  _id: string;
  versionNumber: number;
  createdAt: string;
  template?: string;
  theme?: string;
  font?: string;
}

interface VersionHistoryProps {
  resumeId: string;
  onClose?: () => void;
}

/**
 * Version History panel.
 * Lists snapshots with timestamp + template/theme label.
 * "Restore" button calls the restore endpoint and reloads the resume.
 */
export const VersionHistory: React.FC<VersionHistoryProps> = ({ resumeId, onClose }) => {
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<VersionSummary | null>(null);
  const { loadResume } = useResumeStore();

  useEffect(() => {
    loadVersions();
  }, [resumeId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const res = await resumeApi.getVersions(resumeId);
      setVersions(res.data ?? []);
    } catch {
      toast.error('Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (versionId: string, versionNumber: number) => {
    if (!confirm(`Restore version ${versionNumber}? Your current resume will be saved as a new version first.`)) return;

    try {
      setRestoringId(versionId);
      await resumeApi.restoreVersion(resumeId, versionId);
      toast.success(`Restored to version ${versionNumber}`);
      await loadResume(resumeId);
      await loadVersions();
      onClose?.();
    } catch {
      toast.error('Failed to restore version');
    } finally {
      setRestoringId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border dark:border-border">
        <History className="w-4 h-4 text-[hsl(var(--primary))]" />
        <h3 className="text-sm font-semibold text-foreground">Version History</h3>
        <span className="ml-auto text-xs text-muted-foreground">{versions.length} versions</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-[hsl(var(--primary))] animate-spin" />
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Clock className="w-8 h-8 text-foreground-muted mb-3" />
            <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">No versions yet</p>
            <p className="text-xs text-foreground-muted mt-1">
              Versions are saved when you save your resume
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {versions.map((v, i) => (
                <motion.li
                  key={v._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-background dark:hover:bg-card/50 group transition-colors"
                >
                  {/* Version number */}
                  <div className="w-7 h-7 rounded-lg bg-secondary dark:bg-card flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground">
                      v{v.versionNumber}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {v.template ? (
                        <span className="capitalize">{v.template}</span>
                      ) : (
                        'Snapshot'
                      )}
                      {v.theme && (
                        <span className="text-muted-foreground dark:text-muted-foreground"> · {v.theme}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground dark:text-muted-foreground mt-0.5">
                      {formatDate(v.createdAt)}
                    </p>
                  </div>

                  {/* Restore button */}
                  <button
                    onClick={() => handleRestore(v._id, v.versionNumber)}
                    disabled={!!restoringId}
                    className="
                      flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                      text-[11px] font-semibold
                      text-muted-foreground dark:text-muted-foreground
                      hover:text-[hsl(var(--primary))] dark:hover:text-[hsl(var(--primary))]
                      hover:bg-[hsl(var(--primary)_/_0.1)] dark:hover:bg-[hsl(var(--primary)_/_0.1)]
                      opacity-0 group-hover:opacity-100
                      transition-all disabled:opacity-40
                    "
                  >
                    {restoringId === v._id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3 h-3" />
                    )}
                    Restore
                  </button>

                  <button
                    onClick={() => setSelectedVersion(v)}
                    className="
                      p-1.5 rounded-lg
                      text-foreground-muted hover:text-foreground
                      hover:bg-secondary dark:hover:bg-card
                      opacity-0 group-hover:opacity-100
                      transition-all
                    "
                    title="Compare with Current"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        )}
      </div>

      {selectedVersion && (
        <VersionDiffViewer
          isOpen={!!selectedVersion}
          onClose={() => setSelectedVersion(null)}
          resumeId={resumeId}
          versionId={selectedVersion._id}
          versionNumber={selectedVersion.versionNumber}
        />
      )}
    </div>
  );
};

export default VersionHistory;
