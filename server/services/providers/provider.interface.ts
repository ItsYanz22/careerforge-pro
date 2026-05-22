/**
 * AIProvider Interface
 * Defines the contract for all AI providers (Groq, Gemini, etc.)
 */
export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface TextGenerationResponse {
  text: string;
  provider: 'groq' | 'gemini';
  tokensUsed?: number;
}

export interface JSONGenerationResponse<T = any> {
  data: T;
  provider: 'groq' | 'gemini';
  tokensUsed?: number;
}

export interface AIProvider {
  name: 'groq' | 'gemini';
  isAvailable(): Promise<boolean>;
  generateText(prompt: string): Promise<TextGenerationResponse>;
  generateJSON<T = any>(prompt: string): Promise<JSONGenerationResponse<T>>;
  generateWithImage?(prompt: string, imageBuffer: Buffer, mimeType: string): Promise<TextGenerationResponse>;
}

export interface ProviderResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  provider?: 'groq' | 'gemini';
}
