/**
 * AI Configuration
 * Manages provider selection, models, and settings
 */

export interface AIConfig {
  provider: 'groq' | 'gemini';
  groq?: {
    apiKey: string;
    model: string;
    timeout: number;
  };
  gemini?: {
    apiKey: string;
    model: string;
    timeout: number;
  };
  fallbackEnabled: boolean;
  fallbackProvider?: 'groq' | 'gemini';
  maxRetries: number;
  retryDelay: number;
}

/**
 * Get AI configuration from environment variables
 */
export function getAIConfig(): AIConfig {
  const provider = (process.env.AI_PROVIDER || 'groq') as 'groq' | 'gemini';
  
  return {
    provider,
    groq: {
      apiKey: process.env.GROQ_API_KEY || '',
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      timeout: parseInt(process.env.GROQ_TIMEOUT || '30000'),
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      timeout: parseInt(process.env.GEMINI_TIMEOUT || '30000'),
    },
    fallbackEnabled: process.env.AI_FALLBACK_ENABLED !== 'false',
    fallbackProvider: (process.env.AI_FALLBACK_PROVIDER || 'gemini') as 'groq' | 'gemini',
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '2'),
    retryDelay: parseInt(process.env.AI_RETRY_DELAY || '1000'),
  };
}

/**
 * Validate that required API keys are set
 */
export function validateAIConfig(config: AIConfig): boolean {
  if (config.provider === 'groq' && !config.groq?.apiKey) {
    console.error('❌ GROQ_API_KEY is not set');
    return false;
  }
  
  if (config.provider === 'gemini' && !config.gemini?.apiKey) {
    console.error('❌ GEMINI_API_KEY is not set');
    return false;
  }
  
  if (config.fallbackEnabled && config.fallbackProvider === 'groq' && !config.groq?.apiKey) {
    console.warn('⚠️ GROQ_API_KEY is not set (fallback)');
    config.fallbackEnabled = false;
  }
  
  if (config.fallbackEnabled && config.fallbackProvider === 'gemini' && !config.gemini?.apiKey) {
    console.warn('⚠️ GEMINI_API_KEY is not set (fallback)');
    config.fallbackEnabled = false;
  }
  
  return true;
}

/**
 * Model selection helpers
 */
export const GROQ_MODELS = {
  LARGE: 'llama-3.3-70b-versatile', // For complex tasks (cover letters, detailed analysis)
  MEDIUM: 'llama-3.1-70b-versatile', // For moderate tasks
  FAST: 'llama-3.1-8b-instant', // For quick tasks (skill suggestions, quick rewrites)
};

export const GEMINI_MODELS = {
  FLASH: 'gemini-3.5-flash', // Fast, general purpose
  PRO: 'gemini-pro', // More capable but slower
  VISION: 'gemini-pro-vision', // For image analysis
};
