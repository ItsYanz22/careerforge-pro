import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@config';
import { Resume, TemplateType, ResumeVersion } from '@types';

export const resumeApi = {
  getResumes: (): Promise<Resume[]> => {
    return apiClient.get(API_ENDPOINTS.resumes.list);
  },

  getResume: (id: string): Promise<Resume> => {
    return apiClient.get(API_ENDPOINTS.resumes.get(id));
  },

  createResume: (title: string, template: TemplateType): Promise<Resume> => {
    return apiClient.post(API_ENDPOINTS.resumes.create, { title, template });
  },

  updateResume: (id: string, data: Partial<Resume>): Promise<Resume> => {
    return apiClient.put(API_ENDPOINTS.resumes.update(id), data);
  },

  deleteResume: (id: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.resumes.delete(id));
  },

  cloneResume: (id: string, title: string): Promise<Resume> => {
    return apiClient.post(API_ENDPOINTS.resumes.clone(id), { title });
  },

  getVersions: (id: string): Promise<{ data: any[] }> => {
    return apiClient.get(API_ENDPOINTS.resumes.versions(id)) as any;
  },

  saveVersion: (id: string, data?: Partial<any>): Promise<any> => {
    return apiClient.post(`/resumes/${id}/save`, data ?? {}) as any;
  },

  restoreVersion: (resumeId: string, versionId: string): Promise<any> => {
    return apiClient.post(`/resumes/${resumeId}/versions/${versionId}/restore`, {}) as any;
  },
  
  getVersion: (resumeId: string, versionId: string): Promise<ResumeVersion> => {
    return apiClient.get(`/resumes/${resumeId}/versions/${versionId}`);
  },

  getPublicResume: (shareId: string): Promise<any> => {
    return apiClient.get(`/resumes/share/${shareId}`);
  },
  
  getSkillSuggestions: (id: string): Promise<{ suggestions: any[] }> => {
    return apiClient.get(`/resumes/${id}/skill-suggestions`);
  },
};
