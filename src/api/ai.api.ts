import { apiClient } from './apiClient';

export interface AIRewriteRequest {
  type: 'summary' | 'bullet';
  content: string;
  targetKeywords?: string[];
}

export interface AIGenerateCoverLetterRequest {
  resumeId: string;
  jobDescription: string;
  tone?: string;
}

export interface AIExtractKeywordsRequest {
  jobDescription: string;
}

export interface AIChatRequest {
  message: string;
  context?: any;
}

export const aiApi = {
  rewriteText: (data: AIRewriteRequest) => 
    apiClient.post<string>('/ai/rewrite', data),
    
  generateCoverLetter: (data: AIGenerateCoverLetterRequest) => 
    apiClient.post<string>('/ai/generate-cover-letter', data),
    
  extractKeywords: (data: AIExtractKeywordsRequest) => 
    apiClient.post<{ keywords: string[] }>('/ai/extract-keywords', data),
    
  chat: (data: AIChatRequest) => 
    apiClient.post<string>('/ai/chat', data),

  coachSection: (data: { content: string; type: string }) => 
    apiClient.post<{
      score: number;
      grammarIssues: string[];
      weakWords: string[];
      suggestedActionVerbs: string[];
      impactSuggestions: string;
      overallFeedback: string;
    }>('/ai/coach', data),

  tailorResume: (data: { resumeId: string; jobDescription: string }) => 
    apiClient.post<{
      tailoredSummary: string;
      experienceOptimizations: Array<{
        experienceId: string;
        originalBullet: string;
        optimizedBullet: string;
        reason: string;
      }>;
      addedSkills: string[];
      overallStrategy: string;
    }>('/ai/tailor', data),
};
