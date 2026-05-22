/**
 * Advanced ATS Scoring Engine
 * Extended scoring with semantic analysis, keyword density, and recruiter-grade metrics
 */

export interface AdvancedATSMetrics {
  keywordDensity: number;
  semanticSimilarity: number;
  sectionCompleteness: Record<string, number>;
  readabilityScore: number;
  formattingScore: number;
  hardSkillsMatch: { matched: string[]; density: number };
  softSkillsMatch: { matched: string[]; density: number };
  recruiterLikelihoodScore: number;
  atsCompatibilityScore: number;
  heatmap: HeatmapData;
  recommendations: RecommendationItem[];
}

export interface HeatmapData {
  summary: number;
  experience: number;
  skills: number;
  education: number;
  projects: number;
  certifications: number;
  contact: number;
}

export interface RecommendationItem {
  category: 'critical' | 'high' | 'medium' | 'low';
  section: string;
  suggestion: string;
  impact: string;
  estimatedScoreIncrease: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Semantic Similarity Analysis
// ────────────────────────────────────────────────────────────────────────────

const SKILL_SYNONYMS: Record<string, string[]> = {
  'javascript': ['js', 'javascript', 'typescript', 'ts', 'nodejs', 'node'],
  'python': ['python', 'django', 'flask', 'fastapi'],
  'react': ['react', 'reactjs', 'nextjs', 'next', 'react native'],
  'aws': ['aws', 'amazon web services', 's3', 'ec2', 'lambda', 'rds'],
  'azure': ['azure', 'microsoft azure', 'cosmos', 'service bus', 'functions'],
  'sql': ['sql', 'mysql', 'postgres', 'postgresql', 'oracle', 'tsql'],
  'mongodb': ['mongodb', 'nosql', 'document database'],
  'docker': ['docker', 'containerization', 'container', 'kubernetes', 'k8s'],
  'git': ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
  'testing': ['testing', 'jest', 'mocha', 'vitest', 'unit test', 'integration test'],
  'agile': ['agile', 'scrum', 'kanban', 'sprint', 'jira'],
  'leadership': ['leadership', 'team lead', 'manager', 'director', 'manager'],
  'communication': ['communication', 'presentation', 'presentation skills', 'writing'],
};

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Calculate semantic similarity between two keyword lists
 * Returns a score 0-100 based on how closely related the keywords are
 */
export function calculateSemanticSimilarity(resumeKeywords: string[], jdKeywords: string[]): number {
  if (resumeKeywords.length === 0 || jdKeywords.length === 0) return 0;

  let matches = 0;
  const processedResume = new Set(resumeKeywords.map(k => normalise(k)));

  for (const jdKeyword of jdKeywords) {
    const normJd = normalise(jdKeyword);
    
    // Direct match
    if (processedResume.has(normJd)) {
      matches++;
      continue;
    }

    // Synonym match
    let foundSynonym = false;
    for (const [_skill, synonyms] of Object.entries(SKILL_SYNONYMS)) {
      const normalizedSynonyms = synonyms.map(s => normalise(s));
      if (normalizedSynonyms.includes(normJd)) {
        for (const resumeKw of processedResume) {
          if (normalizedSynonyms.includes(resumeKw)) {
            matches++;
            foundSynonym = true;
            break;
          }
        }
        if (foundSynonym) break;
      }
    }
  }

  return Math.round((matches / jdKeywords.length) * 100);
}

/**
 * Calculate keyword density score
 * Measures how well-distributed keywords are across the resume
 * Returns 0-100
 */
export function calculateKeywordDensity(resumeText: string, keywords: string[]): number {
  if (!resumeText || keywords.length === 0) return 0;

  const normText = normalise(resumeText);
  const words = normText.split(/\s+/);
  
  if (words.length === 0) return 0;

  // Count keyword occurrences
  let totalKeywordCount = 0;
  for (const keyword of keywords) {
    const count = (normText.match(new RegExp(`\\b${normalise(keyword)}\\b`, 'g')) || []).length;
    totalKeywordCount += count;
  }

  // Ideal density: 3-5% of total words
  const density = (totalKeywordCount / words.length) * 100;
  
  // Score: penalize if too low or too high (spam-like)
  if (density < 1) return 20;
  if (density < 2) return 50;
  if (density < 3) return 75;
  if (density < 5) return 100;
  if (density < 8) return 85;
  return 60; // Too dense = keyword stuffing
}

/**
 * Analyze section-by-section quality and keyword presence
 */
export function analyzeResumeSections(
  resumeData: any,
  jdKeywords: string[] = []
): { heatmap: HeatmapData; completeness: Record<string, number> } {
  const heatmap: HeatmapData = {
    summary: 0,
    experience: 0,
    skills: 0,
    education: 0,
    projects: 0,
    certifications: 0,
    contact: 0,
  };

  const completeness: Record<string, number> = {
    summary: 0,
    experience: 0,
    skills: 0,
    education: 0,
    projects: 0,
    certifications: 0,
    contact: 0,
  };

  // Contact section
  const p = resumeData?.personal ?? {};
  completeness.contact = [p.email, p.phone, p.location].filter(Boolean).length * 33;
  heatmap.contact = completeness.contact;

  // Summary section
  if (resumeData?.summary && resumeData.summary.length > 50) {
    completeness.summary = 100;
    const summaryKeywords = jdKeywords.filter(kw => normalise(resumeData.summary).includes(normalise(kw)));
    heatmap.summary = Math.min(50 + (summaryKeywords.length * 5), 100);
  }

  // Experience section
  if ((resumeData?.experience?.length ?? 0) > 0) {
    completeness.experience = Math.min((resumeData.experience.length / 5) * 100, 100);
    const expText = (resumeData.experience as any[]).map(e => e.description + ' ' + (e.bulletPoints || []).join(' ')).join(' ');
    const expKeywords = jdKeywords.filter(kw => normalise(expText).includes(normalise(kw)));
    heatmap.experience = Math.min(30 + (expKeywords.length * 3), 100);
  }

  // Skills section
  if ((resumeData?.skills?.length ?? 0) > 0) {
    const skillsList = (resumeData.skills || []).flatMap((s: any) => s.items || []);
    completeness.skills = Math.min((skillsList.length / 12) * 100, 100);
    const skillsText = skillsList.join(' ');
    const skillKeywords = jdKeywords.filter(kw => normalise(skillsText).includes(normalise(kw)));
    heatmap.skills = Math.min(40 + (skillKeywords.length * 5), 100);
  }

  // Education section
  if ((resumeData?.education?.length ?? 0) > 0) {
    completeness.education = Math.min((resumeData.education.length / 3) * 100, 100);
    heatmap.education = completeness.education;
  }

  // Projects section
  if ((resumeData?.projects?.length ?? 0) > 0) {
    completeness.projects = Math.min((resumeData.projects.length / 3) * 100, 100);
    const projText = (resumeData.projects as any[]).map(p => p.description + ' ' + (p.technologies || []).join(' ')).join(' ');
    const projKeywords = jdKeywords.filter(kw => normalise(projText).includes(normalise(kw)));
    heatmap.projects = Math.min(30 + (projKeywords.length * 4), 100);
  }

  // Certifications section
  if ((resumeData?.certifications?.length ?? 0) > 0) {
    completeness.certifications = Math.min((resumeData.certifications.length / 4) * 100, 100);
    heatmap.certifications = completeness.certifications;
  }

  return { heatmap, completeness };
}

/**
 * Analyze hard vs soft skills match
 */
export function analyzeSkillsMatch(
  resumeData: any,
  jdKeywords: string[]
): { hardSkills: { matched: string[]; density: number }; softSkills: { matched: string[]; density: number } } {
  const SOFT_SKILLS = new Set([
    'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
    'adaptability', 'time management', 'critical thinking', 'creativity',
    'attention to detail', 'interpersonal', 'negotiation', 'customer service',
    'presentation', 'writing', 'collaboration', 'strategic thinking'
  ]);

  const resumeSkills = (resumeData?.skills ?? []).flatMap((s: any) => (s.items ?? []).map((item: string) => normalise(item)));
  
  const hardSkills: string[] = [];
  const softSkills: string[] = [];

  for (const skill of resumeSkills) {
    const matchedJdKeyword = jdKeywords.find(kw => normalise(kw) === skill);
    if (matchedJdKeyword) {
      if (SOFT_SKILLS.has(skill)) {
        softSkills.push(matchedJdKeyword);
      } else {
        hardSkills.push(matchedJdKeyword);
      }
    }
  }

  return {
    hardSkills: {
      matched: hardSkills,
      density: resumeSkills.length > 0 ? Math.round((hardSkills.length / resumeSkills.length) * 100) : 0
    },
    softSkills: {
      matched: softSkills,
      density: resumeSkills.length > 0 ? Math.round((softSkills.length / resumeSkills.length) * 100) : 0
    }
  };
}

/**
 * Generate advanced ATS metrics
 */
export function calculateAdvancedATSMetrics(
  resumeData: any,
  jobDescription: string = '',
  previousScores?: { overallScore: number; keywordMatch: number; formattingScore: number; readabilityScore: number }
): AdvancedATSMetrics {
  // Import extractKeywords from ats.service (avoid circular dependency)
  const extractKwFunc = (text: string, topN: number) => {
    const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter((w) => w.length > 2);
    const freq: Record<string, number> = {};
    for (const token of tokens) {
      freq[token] = (freq[token] ?? 0) + 1;
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word]) => word);
  };
  
  // Extract text and keywords
  const resumeText = resumeToText(resumeData);
  
  const jdKeywords = jobDescription ? extractKwFunc(jobDescription, 40) : [];
  const resumeKeywords = extractKwFunc(resumeText, 30);

  // Calculate key metrics
  const keywordDensity = calculateKeywordDensity(resumeText, jdKeywords);
  const semanticSimilarity = jdKeywords.length > 0 ? calculateSemanticSimilarity(resumeKeywords, jdKeywords) : 0;
  
  const { heatmap, completeness } = analyzeResumeSections(resumeData, jdKeywords);
  const skillsAnalysis = analyzeSkillsMatch(resumeData, jdKeywords);

  // Calculate aggregate scores
  const readabilityScore = previousScores?.readabilityScore ?? 75;
  const formattingScore = previousScores?.formattingScore ?? 80;
  const keywordMatchScore = previousScores?.keywordMatch ?? 60;

  const recruiterLikelihoodScore = Math.round(
    (keywordMatchScore * 0.35) +
    (formattingScore * 0.25) +
    (readabilityScore * 0.20) +
    (Object.values(completeness).reduce((a, b) => a + b) / 7 * 0.20)
  );

  const atsCompatibilityScore = Math.round(
    (keywordDensity * 0.30) +
    (semanticSimilarity * 0.30) +
    (formattingScore * 0.20) +
    (readabilityScore * 0.20)
  );

  // Generate recommendations
  const recommendations = generateAdvancedRecommendations(
    resumeData,
    jdKeywords,
    heatmap,
    recruiterLikelihoodScore,
    atsCompatibilityScore
  );

  return {
    keywordDensity,
    semanticSimilarity,
    sectionCompleteness: completeness,
    readabilityScore,
    formattingScore,
    hardSkillsMatch: skillsAnalysis.hardSkills,
    softSkillsMatch: skillsAnalysis.softSkills,
    recruiterLikelihoodScore,
    atsCompatibilityScore,
    heatmap,
    recommendations,
  };
}

