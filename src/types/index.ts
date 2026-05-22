// User types
export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: SubscriptionPlan;
  currentPlan?: SubscriptionPlan;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  features?: UserFeatures;
  aiUsageCount?: number;
  aiUsageResetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Resume types
export interface Resume {
  _id: string;
  userId: string;
  title: string;
  template: TemplateType;
  font: FontType;
  theme: ThemeType;
  spacing: SpacingConfig;
  data: ResumeData;
  versions: ResumeVersion[];
  atsScore?: number;
  isPublic: boolean;
  shareId: string;
  comments?: Array<{
    _id: string;
    text: string;
    recruiterName?: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeVersion {
  _id: string;
  resumeId: string;
  versionNumber: number;
  data: ResumeData;
  atsScore?: number;
  template?: string;
  theme?: string;
  createdAt: Date;
}

export interface ResumeData {
  personal: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: SkillCategory[];
  certifications?: Certification[];
  projects?: Project[];
  languages?: Language[];
  volunteerExperience?: VolunteerExperience[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  portfolio?: string;
  github?: string;
}

export interface Experience {
  _id?: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrentRole?: boolean;
  description: string;
  bulletPoints: string[];
  originalBulletPoints?: string[]; // For comparison after AI rewrite
}

export interface Education {
  _id?: string;
  school: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
  description?: string;
}

export interface Certification {
  _id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Project {
  _id?: string;
  title: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  link?: string;
}

export interface Language {
  _id?: string;
  name: string;
  proficiency: 'Elementary' | 'Intermediate' | 'Advanced' | 'Native';
}

export interface VolunteerExperience {
  _id?: string;
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface SkillCategory {
  _id?: string;
  category: string;
  items: string[];
}

// Template types
export type TemplateType = 'modern-blue' | 'executive' | 'minimalist' | 'creative' | 'classic' | 'tech' | 'modern-minimal' | 'ats-optimized' | 'harvard' | 'startup' | 'corporate' | 'elegant' | 'developer';

export interface TemplateConfig {
  name: string;
  id: TemplateType;
  description: string;
  isPremium: boolean;
  preview?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  layout: {
    columnLayout: '1-col' | '2-col';
    headerStyle: 'full-width' | 'sidebar' | 'minimal';
    spacing: 'compact' | 'normal' | 'spacious';
  };
}

// Font types
export type FontType =
  | 'inter'
  | 'manrope'
  | 'plusjakarta'
  | 'satoshi'
  | 'generalsans'
  | 'roboto'
  | 'opensans'
  | 'lato'
  | 'sourcesanspro'
  | 'ibmplexsans'
  | 'merriweather'
  | 'playfair'
  | 'lora'
  | 'librebaskerville'
  | 'cormorant'
  | 'poppins'
  | 'montserrat'
  | 'outfit'
  | 'urbanist'
  | 'spacegrotesk';

export interface FontConfig {
  name: string;
  id: FontType;
  family: string;
  googleFontName?: string;
  isPremium: boolean;
}

// Theme types
export type ThemeType = 
  | 'emerald' | 'forest' | 'sage' | 'mint' | 'olive'
  | 'monochrome' | 'graphite' | 'warmstone' | 'softivory' | 'midnight'
  | 'gold' | 'deepemerald' | 'platinum' | 'charcoal' | 'pearl'
  | 'moderngreen' | 'slateemerald' | 'darksage' | 'frostedmint' | 'matteforest'
  | 'light' | 'dark' | 'professional' | 'creative' | 'minimalist' | 'modern';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textLight: string;
    background: string;
    border: string;
  };
}

// Spacing config
export interface SpacingConfig {
  lineHeight: 'compact' | 'normal' | 'spacious';
  margins: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  sectionGap: string;
  bulletPointGap: string;
}

// ATS & Analysis types
export interface ATSReport {
  _id: string;
  resumeId?: string;
  userId: string;
  overallScore: number;
  keywordMatch: number;
  formattingScore: number;
  readabilityScore: number;
  completeness: number;
  issues: ATSIssue[];
  suggestions: ATSSuggestion[];
  createdAt: Date;
}

export interface ATSIssue {
  type: 'critical' | 'warning' | 'info';
  message: string;
  field?: string;
}

export interface ATSSuggestion {
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  impact: string;
}

export interface JDAnalysisResult {
  keywords: KeywordData[];
  skills: SkillData[];
  tools: string[];
  responsibilities: string[];
  requiredQualifications: string[];
  niceToHave: string[];
  missingFromResume: string[];
}

export interface KeywordData {
  keyword: string;
  frequency: number;
  importance: number; // 0-100
  category: 'skill' | 'tool' | 'responsibility' | 'qualification';
  presentInResume: boolean;
}

export interface SkillData {
  skill: string;
  level?: 'junior' | 'mid' | 'senior' | 'expert';
  presentInResume: boolean;
}

// AI Rewrite types
export interface AIRewriteRequest {
  type: 'bullet-point' | 'summary' | 'full-section' | 'achievement';
  content: string;
  targetKeywords?: string[];
  tone?: 'professional' | 'executive' | 'technical';
}

export interface AIRewriteResponse {
  original: string;
  rewritten: string;
  improvements: string[];
  keywordsAdded: string[];
  quantifiedAchievements: boolean;
}

// AI Chat types
export interface ChatMessage {
  _id?: string;
  resumeId?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    section?: string;
    field?: string;
  };
}

// Subscription types
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

// User feature flags (mirrors server/models/User.ts UserFeatures)
export interface UserFeatures {
  premiumTemplates: boolean;
  unlimitedExports: boolean;
  advancedAI: boolean;
  coverLetterGenerator: boolean;
  advancedATS: boolean;
  unlimitedResumes: boolean;
}

// Export progress stages
export type ExportStage = 'idle' | 'preparing' | 'rendering' | 'generating' | 'downloading' | 'error';

// Export store state shape
export interface ExportStoreState {
  stage: ExportStage;
  error: string | null;
}

// Subscription store state shape
export interface SubscriptionStoreState {
  currentPlan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  features: UserFeatures;
}

// Analytics event shape (frontend)
export interface AnalyticsEventData {
  userId: string;
  eventType: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface Subscription {
  _id: string;
  userId: string;
  plan: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: 'active' | 'cancelled' | 'past_due';
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  cancelledAt?: Date;
}

export interface StripeWebhookPayload {
  id: string;
  object: string;
  type: string;
  data: {
    object: Record<string, any>;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Feature flags by subscription
export interface FeatureFlags {
  resumeCount: number;
  premiumTemplates: boolean;
  premiumFonts: boolean;
  aiRewrite: boolean;
  atsAnalysis: boolean;
  jobDescriptionAnalysis: boolean;
  pdfExport: boolean;
  docxExport: boolean;
  versionHistory: boolean;
  aiChat: boolean;
  customBranding: boolean;
}

// Export
export const FEATURE_FLAGS: Record<SubscriptionPlan, FeatureFlags> = {
  free: {
    resumeCount: 1,
    premiumTemplates: false,
    premiumFonts: false,
    aiRewrite: false,
    atsAnalysis: false,
    jobDescriptionAnalysis: false,
    pdfExport: true,
    docxExport: false,
    versionHistory: false,
    aiChat: false,
    customBranding: false,
  },
  pro: {
    resumeCount: 10,
    premiumTemplates: true,
    premiumFonts: true,
    aiRewrite: true,
    atsAnalysis: true,
    jobDescriptionAnalysis: true,
    pdfExport: true,
    docxExport: true,
    versionHistory: true,
    aiChat: true,
    customBranding: true,
  },
  enterprise: {
    resumeCount: 50,
    premiumTemplates: true,
    premiumFonts: true,
    aiRewrite: true,
    atsAnalysis: true,
    jobDescriptionAnalysis: true,
    pdfExport: true,
    docxExport: true,
    versionHistory: true,
    aiChat: true,
    customBranding: true,
  },
};
