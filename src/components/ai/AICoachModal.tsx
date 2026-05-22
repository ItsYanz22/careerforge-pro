import React, { useState, useEffect } from 'react';
import { X, Zap, AlertCircle, Lightbulb } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  jobDescription?: string;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  resumeId,
  jobDescription,
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'bullets' | 'metrics' | 'verbs'>('overview');
  const [weakBullets, setWeakBullets] = useState<any[]>([]);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [actionVerbData, setActionVerbData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && resumeId) {
      loadCoachingFeedback();
    }
  }, [isOpen, resumeId]);

  const loadCoachingFeedback = async () => {
    try {
      setLoading(true);

      const analysisRes = await apiClient.post<any>('/api/ai/coach/full-resume-analysis', { resumeId, jobDescription });
      setFeedback(analysisRes?.coaching ?? {});

      const bulletsRes = await apiClient.post<any>('/api/ai/coach/weak-bullet-detection', { resumeId });
      setWeakBullets(bulletsRes?.weakBullets ?? []);

      const metricsRes = await apiClient.post<any>('/api/ai/coach/metrics-analysis', { resumeId });
      setMetricsData(metricsRes);

      const verbsRes = await apiClient.post<any>('/api/ai/coach/action-verb-suggestions', { resumeId });
      setActionVerbData(verbsRes);
    } catch (error) {
      console.error('Failed to load coaching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 dark:bg-destructive/5 border-destructive/20';
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800';
      default: return 'bg-secondary dark:bg-card';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card dark:bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h2 className="text-2xl font-bold text-foreground">AI Resume Coach</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-secondary dark:hover:bg-card rounded-lg transition">
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '??' },
                { id: 'bullets', label: 'Weak Bullets', icon: '??' },
                { id: 'metrics', label: 'Metrics', icon: '??' },
                { id: 'verbs', label: 'Action Verbs', icon: '?' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-3 font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-full py-20">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mb-4" />
                    <p className="text-muted-foreground">Analyzing your resume...</p>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="bg-secondary dark:bg-card/50 rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-4">Key Issues</h3>
                        <div className="space-y-3">
                          {Object.entries(feedback).slice(0, 3).map(([section, data]: [string, any]) => (
                            <div key={section} className={`border rounded-lg p-3 ${getSeverityColor(data?.issues?.[0]?.severity || 'low')}`}>
                              <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-foreground">{section}</p>
                                  <p className="text-sm text-muted-foreground mt-1">{data?.issues?.[0]?.explanation}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {Object.keys(feedback).length === 0 && (
                            <p className="text-muted-foreground text-sm">No issues found. Your resume looks great!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'bullets' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground mb-4">
                        Weak Bullet Points ({weakBullets.length})
                      </h3>
                      {weakBullets.slice(0, 5).map((bullet, idx) => (
                        <div key={idx} className="border border-destructive/20 bg-destructive/5 dark:bg-destructive/10 rounded-lg p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <AlertCircle className="w-5 h-5 text-destructive dark:text-red-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{bullet.section}</p>
                              <p className="text-sm text-muted-foreground mt-1">{bullet.bulletText}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {bullet.suggestions?.map((s: any, i: number) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                <p className="text-foreground">{s.suggestion}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {weakBullets.length === 0 && (
                        <p className="text-muted-foreground text-sm">No weak bullets detected. Great work!</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'metrics' && (
                    <div className="space-y-4">
                      <div className="bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                        <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-4">Metrics Analysis</h3>
                        {metricsData ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-foreground">Bullets with Metrics</span>
                              <span className="font-bold text-primary-600 dark:text-primary-400">{metricsData.metricsPercentage}%</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {metricsData.bulletsWithoutMetrics} bullets could benefit from adding numbers or measurable results.
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No metrics data available.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'verbs' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground mb-4">
                        Action Verb Opportunities ({actionVerbData?.bulletsNeedingVerbImprovement || 0})
                      </h3>
                      {actionVerbData?.improvements?.slice(0, 3).map((imp: any, idx: number) => (
                        <div key={idx} className="border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950 rounded-lg p-4">
                          <p className="font-medium text-foreground">{imp.section}</p>
                          <p className="text-sm text-muted-foreground mt-2">{imp.bulletText}</p>
                          {imp.suggestions?.map((s: any, i: number) => (
                            <div key={i} className="mt-2 p-2 bg-card dark:bg-card rounded border border-primary-100 dark:border-primary-900">
                              <p className="text-sm font-medium text-primary-900 dark:text-primary-100">{s.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6 bg-secondary dark:bg-card/50 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2 bg-muted text-foreground-muted rounded-lg font-medium hover:bg-muted/80 transition">
                Close
              </button>
              <button
                onClick={loadCoachingFeedback}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[hsl(var(--btn-primary-bg))] text-[hsl(var(--btn-primary-text))] rounded-lg font-medium hover:bg-[hsl(var(--btn-primary-hover-bg))] transition disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Refresh Analysis'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AICoachModal;

