/**
 * Real ATS Scoring Engine
 * Deterministic: same resume + same JD = same score every time.
 * No Math.random(), no hardcoded percentages.
 */

export interface ATSScoreResult {
  overallScore: number;
  keywordMatch: number;
  formattingScore: number;
  readabilityScore: number;
  completenessScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  hardSkills: string[];
  softSkills: string[];
  recruiterLikelihood: number;
  suggestions: Array<{ priority: 'high' | 'medium' | 'low'; suggestion: string; impact: string }>;
  issues: Array<{ type: 'critical' | 'warning' | 'info'; message: string; field?: string }>;
}

const COMMON_SOFT_SKILLS = new Set([
  'communication', 'leadership', 'teamwork', 'collaboration', 'problem solving',
  'adaptability', 'time management', 'critical thinking', 'creativity', 'work ethic',
  'attention to detail', 'interpersonal', 'conflict resolution', 'empathy', 'organization'
]);

// ── Text utilities ────────────────────────────────────────────────────────────

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenise(text: string): string[] {
  return normalise(text).split(' ').filter((w) => w.length > 2);
}

// Common English stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
  'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who',
  'boy', 'did', 'she', 'use', 'her', 'each', 'from', 'they', 'this',
  'that', 'with', 'have', 'will', 'your', 'been', 'more', 'when', 'also',
  'into', 'than', 'then', 'some', 'what', 'time', 'very', 'just', 'over',
  'such', 'make', 'like', 'well', 'back', 'come', 'work', 'only', 'both',
  'life', 'tell', 'here', 'give', 'most', 'know', 'take', 'good', 'much',
  'even', 'want', 'look', 'many', 'need', 'same', 'does', 'said', 'each',
  'which', 'their', 'there', 'would', 'other', 'about', 'these', 'those',
  'could', 'after', 'first', 'never', 'where', 'while', 'should', 'being',
  'every', 'under', 'might', 'since', 'until', 'still', 'three', 'years',
  'using', 'based', 'able', 'must', 'used', 'help', 'high', 'role',
]);

/**
 * Extract meaningful keywords from text using TF-IDF-inspired frequency analysis.
 * Returns keywords sorted by frequency descending.
 */
