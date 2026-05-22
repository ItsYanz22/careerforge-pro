/**
 * Gemini AI Provider (Fallback)
 * Uses Google's Gemini API for fallback support
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIProviderConfig, TextGenerationResponse, JSONGenerationResponse } from './provider.interface';

export class GeminiProvider implements AIProvider {
  name: 'gemini' = 'gemini';
  private client: GoogleGenerativeAI;
  private model: string;
  private timeout: number;

  constructor(config: AIProviderConfig) {
    if (!config.apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-3.5-flash';
    this.timeout = config.timeout || 30000;
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Gemini doesn't have a models.list endpoint like Groq, so we'll do a quick test generation
      const model = this.client.getGenerativeModel({ model: this.model });
      await model.generateContent('ping');
      return true;
    } catch (error) {
      console.error('❌ Gemini API unavailable:', error);
      return false;
    }
  }

  async generateText(prompt: string): Promise<TextGenerationResponse> {
    try {
      console.log(`📍 [Gemini] Generating text with model: ${this.model}`);

      const model = this.client.getGenerativeModel({ model: this.model });
      const response = await model.generateContent(prompt);
      const text = response.response.text();

      if (!text) {
        throw new Error('No text content in Gemini response');
      }

      console.log(`✓ [Gemini] Text generation successful (${text.length} chars)`);

      return {
        text,
        provider: 'gemini',
        tokensUsed: response.response.usageMetadata?.totalTokenCount,
      };
    } catch (error: any) {
      console.error('❌ [Gemini] Text generation error:', error.message);
      throw error;
    }
  }

  async generateJSON<T = any>(prompt: string): Promise<JSONGenerationResponse<T>> {
    try {
      console.log(`📍 [Gemini] Generating JSON with model: ${this.model}`);

      const jsonPrompt = `${prompt}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no extra text.`;

      const model = this.client.getGenerativeModel({ model: this.model });
      const response = await model.generateContent(jsonPrompt);
      const text = response.response.text();

      if (!text) {
        throw new Error('No content in Gemini response');
      }

      // Clean response - remove markdown code blocks if present
      let cleanedText = text;
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      cleanedText = cleanedText.trim();

      try {
        const data = JSON.parse(cleanedText) as T;
        console.log(`✓ [Gemini] JSON generation successful`);
        return {
          data,
          provider: 'gemini',
          tokensUsed: response.response.usageMetadata?.totalTokenCount,
        };
      } catch (parseError: any) {
        console.error('❌ [Gemini] JSON parse error. Response:', cleanedText.substring(0, 200));
        throw new Error(`Failed to parse Gemini JSON response: ${parseError.message}`);
      }
    } catch (error: any) {
      console.error('❌ [Gemini] JSON generation error:', error.message);
      throw error;
    }
  }

  async generateWithImage?(
    prompt: string,
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<TextGenerationResponse> {
    try {
      console.log(`📍 [Gemini] Generating with image using model: ${this.model}`);

      const model = this.client.getGenerativeModel({ model: this.model });
      const response = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType,
          },
        },
      ]);

      const text = response.response.text();

      if (!text) {
        throw new Error('No text content in Gemini image response');
      }

      console.log(`✓ [Gemini] Image generation successful (${text.length} chars)`);

      return {
        text,
        provider: 'gemini',
        tokensUsed: response.response.usageMetadata?.totalTokenCount,
      };
    } catch (error: any) {
      console.error('❌ [Gemini] Image generation error:', error.message);
      throw error;
    }
  }
}
