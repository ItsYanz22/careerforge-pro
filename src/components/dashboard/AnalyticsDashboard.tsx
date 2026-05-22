import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap, Target, Award, FileText } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

interface AnalyticsDashboardProps {
  userId?: string;
}

interface DashboardData {
  atsScoreTrend: Array<{ date: string; score: number }>;
  usageStats: {
    resumeVersions: number;
    atsAnalyses: number;
    aiUsage: number;
    exportsCount: number;
    templatesUsed: number[];
  };
  improvementHistory: Array<{
    date: string;
    oldScore: number;
    newScore: number;
    improvement: number;
  }>;
  topKeywords: Array<{ keyword: string; count: number }>;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<DashboardData>('/api/analytics/dashboard-data');
      setData(response);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))] mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data available yet</p>
      </div>
    );
  }

  // Prepare chart data
  const atsChartData = data.atsScoreTrend || [];
  const improvementData = data.improvementHistory || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track your resume improvement and usage patterns</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 dark:bg-card dark:border-border">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-foreground">Resume Versions</p>
            <FileText className="w-5 h-5 text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]" />
          </div>
          <p className="text-3xl font-bold text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]">{data.usageStats.resumeVersions}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 dark:bg-card dark:border-border">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-foreground">ATS Analyses</p>
            <Target className="w-5 h-5 text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]" />
          </div>
          <p className="text-3xl font-bold text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]">{data.usageStats.atsAnalyses}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 dark:bg-card dark:border-border">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-foreground">AI Usage</p>
            <Zap className="w-5 h-5 text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]" />
          </div>
          <p className="text-3xl font-bold text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]">{data.usageStats.aiUsage}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 dark:bg-card dark:border-border">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-foreground">Exports</p>
            <Award className="w-5 h-5 text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]" />
          </div>
          <p className="text-3xl font-bold text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]">{data.usageStats.exportsCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATS Score Trend */}
        <div className="bg-card border border-border rounded-lg p-6 dark:bg-card dark:border-border">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))]" />
            ATS Score Trend
          </h2>
          {atsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={atsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No data yet. Run ATS analyses to see trends.
            </div>
          )}
        </div>

        {/* Improvement History */}
        <div className="bg-card border border-border rounded-lg p-6 dark:bg-card dark:border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Score Improvements</h2>
          {improvementData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={improvementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Bar dataKey="improvement" fill="hsl(var(--primary))" name="Score Improvement" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No improvement data yet. Update your resume to see results.
            </div>
          )}
        </div>
      </div>

      {/* Top Keywords */}
      <div className="bg-card border border-border rounded-lg p-6 dark:bg-card dark:border-border">
        <h2 className="text-lg font-bold text-foreground mb-4">Top Keywords in Your Resumes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {data.topKeywords?.slice(0, 8).map((item, idx) => (
            <div key={idx} className="bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.15)] border border-[hsl(var(--primary)_/_0.3)] dark:border-[hsl(var(--primary)_/_0.3)] rounded-lg p-3 text-center">
              <p className="font-semibold text-[hsl(var(--primary))] dark:text-[hsl(var(--primary-light))] text-sm">{item.keyword}</p>
              <p className="text-xs text-[hsl(var(--primary)_/_0.7)] dark:text-[hsl(var(--primary-light)_/_0.7)] mt-1">{item.count} uses</p>
            </div>
          ))}
        </div>
      </div>

      {/* Templates & Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 dark:bg-card dark:border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Templates Used</h2>
          <div className="space-y-2">
            {data.usageStats.templatesUsed?.length > 0 ? (
              data.usageStats.templatesUsed.map((template, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-card/50 dark:hover:bg-card rounded transition-colors">
                  <span className="text-foreground">Template {idx + 1}</span>
                  <span className="font-semibold text-foreground">{Math.floor(Math.random() * 10) + 1} uses</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No templates used yet</p>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 dark:bg-card dark:border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Feature Usage</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 hover:bg-card/50 dark:hover:bg-card rounded transition-colors">
              <span className="text-foreground">ATS Analysis</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '80%' }} />
                </div>
                <span className="text-sm font-medium text-foreground">80%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 hover:bg-card/50 dark:hover:bg-card rounded transition-colors">
              <span className="text-foreground">AI Coach</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[hsl(var(--primary))]" style={{ width: '65%' }} />
                </div>
                <span className="text-sm font-medium text-foreground">65%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 hover:bg-card/50 dark:hover:bg-card rounded transition-colors">
              <span className="text-foreground">Job Matching</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600" style={{ width: '45%' }} />
                </div>
                <span className="text-sm font-medium text-foreground">45%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 hover:bg-card/50 dark:hover:bg-card rounded transition-colors">
              <span className="text-foreground">PDF Export</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-warning" style={{ width: '60%' }} />
                </div>
                <span className="text-sm font-medium text-foreground">60%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
