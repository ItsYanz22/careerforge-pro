import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Link, Loader, Sparkles, AlertCircle, FileCheck } from 'lucide-react';
import { certificationsApi, CertificateData } from '../../../api/certifications.api';
import toast from 'react-hot-toast';

interface CertificationImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: CertificateData) => void;
}

export default function CertificationImportModal({
  isOpen,
  onClose,
  onImport,
}: CertificationImportModalProps) {
  const [activeTab, setActiveTab] = useState<'ocr' | 'linkedin'>('ocr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large (max 5MB)');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Extracting certificate data...');
    
    try {
      const result = await certificationsApi.importOCR(file);
      onImport(result);
      toast.success('Certificate details extracted!', { id: toastId });
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to extract data', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLinkedinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl.trim()) return;

    setIsProcessing(true);
    const toastId = toast.loading('Fetching data...');
    
    try {
      const result = await certificationsApi.importLinkedIn(linkedinUrl);
      toast.success(result.message, { id: toastId });
      // In a real implementation, we would extract data if possible
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch data', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card w-full max-w-md border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
          <div>
            <h2 className="text-lg font-bold text-foreground">Import Certification</h2>
            <p className="text-xs text-muted-foreground">Add details automatically using AI</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 m-4 bg-secondary rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'ocr' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload size={16} /> File OCR
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'linkedin' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Link size={16} /> LinkedIn
          </button>
        </div>

        {/* Content */}
        <div className="p-4 pt-0">
          {activeTab === 'ocr' ? (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all bg-secondary/10">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isProcessing ? (
                    <Loader className="w-10 h-10 text-primary animate-spin" />
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-bold text-foreground">Click to upload certificate</p>
                      <p className="text-xs text-muted-foreground mt-1">Images or PDF (MAX. 5MB)</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileUpload} disabled={isProcessing} />
              </label>

              <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
                <AlertCircle className="text-primary w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Our AI will scan your certificate to extract the Name, Issuer, Date, and ID automatically.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLinkedinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Certification URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/learning/certificate/..."
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    required
                  />
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !linkedinUrl.trim()}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25"
              >
                {isProcessing ? <Loader className="animate-spin" size={18} /> : <FileCheck size={18} />}
                Fetch from LinkedIn
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-secondary/20 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