/**
 * Extract text content from a resume data object
 */
function resumeToText(data: any): string {
  const parts: string[] = [];
  if (data?.personal) {
    const p = data.personal;
    if (p.firstName) parts.push(p.firstName);
    if (p.lastName) parts.push(p.lastName);
  }
  if (data?.summary) parts.push(data.summary);
  (data?.experience ?? []).forEach((e: any) => {
    if (e.jobTitle) parts.push(e.jobTitle);
    if (e.company) parts.push(e.company);
    if (e.description) parts.push(e.description);
    (e.bulletPoints ?? []).forEach((b: any) => parts.push(b));
  });
  (data?.skills ?? []).forEach((s: any) => {
    if (s.category) parts.push(s.category);
    (s.items ?? []).forEach((item: string) => parts.push(item));
  });
  (data?.projects ?? []).forEach((p: any) => {
    if (p.name) parts.push(p.name);
    if (p.description) parts.push(p.description);
    (p.technologies ?? []).forEach((t: any) => parts.push(t));
  });
  return parts.join(' ');
}

export { resumeToText };

/**
 * Re-export extractKeywords for use in ats.ts routes that import from advanced-ats.service
 */
export function extractKeywords(text: string, topN: number = 30): string[] {
  const STOP_WORDS = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who',
    'did', 'she', 'use', 'each', 'from', 'they', 'this', 'that', 'with',
    'have', 'will', 'your', 'been', 'more', 'when', 'also', 'into', 'than',
    'then', 'some', 'what', 'time', 'very', 'just', 'over', 'such', 'make',
    'like', 'well', 'back', 'come', 'work', 'only', 'both', 'life', 'tell',
    'here', 'give', 'most', 'know', 'take', 'good', 'much', 'even', 'want',
    'look', 'many', 'need', 'same', 'does', 'said', 'which', 'their', 'there',
    'would', 'other', 'about', 'these', 'those', 'could', 'after', 'first',
    'never', 'where', 'while', 'should', 'being', 'every', 'under', 'might',
    'since', 'until', 'still', 'three', 'years', 'using', 'based', 'able',
    'must', 'used', 'help', 'high', 'role',
  ]);
  const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
    .split(' ').filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const freq: Record<string, number> = {};
  for (const token of tokens) {
    freq[token] = (freq[token] ?? 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

/**
 * Generate advanced recommendations based on analysis
 */
function generateAdvancedRecommendations(
  resumeData: any,
  jdKeywords: string[],
  heatmap: HeatmapData,
  recruiterScore: number,
  atsScore: number
): RecommendationItem[] {
  const recommendations: RecommendationItem[] = [];

  // Critical: Missing sections with high JD keywords
  if (heatmap.skills < 40 && jdKeywords.length > 0) {
    recommendations.push({
      category: 'critical',
      section: 'skills',
      suggestion: 'Your Skills section has low keyword match. Add the top missing skills from the job description.',
      impact: 'Skills sections are directly parsed by ATS systems',
      estimatedScoreIncrease: 15,
    });
  }

  if (heatmap.experience < 30) {
    recommendations.push({
      category: 'critical',
      section: 'experience',
      suggestion: 'Add relevant job description keywords to your experience bullet points.',
      impact: 'Experience is weighted most heavily in ATS scoring',
      estimatedScoreIncrease: 20,
    });
  }

  // High priority
  if (atsScore < 60) {
    recommendations.push({
      category: 'high',
      section: 'formatting',
      suggestion: 'Improve resume formatting and structure for better ATS parsing.',
      impact: 'Poor formatting can cause ATS parsing failures',
      estimatedScoreIncrease: 12,
    });
  }

  if (recruiterScore < 50) {
    recommendations.push({
      category: 'high',
      section: 'summary',
      suggestion: 'Strengthen your professional summary with relevant keywords and achievements.',
      impact: 'Recruiters spend 6 seconds on first resume review',
      estimatedScoreIncrease: 10,
    });
  }

  // Medium priority
  if (heatmap.certifications < 30 && (resumeData?.certifications?.length ?? 0) === 0) {
    recommendations.push({
      category: 'medium',
      section: 'certifications',
      suggestion: 'Add relevant professional certifications if you have any.',
      impact: 'Certifications differentiate you from other candidates',
      estimatedScoreIncrease: 5,
    });
  }

  if (heatmap.projects < 30 && jdKeywords.some(kw => ['project', 'portfolio'].includes(normalise(kw)))) {
    recommendations.push({
      category: 'medium',
      section: 'projects',
      suggestion: 'Add your key projects that showcase relevant technical skills.',
      impact: 'Projects demonstrate practical experience',
      estimatedScoreIncrease: 8,
    });
  }

  return recommendations.sort((a, b) => {
    const priorityMap = { critical: 3, high: 2, medium: 1, low: 0 };
    return priorityMap[b.category] - priorityMap[a.category];
  });
}
