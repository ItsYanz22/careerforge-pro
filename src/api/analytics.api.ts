import { apiClient } from './apiClient';

export interface AnalyticsDashboardData {
  scoreHistory: Array<{ date: string; score: number; title: string }>;
  aiBreakdown: {
    bulletRewrite: number;
    summaryRewrite: number;
    coach: number;
    tailor: number;
  };
  exportCount: number;
  recentActivity: Array<{ _id: string; count: number }>;
  resumeCount: number;
  aiCredits: {
    used: number;
    total: number;
    resetDate: string;
  };
  currentPlan: string;
}

export const analyticsApi = {
  getDashboard: (): Promise<AnalyticsDashboardData> => 
    apiClient.get('/analytics/dashboard'),
  
  getInsights: (): Promise<string[]> =>
    apiClient.get('/analytics/insights'),
};
