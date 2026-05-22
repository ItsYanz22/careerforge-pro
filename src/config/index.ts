// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.DEV ? '/api' : 'http://localhost:3000/api'
);

export const API_ENDPOINTS = {
  // Auth
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  // Resumes
  resumes: {
    list: '/resumes',
    create: '/resumes',
    get: (id: string) => `/resumes/${id}`,
    update: (id: string) => `/resumes/${id}`,
    delete: (id: string) => `/resumes/${id}`,
    clone: (id: string) => `/resumes/${id}/clone`,
    versions: (id: string) => `/resumes/${id}/versions`,
    export: (id: string, format: 'pdf' | 'docx' | 'json') => `/resumes/${id}/export?format=${format}`,
  },
  // ATS Analysis
  ats: {
    analyze: '/ats/analyze',
    jobDescription: '/ats/job-description',
    compareWithJD: '/ats/compare',
  },
  // AI Services
  ai: {
    rewrite: '/ai/rewrite',
    chat: '/ai/chat',
    generateSummary: '/ai/summary',
    generateCoverLetter: '/ai/cover-letter',
    extractKeywords: '/ai/keywords',
  },
  // Subscriptions
  subscriptions: {
    plans: '/subscriptions/plans',
    current: '/subscriptions/current',
    upgrade: '/subscriptions/upgrade',
    cancel: '/subscriptions/cancel',
    createCheckout: '/subscriptions/checkout',
    webhook: '/subscriptions/webhook',
  },
  // User
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    preferences: '/users/preferences',
  },
};

export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export const AI_CONFIG = {
  MAX_REWRITE_CHAR_LENGTH: 5000,
  MAX_CHAT_HISTORY: 50,
  REWRITE_TONE_OPTIONS: ['professional', 'executive', 'technical'] as const,
};

export const RESUME_CONFIG = {
  MAX_RESUMES_FREE: 1,
  MAX_RESUMES_PRO: 10,
  MAX_RESUMES_ENTERPRISE: 50,
  PDF_PAGE_SIZE: 'A4',
  PDF_MARGINS: { top: 10, bottom: 10, left: 10, right: 10 }, // in mm
};

export const RATE_LIMITS = {
  ai_rewrite: '20/hour',
  job_analysis: '10/hour',
  pdf_export: '50/day',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  STRIPE_CONFIG,
  PAGINATION,
  UPLOAD_CONFIG,
  AI_CONFIG,
  RESUME_CONFIG,
  RATE_LIMITS,
};
