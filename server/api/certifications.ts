import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middlewares/auth';
// @ts-ignore
import multer from 'multer';
import { aiService } from '../services/ai.service';
import logger from '../utils/logger';

const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

/**
 * POST /api/certifications/ocr
 * Extract certificate data from image or PDF
 */
router.post('/ocr', protect, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const result = await aiService.extractCertificateData(req.file.buffer, req.file.mimetype);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('[certifications/ocr] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/certifications/linkedin
 * Fetch a LinkedIn certificate by URL (Mock/Simplified for now as LinkedIn scraping is restricted)
 * In a real scenario, this would use a proxy or API if available.
 */
router.post('/linkedin', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'LinkedIn URL is required' });
    }

    // Since real scraping is complex and often against TOS, we use AI to "simulate" or extract if possible,
    // or provide instructions to the user. For this implementation, we'll try to fetch the page content
    // and use AI to parse it if it's a public profile/certificate URL.
    
    // For now, let's return a helpful message or use a simplified extractor
    return res.json({
      success: true,
      data: {
        message: "LinkedIn direct fetching is currently simulated. Please upload the certificate for full accuracy.",
        url
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
