/**
 * AI Service - Production AI Inference Layer
 * Primary: Groq (llama-3.3-70b-versatile)
 * Fallback: Gemini
 * All endpoints unchanged — frontend unaware of provider.
 */

import crypto from 'crypto';
import { getProviderFactory } from './providers/factory';

function validateAIOutput(original: string, rewritten: string): boolean {
  const PROFANITY_LIST = ['fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'bastard'];
  const lower = rewritten.toLowerCase();
  if (PROFANITY_LIST.some((w) => lower.includes(w))) return false;
  if (rewritten.length > original.length * 3) return false;
  return true;
}

async function safeRewrite(
  original: string,
  generateFn: (concise: boolean) => Promise<string>,
  userId?: string
): Promise<string> {
  const first = await generateFn(false);
  if (validateAIOutput(original, first)) return first;

  const second = await generateFn(true);
  if (validateAIOutput(original, second)) return second;

  const promptHash = crypto.createHash('sha256').update(original).digest('hex').slice(0, 8);
  console.warn(`[ai-safety] Output failed validation twice. userId=${userId ?? 'unknown'} promptHash=${promptHash}`);
  return original;
}

export const aiService = {
  // ── Generic ──────────────────────────────────────────────────────────────
  generateText: async (prompt: string): Promise<string> => {
    const factory = getProviderFactory();
    const response = await factory.generateText(prompt);
    return response.text;
  },

  // ── Bullet point rewrite ─────────────────────────────────────────────────
  rewriteBulletPoint: async (content: string, targetKeywords: string[] = [], userId?: string) => {
    const generate = async (concise: boolean) => {
      const prompt = `You are an expert resume writer. Rewrite the following resume bullet point to be more professional, action-oriented, and impactful.
${targetKeywords.length > 0 ? `Incorporate these keywords naturally if possible: ${targetKeywords.join(', ')}` : ''}
${concise ? 'IMPORTANT: Keep the rewrite concise — no longer than the original. Do not add padding.' : ''}

Original bullet point: "${content}"

Return a JSON response with this exact structure (no markdown fences, just valid JSON):
{
  "rewritten": "The improved bullet point",
  "improvements": ["Improvement 1", "Improvement 2"],
  "keywordsAdded": ["Keyword1"],
  "quantifiedAchievements": true
}`;
      const factory = getProviderFactory();
      const response = await factory.generateJSON(prompt);
      return response.data.rewritten as string;
    };

    try {
      const rewritten = await safeRewrite(content, generate, userId);
      const prompt = `You are an expert resume writer. Rewrite the following resume bullet point to be more professional, action-oriented, and impactful.
${targetKeywords.length > 0 ? `Incorporate these keywords naturally if possible: ${targetKeywords.join(', ')}` : ''}

Original bullet point: "${content}"

Return a JSON response with this exact structure (no markdown fences, just valid JSON):
{
  "rewritten": "${rewritten.replace(/"/g, '\\"')}",
  "improvements": ["More action-oriented", "Quantified impact"],
  "keywordsAdded": [],
  "quantifiedAchievements": false
}`;
      const factory = getProviderFactory();
      const response = await factory.generateJSON(prompt);
      return response.data;
    } catch (error) {
      console.error('AI Rewrite Error:', error);
      throw new Error('Failed to rewrite bullet point');
    }
  },

  // ── Summary rewrite ──────────────────────────────────────────────────────
  rewriteSummary: async (content: string, targetKeywords: string[] = []) => {
    const prompt = `You are an expert resume writer. Rewrite this professional summary to be concise and impactful.
${targetKeywords.length > 0 ? `Try to naturally include these keywords: ${targetKeywords.join(', ')}` : ''}

Original Summary: "${content}"

Return a JSON response with exactly this structure:
{
  "rewritten": "The new summary"
}`;
    try {
      const factory = getProviderFactory();
      const response = await factory.generateJSON(prompt);
      return response.data;
    } catch (error) {
      console.error('AI Summary Error:', error);
      throw new Error('Failed to rewrite summary');
    }
  },

  // ── Cover letter ─────────────────────────────────────────────────────────
  generateCoverLetter: async (resumeData: any, jobDescription: string, tone = 'professional') => {
    const prompt = `You are an expert career coach. Write a customized cover letter based on the provided resume data and job description.
Tone: ${tone}

Resume Info: ${JSON.stringify(resumeData)}
Job Description: ${jobDescription}

Return a JSON response with exactly this structure:
{
  "coverLetter": "The full text of the cover letter..."
}`;
    try {
      const factory = getProviderFactory();
      const response = await factory.generateJSON(prompt);
      return response.data;
    } catch (error) {
      console.error('Cover Letter Error:', error);
      throw new Error('Failed to generate cover letter');
    }
  },

  // ── JD analysis ──────────────────────────────────────────────────────────
  analyzeJobDescription: async (jobDescription: string) => {
    const prompt = `Analyze this job description and extract key information.
Job Description: "${jobDescription}"

Return a JSON response with exactly this structure:
{
  "keywords": [{"keyword": "React", "category": "skill", "importance": 90}],
  "skills": [{"skill": "TypeScript"}],
  "tools": ["Git", "Docker"],
  "responsibilities": ["Lead frontend development"],
  "requiredQualifications": ["Bachelor's in CS"],
  "niceToHave": ["AWS certification"]
}`;
    try {
      const factory = getProviderFactory();
      const response = await factory.generateJSON(prompt);
      return response.data;
    } catch (error) {
      console.error('JD Analysis Error:', error);
      throw new Error('Failed to analyze job description');
    }
  },

  // ── AI chat ──────────────────────────────────────────────────────────────
  chatWithAI: async (message: string, context?: any) => {
    const prompt = `You are a career mentor assisting a user with their resume.
User's message: "${message}"
Context about what they are editing: ${JSON.stringify(context || {})}

Provide a helpful, concise response. Return a JSON response:
{ "response": "Your advice or answer here" }`;
    try {
      const factory = getProviderFactory();
      const response = await factory.generateJSON(prompt);
      return response.data;
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw new Error('Failed to chat with AI');
    }
  },

  // ── Generate summary from scratch ────────────────────────────────────────
  generateSummaryFromScratch: async (resumeData: any, targetRole?: string) => {
    const experience = (resumeData?.experience ?? [])
      .slice(0, 3)
      .map((e: any) => `${e.jobTitle} at ${e.company}`)
      .join(', ');
    const skills = (resumeData?.skills ?? []).slice(0, 8).join(', ');
    const name = [resumeData?.personal?.firstName, resumeData?.personal?.lastName]
      .filter(Boolean)
      .join(' ');

    const prompt = `You are an expert resume writer. Generate a compelling 2-3 sentence professional summary for a resume.

Candidate name: ${name || 'the candidate'}
${targetRole ? `Target role: ${targetRole}` : ''}
Recent experience: ${experience || 'Not provided'}
Key skills: ${skills || 'Not provided'}

Requirements:
- Start with a strong professional identity statement
- Highlight 2-3 key strengths or achievements
- End with value proposition for the employer
- Keep it under 80 words
- Use active, confident language
- Do NOT use first person (no "I", "my", "me")

Return a JSON response with exactly this structure (no markdown fences):
{
  "summary": "The generated professional summary text"
}`;
    try {
      const factory = getProviderFactory();
      const response = await factory.generateJSON(prompt);
      return response.data;
    } catch (error) {
      console.error('Generate Summary Error:', error);
      throw new Error('Failed to generate summary');
    }
  },

  // ── AI Coach — section analysis ──────────────────────────────────────────
  analyzeResumeSection: async (content: string, type: string) => {
    const prompt = `You are an expert AI Resume Coach. Analyze the following resume ${type} and provide actionable feedback.

Content: "${content}"

Your analysis must cover:
1. Grammar and clarity.
2. Weak word detection (e.g., "helped", "worked on", "did").
3. Action verb suggestions.
4. Measurable impact (are there metrics?).

Return a JSON response with exactly this structure:
{
  "score": 85,
  "grammarIssues": ["issue 1"],
  "weakWords": ["word1", "word2"],
  "suggestedActionVerbs": ["Spearheaded", "Architected"],
  "impactSuggestions": "Specific advice on how to add numbers/metrics here.",
  "overallFeedback": "Recruiter-style feedback in 1-2 sentences."
}`;
    try {
      const factory = getProviderFactory();
      const response = await factory.generateJSON(prompt);
      return response.data;
    } catch (error) {
      console.error('AI Coach Error:', error);
      throw new Error('Failed to analyze resume section');
    }
  },

  // ── Tailor resume ────────────────────────────────────────────────────────
  tailorResume: async (resumeData: any, jobDescription: string) => {
    const prompt = `You are an expert resume optimizer. Analyze the provided resume data and the target job description.
Suggest specific, actionable optimizations to tailor the resume for this job.

Resume: ${JSON.stringify(resumeData)}
Job Description: ${jobDescription}

Return a JSON response with exactly this structure:
{
  "tailoredSummary": "The new summary tailored to the JD",
  "experienceOptimizations": [
    {
      "experienceId": "The ID of the experience entry",
      "originalBullet": "The original bullet point text",
      "optimizedBullet": "The new tailored bullet point",
      "reason": "Why this change helps match the JD"
    }
  ],
  "addedSkills": ["Skill 1", "Skill 2"],
  "overallStrategy": "General advice on tailoring for this specific role."
}`;
    try {
      const factory = getProviderFactory();
      const response = await factory.generateJSON(prompt);
      return response.data;
    } catch (error) {
      console.error('Tailor Resume Error:', error);
      throw new Error('Failed to tailor resume');
    }
  },

  // ── Deep ATS analysis ────────────────────────────────────────────────────
  analyzeResumeATS: async (resumeText: string, jobDescription: string) => {
    const prompt = `You are a world-class Recruitment Specialist and ATS algorithm expert.
Analyze the provided resume text against the job description for a high-fidelity match report.

Resume Text: "${resumeText}"
Job Description: "${jobDescription}"

Return a JSON response with exactly this structure:
{
  "overallScore": 85,
  "keywordMatch": 80,
  "formattingScore": 90,
  "readabilityScore": 85,
  "completenessScore": 95,
  "recruiterLikelihood": 82,
  "foundKeywords": ["keyword1"],
  "missingKeywords": ["keyword2"],
  "hardSkills": ["Java", "Next.js"],
  "softSkills": ["Leadership", "Communication"],
  "suggestions": [
    { "priority": "high", "suggestion": "Add specific metrics to your Java experience", "impact": "Demonstrates quantifiable value" }
  ],
  "overallFeedback": "One-sentence executive summary of the match."
}`;
    try {
      const factory = getProviderFactory();
      const response = await factory.generateJSON(prompt);
      return response.data;
    } catch (error: any) {
      console.error('[aiService/analyzeResumeATS] Error:', error.message);
      throw new Error(`Failed to perform AI ATS analysis: ${error.message}`);
    }
  },

  // ── Certificate extraction ───────────────────────────────────────────────
  extractCertificateData: async (buffer: Buffer, mimetype: string) => {
    const prompt = `You are an expert at extracting structured information from certificate images.
Extract the following details from this certificate:
1. Certification Name
2. Issuing Organization
3. Issue Date (YYYY-MM format if possible)
4. Expiration Date (if applicable)
5. Credential ID (if visible)

Return a JSON response with exactly this structure:
{
  "name": "Cloud Architect",
  "issuer": "Google Cloud",
  "issueDate": "2024-01",
  "expiryDate": "2026-01",
  "credentialId": "CERT-12345"
}`;
    try {
      const factory = getProviderFactory();
      const response = await factory.generateWithImage(prompt, buffer, mimetype);
      let cleanedText = response.text;
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      return JSON.parse(cleanedText.trim());
    } catch (error) {
      console.error('[aiService/extractCertificateData] Error:', error);
      throw new Error('Failed to extract certificate data');
    }
  },

  // ── Skill suggestions ────────────────────────────────────────────────────
  getSkillSuggestions: async (resumeData: any) => {
    const prompt = `You are an expert technical recruiter. Based on the candidate's experience and projects, suggest 10 relevant skills they might have but haven't listed.

Resume Data: ${JSON.stringify({
  experience: resumeData.experience,
  projects: resumeData.projects,
  currentSkills: resumeData.skills,
})}

Return a JSON response with exactly this structure:
{
  "suggestions": [
    { "skill": "Docker", "reason": "Mentioned in project X", "category": "technical" },
    { "skill": "Leadership", "reason": "Led a team of 5 in role Y", "category": "soft" }
  ]
}`;
    try {
      const factory = getProviderFactory();
      const response = await factory.generateJSON(prompt);
      return response.data;
    } catch (error) {
      console.error('[aiService/getSkillSuggestions] Error:', error);
      return { suggestions: [] };
    }
  },

  // ── Health check ─────────────────────────────────────────────────────────
  getHealth: async () => {
    try {
      const factory = getProviderFactory();
      const health = await factory.healthCheck();
      const stats = factory.getStats();
      return { success: health.primary || health.fallback, providers: health, stats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
