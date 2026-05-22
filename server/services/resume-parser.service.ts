import mammoth from 'mammoth';
import { aiService } from './ai.service';
import logger from '../utils/logger';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

export interface ParsedResumeData {
  skills: string[];
  experience: any[];
  education: any[];
  projects: any[];
  fullText: string;
}

// Create require for CommonJS modules in ESM
const require = createRequire(import.meta.url);

/**
 * Parse PDF buffer using multiple methods for maximum compatibility
 */
async function parsePDF(buffer: Buffer): Promise<string> {
  console.log('📍 PDF parsing started, buffer size:', buffer.length);
  
  // Method 1: Try pdf-parse library
  try {
    console.log('📍 Method 1: Attempting pdf-parse...');
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer);
    
    console.log('📍 pdf-parse returned keys:', Object.keys(pdfData));
    let text = pdfData.text || '';
    
    if (!text && pdfData.data?.text) {
      text = pdfData.data.text;
    }
    if (!text && pdfData.raw) {
      text = pdfData.raw;
    }
    
    if (text && text.trim().length > 10) {
      console.log(`✓ pdf-parse success: ${text.length} characters`);
      return text;
    }
    console.log('⚠️ pdf-parse returned empty text');
  } catch (error) {
    console.log('⚠️ pdf-parse method failed:', error?.message);
  }
  
  // Method 2: Raw buffer text extraction from PDF streams
  try {
    console.log('📍 Method 2: Raw buffer extraction...');
    const text = buffer.toString('latin1');
    
    // Extract text from PDF text objects
    const matches = text.match(/BT[\s\S]*?ET/g) || [];
    console.log('📍 Found', matches.length, 'text blocks');
    
    if (matches.length > 0) {
      let extracted = matches
        .join(' ')
        .replace(/BT|ET|Tj|TJ|\/F\d+|re|m|l|f|S/g, ' ')
        .replace(/\(([^)]*)\)/g, (match) => {
          return match.slice(1, -1)
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\n/g, ' ');
        })
        .replace(/[^\w\s\n\-\.\,]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (extracted && extracted.length > 10) {
        console.log(`✓ Method 2 success: ${extracted.length} characters`);
        return extracted;
      }
    }
    
    // Fallback: Extract any ASCII text
    let ascii = text
      .replace(/[^\x20-\x7E\x80-\xFF\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (ascii && ascii.length > 10) {
      console.log(`✓ Method 2 ASCII fallback: ${ascii.length} characters`);
      return ascii;
    }
  } catch (error) {
    console.log('⚠️ Method 2 failed:', error?.message);
  }
  
  // Method 3: Check if valid PDF at all
  try {
    const header = buffer.toString('latin1', 0, 100);
    if (!header.includes('%PDF')) {
      throw new Error('This does not appear to be a valid PDF file');
    }
  } catch (e) {
    console.error('❌ Invalid PDF detected:', e?.message);
    throw e;
  }
  
  console.error('❌ All PDF extraction methods returned empty text');
  throw new Error('Failed to extract text from PDF. Please ensure the PDF is not empty and try again, or upload a DOCX/TXT file.');
}

export const resumeParserService = {
  /**
   * Parse a resume file from buffer based on mimetype
   */
  parseBuffer: async (buffer: Buffer, mimetype: string): Promise<string> => {
    try {
      console.log('📄 Parsing file with MIME type:', mimetype);
      
      if (mimetype === 'application/pdf') {
        console.log('📍 Attempting PDF parsing...');
        const text = await parsePDF(buffer);
        
        if (!text || text.trim().length === 0) {
          throw new Error('PDF appears to be empty or unreadable');
        }
        
        console.log('✓ PDF parsed successfully, extracted', text.length, 'characters');
        return text;
      } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimetype === 'application/msword'
      ) {
        console.log('📍 Parsing DOCX file...');
        const result = await mammoth.extractRawText({ buffer });
        
        if (!result.value || result.value.trim().length === 0) {
          throw new Error('DOCX file appears to be empty');
        }
        
        console.log('✓ DOCX parsed successfully');
        return result.value;
      } else if (mimetype === 'text/plain') {
        console.log('📍 Parsing TXT file...');
        const text = buffer.toString('utf8');
        
        if (!text || text.trim().length === 0) {
          throw new Error('TXT file appears to be empty');
        }
        
        console.log('✓ TXT parsed successfully');
        return text;
      } else {
        throw new Error(`Unsupported file type: ${mimetype}. Please upload PDF, DOCX, or TXT.`);
      }
    } catch (error: any) {
      console.error('❌ [resumeParserService/parseBuffer]', error.message);
      throw new Error(error.message || 'Failed to parse file');
    }
  },

  /**
   * Use AI to extract structured data from raw resume text
   */
  extractStructuredData: async (text: string): Promise<ParsedResumeData> => {
    const prompt = `You are an expert recruitment system. Extract structured data from the following raw resume text.
    
    Resume Text:
    """
    ${text}
    """
    
    Extract:
    1. Key Skills (technical and soft)
    2. Professional Experience (company, role, description)
    3. Education (school, degree, field)
    4. Projects (title, description, tech used)
    
    Return a JSON response with this exact structure:
    {
      "skills": ["Skill1", "Skill2"],
      "experience": [{"company": "...", "jobTitle": "...", "description": "..."}],
      "education": [{"school": "...", "degree": "...", "field": "..."}],
      "projects": [{"title": "...", "description": "...", "technologies": ["..."]}]
    }`;

    try {
      const result = await aiService.generateText(prompt);
      const cleanedJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);
      
      return {
        ...parsed,
        fullText: text // Keep original text for context
      };
    } catch (error) {
      logger.error('[resumeParserService/extractStructuredData] AI extraction error', error);
      // Fallback to empty structure if AI fails but keep the text
      return {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        fullText: text
      };
    }
  }
};
