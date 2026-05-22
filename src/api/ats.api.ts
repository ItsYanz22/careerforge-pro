import { apiClient } from './apiClient';

export interface ATSAnalyzeRequest {
  resumeId: string;
  jobDescription?: string;
}

export interface ATSIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  section?: string;
}

export interface ATSSuggestion {
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  impact?: string;
}

export interface ATSReportData {
  _id: string;
  resumeId: string;
  userId: string;
  overallScore: number;
  keywordMatch: number;
  formattingScore: number;
  readabilityScore: number;
  completeness: number;
  issues: ATSIssue[];
  suggestions: ATSSuggestion[];
  createdAt: string;
}

export interface ATSJobDescriptionAnalyzeRequest {
  jobDescription: string;
}

export interface ATSJobDescriptionAnalysis {
  keywords: { keyword: string; count: number; importance: string }[];
  skills: { skill: string; category: string }[];
  tools: string[];
  suggestedRoles: string[];
}

export const atsApi = {
  analyzeResume: (data: ATSAnalyzeRequest) => 
    apiClient.post<ATSReportData>('/ats/analyze', data),
    
  analyzeJobDescription: (data: ATSJobDescriptionAnalyzeRequest) => 
    apiClient.post<ATSJobDescriptionAnalysis>('/ats/job-description', data),
    
  analyzeFile: (formData: FormData) => 
    apiClient.post<ATSReportData>('/ats/analyze-file', formData),
};
