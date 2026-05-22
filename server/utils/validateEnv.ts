/**
 * Environment variable validation
 * Called at server startup — fails fast if required vars are missing.
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  MONGODB_URI: z.string({ required_error: 'MONGODB_URI is required' }),
  JWT_SECRET: z.string({ required_error: 'JWT_SECRET is required' }),
  
  // AI Provider Configuration
  AI_PROVIDER: z.enum(['groq', 'gemini']).default('groq'),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional(),
  GROQ_TIMEOUT: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  GEMINI_TIMEOUT: z.string().optional(),
  AI_FALLBACK_ENABLED: z.string().optional(),
  AI_FALLBACK_PROVIDER: z.string().optional(),
  AI_MAX_RETRIES: z.string().optional(),
  AI_RETRY_DELAY: z.string().optional(),
  
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

export function validateEnv(): void {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n[startup] ❌ Environment validation failed:');
    result.error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\n');
    process.exit(1);
  }

  // Additional validation for AI provider keys
  const aiProvider = process.env.AI_PROVIDER || 'groq';
  
  if (aiProvider === 'groq' && !process.env.GROQ_API_KEY) {
    console.error('\n[startup] ❌ GROQ_API_KEY is required when AI_PROVIDER=groq');
    process.exit(1);
  }
  
  if (aiProvider === 'gemini' && !process.env.GEMINI_API_KEY) {
    console.error('\n[startup] ❌ GEMINI_API_KEY is required when AI_PROVIDER=gemini');
    process.exit(1);
  }

  console.log(`[startup] ✓ Environment validation passed (AI Provider: ${aiProvider})`);
}
