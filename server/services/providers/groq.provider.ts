/**
 * Groq AI Provider
 * Uses Groq API for fast, efficient inference
 */

import { Groq } from 'groq-sdk';
import { AIProvider, AIProviderConfig, TextGenerationResponse, JSONGenerationResponse } from './provider.interface';

export class GroqProvider implements AIProvider {
  name: 'groq' = 'groq';
  private client: Groq;
  private model: string;
  private timeout: number;

  constructor(config: AIProviderConfig) {
    if (!config.apiKey) {
      throw new Error('GROQ_API_KEY is required');
    }

    this.client = new Groq({ apiKey: config.apiKey });
    this.model = config.model || 'llama-3.3-70b-versatile';
    this.timeout = config.timeout || 30000;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.client.models.list({}, { timeout: 5000 });
      return !!response;
    } catch (error) {
      console.error('❌ Groq API unavailable:', error);
      return false;
    }
  }

  async generateText(prompt: string): Promise<TextGenerationResponse> {
    try {
      console.log(`📍 [Groq] Generating text with model: ${this.model}`);

      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        },
        { timeout: this.timeout }
      );

      const text = response.choices?.[0]?.message?.content || '';

      if (!text) {
        throw new Error('No text content in Groq response');
      }

      console.log(`✓ [Groq] Text generation successful (${text.length} chars)`);

      return {
        text,
        provider: 'groq',
        tokensUsed: response.usage?.total_tokens,
      };
    } catch (error: any) {
      console.error('❌ [Groq] Text generation error:', error.message);
      throw error;
    }
  }

  async generateJSON<T = any>(prompt: string): Promise<JSONGenerationResponse<T>> {
    try {
      console.log(`📍 [Groq] Generating JSON with model: ${this.model}`);

      const jsonPrompt = `${prompt}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no extra text.`;

      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: jsonPrompt,
            },
          ],
          temperature: 0.3, // Lower temperature for more consistent JSON
          max_tokens: 4096,
        },
        { timeout: this.timeout }
      );

      const text = response.choices?.[0]?.message?.content || '';

      if (!text) {
        throw new Error('No content in Groq response');
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
        console.log(`✓ [Groq] JSON generation successful`);
        return {
          data,
          provider: 'groq',
          tokensUsed: response.usage?.total_tokens,
        };
      } catch (parseError: any) {
        console.error('❌ [Groq] JSON parse error. Response:', cleanedText.substring(0, 200));
        throw new Error(`Failed to parse Groq JSON response: ${parseError.message}`);
      }
    } catch (error: any) {
      console.error('❌ [Groq] JSON generation error:', error.message);
      throw error;
    }
  }

  async generateWithImage?(
    prompt: string,
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<TextGenerationResponse> {
    // Groq doesn't support image generation yet, but keep for future compatibility
    console.warn('⚠️ [Groq] Image support not available, falling back to text-only prompt');
    return this.generateText(prompt);
  }
}