export function extractKeywords(text: string, topN = 30): string[] {
  const tokens = tokenise(text).filter((w) => !STOP_WORDS.has(w));
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
 * Extract all text content from a resume data object.
 */
function resumeToText(data: any): string {
  const parts: string[] = [];

  if (data?.personal) {
    const p = data.personal;
    if (p.firstName) parts.push(p.firstName);
    if (p.lastName) parts.push(p.lastName);
    if (p.location) parts.push(p.location);
  }

  if (data?.summary) parts.push(data.summary);

  for (const exp of data?.experience ?? []) {
    if (exp.jobTitle) parts.push(exp.jobTitle);
    if (exp.company) parts.push(exp.company);
    if (exp.description) parts.push(exp.description);
    for (const bullet of exp.bulletPoints ?? []) parts.push(bullet);
  }

  for (const edu of data?.education ?? []) {
    if (edu.degree) parts.push(edu.degree);
    if (edu.field) parts.push(edu.field);
    if (edu.school) parts.push(edu.school);
  }

  for (const skillObj of data?.skills ?? []) {
    if (skillObj.category) parts.push(skillObj.category);
    for (const item of skillObj.items ?? []) parts.push(item);
  }

  for (const proj of data?.projects ?? []) {
    if (proj.title) parts.push(proj.title);
    if (proj.description) parts.push(proj.description);
    for (const tech of proj.technologies ?? []) parts.push(tech);
  }

  for (const cert of data?.certifications ?? []) {
    if (cert.name) parts.push(cert.name);
    if (cert.issuer) parts.push(cert.issuer);
  }

  for (const vol of data?.volunteerExperience ?? []) {
    if (vol.organization) parts.push(vol.organization);
    if (vol.role) parts.push(vol.role);
    if (vol.description) parts.push(vol.description);
  }

  return parts.join(' ');
}

/**
 * Compare resume keywords against JD keywords.
 * Returns matched and missing keyword lists.
 */
export function compareResumeToJD(
  resumeData: any,
  jobDescription: string
): { matched: string[]; missing: string[]; matchRatio: number } {
  const resumeText = normalise(resumeToText(resumeData));
  const jdKeywords = extractKeywords(jobDescription, 40);

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of jdKeywords) {
    // Check for exact word or as part of a phrase
    if (resumeText.includes(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const matchRatio = jdKeywords.length > 0 ? matched.length / jdKeywords.length : 0;
  return { matched, missing, matchRatio };
}

/**
 * Calculate formatting score based on resume structure quality.
 * Deterministic — based on presence and quality of sections.
 */
function calculateFormattingScore(data: any): number {
  let score = 100;

  // Deduct for missing contact info
  const p = data?.personal ?? {};
  if (!p.email) score -= 15;
  if (!p.phone) score -= 10;
  if (!p.location) score -= 5;
  if (!p.linkedIn && !p.portfolio && !p.github) score -= 5;

  // Deduct for very short bullet points (< 20 chars)
  for (const exp of data?.experience ?? []) {
    for (const bullet of exp.bulletPoints ?? []) {
      if (typeof bullet === 'string' && bullet.length < 20) score -= 3;
    }
  }

  // Deduct for missing dates
  for (const exp of data?.experience ?? []) {
    if (!exp.startDate) score -= 5;
  }

  return Math.max(score, 0);
}

/**
 * Calculate readability score based on text complexity.
 * Uses average sentence length and word length as proxies.
 */
export function calculateReadability(data: any): number {
  const text = resumeToText(data);
  if (!text.trim()) return 0;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  if (sentences.length === 0 || words.length === 0) return 50;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;

  // Ideal: 15-20 words/sentence, 4-6 chars/word
  let score = 100;

  if (avgWordsPerSentence > 25) score -= 20;
  else if (avgWordsPerSentence > 20) score -= 10;
  else if (avgWordsPerSentence < 8) score -= 10;

  if (avgWordLength > 8) score -= 15;
  else if (avgWordLength > 6) score -= 5;

  // Bonus for action verbs in bullet points
  const actionVerbs = ['achieved', 'built', 'created', 'delivered', 'developed', 'drove',
    'engineered', 'established', 'executed', 'generated', 'implemented', 'improved',
    'increased', 'launched', 'led', 'managed', 'optimised', 'optimized', 'reduced',
    'scaled', 'shipped', 'spearheaded', 'streamlined'];
  const lowerText = text.toLowerCase();
  const verbCount = actionVerbs.filter((v) => lowerText.includes(v)).length;
  score += Math.min(verbCount * 2, 15);

  return Math.min(Math.max(Math.round(score), 0), 100);
}

/**
 * Calculate section completeness score.
 */
function calculateCompleteness(data: any): number {
  let score = 0;
  const weights = {
    personal: 20,
    summary: 15,
    experience: 30,
    education: 20,
    skills: 10,
    extras: 5,
  };

  const p = data?.personal ?? {};
  const personalFields = [p.firstName, p.lastName, p.email, p.phone, p.location];
  const personalFilled = personalFields.filter(Boolean).length;
  score += Math.round((personalFilled / personalFields.length) * weights.personal);

  if (data?.summary && data.summary.length > 30) score += weights.summary;
  else if (data?.summary) score += Math.round(weights.summary * 0.5);

  if (data?.experience?.length >= 2) score += weights.experience;
  else if (data?.experience?.length === 1) score += Math.round(weights.experience * 0.6);

  if (data?.education?.length >= 1) score += weights.education;

  if (data?.skills?.length >= 3) score += weights.skills;
  else if (data?.skills?.length > 0) score += Math.round(weights.skills * 0.5);

  const hasExtras =
    (data?.certifications?.length > 0) ||
    (data?.projects?.length > 0) ||
    (data?.languages?.length > 0);
  if (hasExtras) score += weights.extras;

  return Math.min(score, 100);
}

/**
 * Generate actionable suggestions based on analysis results.
 */
function generateSuggestions(
  data: any,
  missing: string[],
  formattingScore: number,
  completenessScore: number
): ATSScoreResult['suggestions'] {
  const suggestions: ATSScoreResult['suggestions'] = [];

  if (missing.length > 0) {
    suggestions.push({
      priority: 'high',
      suggestion: `Add these missing keywords to your resume: ${missing.slice(0, 5).join(', ')}`,
      impact: 'Directly improves keyword match score',
    });
  }

  if (!data?.summary || data.summary.length < 50) {
    suggestions.push({
      priority: 'high',
      suggestion: 'Add a professional summary of at least 2–3 sentences',
      impact: 'ATS systems weight summaries heavily for relevance scoring',
    });
  }

  const bulletCount = (data?.experience ?? []).reduce(
    (sum: number, exp: any) => sum + (exp.bulletPoints?.length ?? 0), 0
  );
  if (bulletCount < 6) {
    suggestions.push({
      priority: 'high',
      suggestion: 'Add more bullet points to your experience (aim for 3–5 per role)',
      impact: 'More content increases keyword density and ATS match probability',
    });
  }

  if (!data?.personal?.linkedIn) {
    suggestions.push({
      priority: 'medium',
      suggestion: 'Add your LinkedIn URL to the contact section',
      impact: 'Many ATS systems and recruiters verify LinkedIn profiles',
    });
  }

  if ((data?.skills?.length ?? 0) < 8) {
    suggestions.push({
      priority: 'medium',
      suggestion: 'Expand your skills section to at least 8–12 relevant skills',
      impact: 'Skills sections are parsed directly by ATS keyword scanners',
    });
  }

  if (formattingScore < 70) {
    suggestions.push({
      priority: 'medium',
      suggestion: 'Improve formatting: ensure all experience entries have dates and descriptions',
      impact: 'Incomplete entries reduce ATS parsing accuracy',
    });
  }

  if (completenessScore < 60) {
    suggestions.push({
      priority: 'medium',
      suggestion: 'Complete all resume sections for a higher completeness score',
      impact: 'A complete resume scores higher across all ATS dimensions',
    });
  }

  if ((data?.certifications?.length ?? 0) === 0 && (data?.projects?.length ?? 0) === 0) {
    suggestions.push({
      priority: 'low',
      suggestion: 'Add relevant certifications or projects to showcase your expertise',
      impact: 'Certifications and projects can differentiate you from other candidates',
    });
  }

  if ((data?.languages?.length ?? 0) === 0) {
    suggestions.push({
      priority: 'low',
      suggestion: 'Add languages you are proficient in',
      impact: 'Bilingual candidates are often preferred in global roles',
    });
  }


  return suggestions;
}

/**
 * Generate issues list from analysis.
 */
function generateIssues(data: any): ATSScoreResult['issues'] {
  const issues: ATSScoreResult['issues'] = [];
  const p = data?.personal ?? {};

  if (!p.email) issues.push({ type: 'critical', message: 'Missing email address', field: 'personal.email' });
  if (!p.phone) issues.push({ type: 'warning', message: 'Missing phone number', field: 'personal.phone' });
  if (!p.location) issues.push({ type: 'warning', message: 'Missing location', field: 'personal.location' });
  if (!data?.summary) issues.push({ type: 'warning', message: 'No professional summary found', field: 'summary' });
  if ((data?.experience?.length ?? 0) === 0) issues.push({ type: 'critical', message: 'No work experience listed', field: 'experience' });
  if ((data?.skills?.length ?? 0) === 0) issues.push({ type: 'warning', message: 'No skills listed', field: 'skills' });
  if ((data?.education?.length ?? 0) === 0) issues.push({ type: 'info', message: 'No education listed', field: 'education' });
  if ((data?.volunteerExperience?.length ?? 0) === 0) issues.push({ type: 'info', message: 'No volunteer experience listed', field: 'volunteerExperience' });

  for (const exp of data?.experience ?? []) {
    if (!exp.startDate) {
      issues.push({ type: 'warning', message: `Missing start date for role: ${exp.jobTitle ?? 'Unknown'}`, field: 'experience' });
    }
    if ((exp.bulletPoints?.length ?? 0) === 0) {
      issues.push({ type: 'warning', message: `No bullet points for role: ${exp.jobTitle ?? 'Unknown'}`, field: 'experience' });
    }
  }

  return issues;
}

/**
 * Main ATS scoring function.
 * Fully deterministic — no randomness.
 */
export function calculateATSScore(
  resumeData: any,
  jobDescription?: string
): ATSScoreResult {
  const formattingScore = calculateFormattingScore(resumeData);
  const readabilityScore = calculateReadability(resumeData);
  const completenessScore = calculateCompleteness(resumeData);

  let keywordMatch = 0;
  let matchedKeywords: string[] = [];
  let missingKeywords: string[] = [];

  if (jobDescription && jobDescription.trim().length > 20) {
    const comparison = compareResumeToJD(resumeData, jobDescription);
    keywordMatch = Math.round(comparison.matchRatio * 100);
    matchedKeywords = comparison.matched;
    missingKeywords = comparison.missing;
  } else {
    // No JD provided — score based on resume keyword richness
    const resumeKeywords = extractKeywords(resumeToText(resumeData), 20);
    keywordMatch = Math.min(resumeKeywords.length * 4, 80); // max 80 without JD
    matchedKeywords = resumeKeywords;
  }

  // Weighted overall score
  const overallScore = Math.round(
    keywordMatch * 0.35 +
    formattingScore * 0.25 +
    readabilityScore * 0.20 +
    completenessScore * 0.20
  );

  const suggestions = generateSuggestions(resumeData, missingKeywords, formattingScore, completenessScore);
  const issues = generateIssues(resumeData);

  // Categorize matched keywords
  const hardSkills: string[] = [];
  const softSkills: string[] = [];
  for (const kw of matchedKeywords) {
    if (COMMON_SOFT_SKILLS.has(kw)) softSkills.push(kw);
    else hardSkills.push(kw);
  }

  // Recruiter Likelihood: basic weighted combination
  const recruiterLikelihood = Math.round(
    overallScore * 0.6 + completenessScore * 0.2 + readabilityScore * 0.2
  );

  return {
    overallScore: Math.min(overallScore, 100),
    keywordMatch,
    formattingScore,
    readabilityScore,
    completenessScore,
    matchedKeywords,
    missingKeywords,
    hardSkills,
    softSkills,
    recruiterLikelihood: Math.min(recruiterLikelihood, 100),
    suggestions,
    issues,
  };
}

/**
 * Text-only ATS scoring function for raw uploaded files (PDFs).
 * Since we don't have structured data, we evaluate keyword match and readability,
 * and provide a normalized score.
 */
export function calculateATSScoreFromText(
  resumeText: string,
  jobDescription: string
): ATSScoreResult {
  const normText = normalise(resumeText);
  let keywordMatch = 0;
  let matchedKeywords: string[] = [];
  let missingKeywords: string[] = [];

  if (jobDescription && jobDescription.trim().length > 20) {
    const jdKeywords = extractKeywords(jobDescription, 40);
    const matched = [];
    const missing = [];
    for (const kw of jdKeywords) {
      if (normText.includes(kw)) matched.push(kw);
      else missing.push(kw);
    }
    keywordMatch = jdKeywords.length > 0 ? Math.round((matched.length / jdKeywords.length) * 100) : 0;
    matchedKeywords = matched;
    missingKeywords = missing;
  }

  // Calculate readability on raw text
  let readabilityScore = 50;
  if (normText.trim()) {
    const sentences = resumeText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = resumeText.split(/\s+/).filter((w) => w.length > 0);
    if (sentences.length > 0 && words.length > 0) {
      const avgWordsPerSentence = words.length / sentences.length;
      let rScore = 100;
      if (avgWordsPerSentence > 25) rScore -= 20;
      else if (avgWordsPerSentence > 20) rScore -= 10;
      else if (avgWordsPerSentence < 8) rScore -= 10;

      const actionVerbs = ['achieved', 'built', 'created', 'delivered', 'developed', 'drove', 'executed', 'implemented', 'improved', 'increased', 'led', 'managed', 'optimized', 'reduced'];
      const verbCount = actionVerbs.filter((v) => normText.includes(v)).length;
      rScore += Math.min(verbCount * 2, 15);
      readabilityScore = Math.min(Math.max(Math.round(rScore), 0), 100);
    }
  }

  // Without structure, completeness and formatting are assumed to be average or based on length
  const formattingScore = resumeText.length > 500 ? 80 : 50;
  const completenessScore = resumeText.length > 1000 ? 85 : 60;

  const overallScore = Math.round(
    keywordMatch * 0.50 +
    readabilityScore * 0.30 +
    formattingScore * 0.10 +
    completenessScore * 0.10
  );

  const suggestions: ATSScoreResult['suggestions'] = [];
  if (missingKeywords.length > 0) {
    suggestions.push({
      priority: 'high',
      suggestion: `Add these missing keywords to your resume: ${missingKeywords.slice(0, 5).join(', ')}`,
      impact: 'Directly improves keyword match score',
    });
  }
  suggestions.push({
    priority: 'low',
    suggestion: 'Since this is a raw file upload, formatting & completeness scores are estimated. For full accuracy, create a resume using our builder.',
    impact: 'Full resume data provides deeper insights.',
  });

  const hardSkills: string[] = [];
  const softSkills: string[] = [];
  for (const kw of matchedKeywords) {
    if (COMMON_SOFT_SKILLS.has(kw)) softSkills.push(kw);
    else hardSkills.push(kw);
  }

  const recruiterLikelihood = Math.round(overallScore * 0.7 + readabilityScore * 0.3);

  return {
    overallScore: Math.min(overallScore, 100),
    keywordMatch,
    formattingScore,
    readabilityScore,
    completenessScore,
    matchedKeywords,
    missingKeywords,
    hardSkills,
    softSkills,
    recruiterLikelihood: Math.min(recruiterLikelihood, 100),
    suggestions,
    issues: [],
  };
}
