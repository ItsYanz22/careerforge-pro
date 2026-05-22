import { apiClient } from './apiClient';

export interface CoverLetter {
  _id: string;
  title: string;
  content: string;
  jobDescription?: string;
  tone: string;
  resumeId: string | null;
  createdAt: string;
}

export const coverLetterApi = {
  getAll: () => apiClient.get<CoverLetter[]>('/cover-letters'),
  
  generate: (data: { 
    resumeId?: string; 
    jobTitle: string; 
    companyName: string; 
    tone?: 'professional' | 'friendly' | 'confident';
    parsedData?: any;
  }) => apiClient.post<CoverLetter>('/cover-letters/generate', data),
  
  parseResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<any>('/cover-letters/parse-resume', formData);
  },
  
  exportPdf: (coverLetterId: string) => 
    apiClient.post<Blob>('/cover-letters/export-pdf', { coverLetterId }, {
      responseType: 'blob' as any
    }),
    
  update: (id: string, data: Partial<CoverLetter>) => 
    apiClient.put<CoverLetter>(`/cover-letters/${id}`, data),
    
  delete: (id: string) => 
    apiClient.delete<void>(`/cover-letters/${id}`),
};
