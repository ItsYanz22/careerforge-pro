import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, TrendingUp, Lightbulb } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

interface JobMatchProps {
  resumeId: string;
  onMatchComplete?: (matchId: string, percentage: number) => void;
}

interface MatchResult {
  matchId: string;
  matchPercentage: number;
  interpretation: string;
  keywordDensity: number;
  semanticSimilarity: number;
  recruiterLikelihood: number;
  atsCompatibility: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  skillsAnalysis: {
    hardSkills: { matched: string[]; density: number };
    softSkills: { matched: string[]; density: number };
  };
}

export const JobMatcher: React.FC<JobMatchProps> = ({ resumeId, onMatchComplete }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJobDescription(content);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeJob = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter or upload a job description');
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post<MatchResult>('/api/jobs/match-resume', {
        resumeId,
        jobDescription,
        jobTitle: jobTitle || 'Unknown Position',
        jobCompany: jobCompany || 'Unknown Company',
      });

      setResult(response);
      setShowResults(true);
      onMatchComplete?.(response.matchId, response.matchPercentage);
    } catch (error) {
      console.error('Failed to match resume:', error);
      alert('Failed to analyze job match');
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage > 85) return 'text-primary';
    if (percentage > 70) return 'text-primary';
    if (percentage > 50) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getMatchBgColor = (percentage: number) => {
    if (percentage > 85) return 'bg-accent border-border';
    if (percentage > 70) return 'bg-primary/10 border-primary/20';
    if (percentage > 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-destructive/10 border-destructive/20';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card dark:bg-card rounded-2xl shadow-lg p-8"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Job Match Analyzer</h2>
              <p className="text-muted-foreground">Paste or upload a job description to see how well your resume matches</p>
            </div>

            <div className="space-y-6">
              {/* Job Title and Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Job Title (optional)"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
                <input
                  type="text"
                  placeholder="Company Name (optional)"
                  value={jobCompany}
                  onChange={(e) => setJobCompany(e.target.value)}
                  className="px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              {/* Job Description Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Job Description</label>
                <textarea
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] font-mono text-sm resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-input rounded-lg p-6">
                <label className="flex items-center justify-center gap-3 cursor-pointer">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Upload Job Description</p>
                    <p className="text-sm text-muted-foreground">Drag and drop or click to select</p>
                  </div>
                  <input
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAnalyzeJob}
                  disabled={loading || !jobDescription.trim()}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Analyze Match
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : result ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Match Score Card */}
            <div className={`border-2 rounded-2xl p-8 ${getMatchBgColor(result.matchPercentage)}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-foreground">Overall Match</h3>
                {result.matchPercentage > 70 && <CheckCircle className="w-8 h-8 text-primary" />}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-6xl font-bold" style={{ color: getMatchColor(result.matchPercentage) }}>
                  {result.matchPercentage}%
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{result.interpretation}</p>
                  <p className="text-sm text-muted-foreground mt-2">ATS Score: {result.atsCompatibility}/100</p>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card dark:bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground font-medium mb-2">Semantic Match</p>
                <p className="text-3xl font-bold text-primary">{result.semanticSimilarity}%</p>
                <p className="text-xs text-muted-foreground mt-2">How well keywords align</p>
              </div>
              <div className="bg-card dark:bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground font-medium mb-2">Keyword Density</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{result.keywordDensity.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-2">Optimal: 3-5%</p>
              </div>
              <div className="bg-card dark:bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground font-medium mb-2">Recruiter Appeal</p>
                <p className="text-3xl font-bold text-primary">{result.recruiterLikelihood}%</p>
                <p className="text-xs text-muted-foreground mt-2">Likelihood to review</p>
              </div>
            </div>

            {/* Matched Keywords */}
            <div className="bg-card dark:bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Matched Keywords ({result.matchedKeywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords.slice(0, 15).map((keyword, idx) => (
                  <span key={idx} className="px-3 py-1 bg-accent text-primary rounded-full text-sm font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            {result.missingKeywords.length > 0 && (
              <div className="bg-card border border-warning/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  Missing Keywords ({result.missingKeywords.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.missingKeywords.slice(0, 10).map((keyword, idx) => (
                    <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-warning rounded-full" />
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card dark:bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-3">Hard Skills Match</h3>
                <p className="text-2xl font-bold text-primary mb-2">
                  {result.skillsAnalysis.hardSkills.matched.length} matched
                </p>
                <p className="text-sm text-muted-foreground">
                  Density: {result.skillsAnalysis.hardSkills.density}%
                </p>
              </div>
              <div className="bg-card dark:bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-3">Soft Skills Match</h3>
                <p className="text-2xl font-bold text-primary mb-2">
                  {result.skillsAnalysis.softSkills.matched.length} matched
                </p>
                <p className="text-sm text-muted-foreground">
                  Density: {result.skillsAnalysis.softSkills.density}%
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResults(false);
                  setResult(null);
                  setJobDescription('');
                }}
                className="flex-1 px-6 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-muted transition"
              >
                Analyze Another Job
              </button>
              <button
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                <Lightbulb className="w-5 h-5" />
                Get Tailoring Tips
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default JobMatcher;



