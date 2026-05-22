import { useState } from 'react';
import { useResumeStore } from '@stores/resumeStore';
import { Plus, Trash2, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CertificationImportModal from '../certifications/CertificationImportModal';

const inputClass =
  'w-full px-3 py-2 text-sm bg-input border border-input border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all';

export default function CertificationsForm() {
  const { currentResume, updateResumeData } = useResumeStore();
  const certifications = currentResume?.data?.certifications ?? [];
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const update = (updated: any[]) => {
    if (!currentResume) return;
    updateResumeData(currentResume._id, { certifications: updated });
  };

  const add = () =>
    update([
      ...certifications,
      { name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' },
    ]);

  const remove = (i: number) => update(certifications.filter((_: any, idx: number) => idx !== i));

  const change = (i: number, field: string, value: string) => {
    const updated = certifications.map((c: any, idx: number) =>
      idx === i ? { ...c, [field]: value } : c
    );
    update(updated);
  };

  const handleImport = (data: any) => {
    update([
      ...certifications,
      {
        name: data.name || '',
        issuer: data.issuer || '',
        issueDate: data.issueDate || '',
        expiryDate: data.expiryDate || '',
        credentialId: data.credentialId || '',
        credentialUrl: '',
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-primary-500" />
            Certifications
          </h2>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">
            Professional certifications and credentials
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Import
          </button>
          <button
            onClick={add}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-950 dark:bg-primary-950 text-primary-700 dark:text-primary-400 rounded-xl text-xs font-semibold hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      <CertificationImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />

      <AnimatePresence initial={false}>
        {certifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-foreground-muted text-sm"
          >
            No certifications yet. Click "Add" to get started.
          </motion.div>
        )}

        {certifications.map((cert: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card dark:bg-card dark:bg-card border border-border dark:border-border dark:border-border rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
                Certification {i + 1}
              </span>
              <button
                onClick={() => remove(i)}
                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-destructive/10 dark:hover:bg-red-950 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1">
                  Certification Name *
                </label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => change(i, 'name', e.target.value)}
                  placeholder="e.g. AWS Solutions Architect"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Issuing Organization
                </label>
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => change(i, 'issuer', e.target.value)}
                  placeholder="e.g. Amazon Web Services"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Issue Date
                </label>
                <input
                  type="month"
                  value={cert.issueDate}
                  onChange={(e) => change(i, 'issueDate', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Expiry Date
                </label>
                <input
                  type="month"
                  value={cert.expiryDate}
                  onChange={(e) => change(i, 'expiryDate', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Credential ID
                </label>
                <input
                  type="text"
                  value={cert.credentialId}
                  onChange={(e) => change(i, 'credentialId', e.target.value)}
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1">
                  Credential URL
                </label>
                <input
                  type="url"
                  value={cert.credentialUrl}
                  onChange={(e) => change(i, 'credentialUrl', e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
