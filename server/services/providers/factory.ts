/**
 * AI Provider Factory
 * Manages provider selection, fallback, retries, and health checks
 */

import { GroqProvider } from './groq.provider';
import { GeminiProvider } from './gemini.provider';
import { AIProvider, AIProviderConfig } from './provider.interface';
import { getAIConfig, validateAIConfig, GROQ_MODELS, GEMINI_MODELS } from './ai.config';

export class AIProviderFactory {
  private primaryProvider: AIProvider | null = null;
  private fallbackProvider: AIProvider | null = null;
  private config = getAIConfig();
  private requestCount = 0;
  private failureCount = 0;

  constructor() {
    validateAIConfig(this.config);
    this.initializeProviders();
  }

  private initializeProviders(): void {
    console.log(`🚀 [AIProviderFactory] Initializing with primary provider: ${this.config.provider}`);

    // Initialize primary provider
    if (this.config.provider === 'groq' && this.config.groq?.apiKey) {
      this.primaryProvider = new GroqProvider({
        apiKey: this.config.groq.apiKey,
        model: this.config.groq.model,
        timeout: this.config.groq.timeout,
      });
    } else if (this.config.provider === 'gemini' && this.config.gemini?.apiKey) {
      this.primaryProvider = new GeminiProvider({
        apiKey: this.config.gemini.apiKey,
        model: this.config.gemini.model,
        timeout: this.config.gemini.timeout,
      });
    }

    // Initialize fallback provider
    if (this.config.fallbackEnabled && this.config.fallbackProvider) {
      if (this.config.fallbackProvider === 'groq' && this.config.groq?.apiKey) {
        this.fallbackProvider = new GroqProvider({
          apiKey: this.config.groq.apiKey,
          model: this.config.groq.model,
          timeout: this.config.groq.timeout,
        });
        console.log('✓ Groq fallback provider initialized');
      } else if (this.config.fallbackProvider === 'gemini' && this.config.gemini?.apiKey) {
        this.fallbackProvider = new GeminiProvider({
          apiKey: this.config.gemini.apiKey,
          model: this.config.gemini.model,
          timeout: this.config.gemini.timeout,
        });
        console.log('✓ Gemini fallback provider initialized');
      }
    }

    if (!this.primaryProvider) {
      throw new Error(`❌ No AI provider configured. Set AI_PROVIDER and required API keys.`);
    }
  }

  /**
   * Get the appropriate provider based on task type
   */
  getPrimaryProvider(): AIProvider {
    if (!this.primaryProvider) {
      throw new Error('Primary AI provider not initialized');
    }
    return this.primaryProvider;
  }

  /**
   * Get fallback provider if available
   */
  getFallbackProvider(): AIProvider | null {
    return this.fallbackProvider;
  }

