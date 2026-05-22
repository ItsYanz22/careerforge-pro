import { apiClient } from './apiClient';

export interface CertificateData {
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
}

export const certificationsApi = {
  importOCR: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<CertificateData>('/certifications/ocr', formData);
  },
  
  importLinkedIn: (url: string) => {
    return apiClient.post<{ message: string; url: string }>('/certifications/linkedin', { url });
  },
};