  /**
   * Generate text with retry and fallback logic
   */
  async generateText(prompt: string, retryCount = 0): Promise<any> {
    try {
      this.requestCount++;
      const provider = this.getPrimaryProvider();

      console.log(`📤 [AIFactory] Request #${this.requestCount} to ${provider.name}`);

      const response = await provider.generateText(prompt);
      this.failureCount = 0; // Reset failure counter on success
      return response;
    } catch (error: any) {
      this.failureCount++;
      console.error(`❌ [AIFactory] Primary provider failed (attempt ${retryCount + 1}):`, error.message);

      // Retry with primary provider
      if (retryCount < this.config.maxRetries) {
        console.log(`⏳ Retrying in ${this.config.retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));
        return this.generateText(prompt, retryCount + 1);
      }

      // Fallback to secondary provider
      if (this.fallbackProvider) {
        console.log(`🔄 [AIFactory] Falling back to ${this.fallbackProvider.name}`);
        try {
          return await this.fallbackProvider.generateText(prompt);
        } catch (fallbackError: any) {
          console.error(`❌ [AIFactory] Fallback provider also failed:`, fallbackError.message);
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  /**
   * Generate JSON with retry and fallback logic
   */
  async generateJSON<T = any>(prompt: string, retryCount = 0): Promise<any> {
    try {
      this.requestCount++;
      const provider = this.getPrimaryProvider();

      console.log(`📤 [AIFactory] JSON Request #${this.requestCount} to ${provider.name}`);

      const response = await provider.generateJSON<T>(prompt);
      this.failureCount = 0; // Reset failure counter on success
      return response;
    } catch (error: any) {
      this.failureCount++;
      console.error(`❌ [AIFactory] JSON generation failed (attempt ${retryCount + 1}):`, error.message);

      // Retry with primary provider
      if (retryCount < this.config.maxRetries) {
        console.log(`⏳ Retrying in ${this.config.retryDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));
        return this.generateJSON<T>(prompt, retryCount + 1);
      }

      // Fallback to secondary provider
      if (this.fallbackProvider) {
        console.log(`🔄 [AIFactory] JSON Falling back to ${this.fallbackProvider.name}`);
        try {
          return await this.fallbackProvider.generateJSON<T>(prompt);
        } catch (fallbackError: any) {
          console.error(`❌ [AIFactory] Fallback JSON generation also failed:`, fallbackError.message);
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  /**
   * Generate text with image support
   */
  async generateWithImage(prompt: string, imageBuffer: Buffer, mimeType: string, retryCount = 0): Promise<any> {
    try {
      this.requestCount++;
      const provider = this.getPrimaryProvider();

      if (!provider.generateWithImage) {
        throw new Error(`${provider.name} does not support image generation`);
      }

      console.log(`📤 [AIFactory] Image Request #${this.requestCount} to ${provider.name}`);

      const response = await provider.generateWithImage(prompt, imageBuffer, mimeType);
      this.failureCount = 0;
      return response;
    } catch (error: any) {
      this.failureCount++;
      console.error(`❌ [AIFactory] Image generation failed:`, error.message);

      // Retry logic
      if (retryCount < this.config.maxRetries) {
        console.log(`⏳ Retrying image generation...`);
        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));
        return this.generateWithImage(prompt, imageBuffer, mimeType, retryCount + 1);
      }

      // Fallback
      if (this.fallbackProvider && this.fallbackProvider.generateWithImage) {
        console.log(`🔄 [AIFactory] Image Falling back to ${this.fallbackProvider.name}`);
        try {
          return await this.fallbackProvider.generateWithImage(prompt, imageBuffer, mimeType);
        } catch (fallbackError: any) {
          console.error(`❌ [AIFactory] Fallback image generation failed:`, fallbackError.message);
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  /**
   * Health check - verify providers are working
   */
  async healthCheck(): Promise<{ primary: boolean; fallback: boolean }> {
    const primaryHealth = this.primaryProvider ? await this.primaryProvider.isAvailable() : false;
    const fallbackHealth = this.fallbackProvider ? await this.fallbackProvider.isAvailable() : false;

    console.log(`🏥 [AIFactory] Health - Primary: ${primaryHealth ? '✓' : '✗'}, Fallback: ${fallbackHealth ? '✓' : '✗'}`);

    return { primary: primaryHealth, fallback: fallbackHealth };
  }

  /**
   * Get current provider statistics
   */
  getStats(): {
    requestCount: number;
    failureCount: number;
    successRate: number;
    provider: string;
  } {
    const successRate = this.requestCount > 0 ? ((this.requestCount - this.failureCount) / this.requestCount) * 100 : 100;

    return {
      requestCount: this.requestCount,
      failureCount: this.failureCount,
      successRate: Math.round(successRate),
      provider: this.primaryProvider?.name || 'unknown',
    };
  }

  /**
   * Switch to a different model for a specific task type
   * Allows using faster models for quick tasks
   */
  selectModel(taskType: 'large' | 'medium' | 'fast'): string {
    const provider = this.primaryProvider?.name || 'groq';

    if (provider === 'groq') {
      if (taskType === 'large') return GROQ_MODELS.LARGE;
      if (taskType === 'medium') return GROQ_MODELS.MEDIUM;
      if (taskType === 'fast') return GROQ_MODELS.FAST;
    } else if (provider === 'gemini') {
      if (taskType === 'large') return GEMINI_MODELS.PRO;
      if (taskType === 'medium') return GEMINI_MODELS.FLASH;
      if (taskType === 'fast') return GEMINI_MODELS.FLASH;
    }

    return 'default';
  }
}

// Singleton instance
let factoryInstance: AIProviderFactory | null = null;

export function getProviderFactory(): AIProviderFactory {
  if (!factoryInstance) {
    factoryInstance = new AIProviderFactory();
  }
  return factoryInstance;
}

export function resetProviderFactory(): void {
  factoryInstance = null;
}
