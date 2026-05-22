import { Router, Request, Response } from 'express';
import { githubService } from '../services/github.service';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/github/repos/:username
 * Fetch all public repositories for a user
 */
router.get('/repos/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const repos = await githubService.getUserRepos(username);
    res.json(repos);
  } catch (error: any) {
    res.status(error.message === 'GitHub user not found' ? 404 : 500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/github/repo-info
 * Fetch details for a specific repository URL
 */
router.post('/repo-info', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
    const repo = await githubService.getRepoDetails(url);
    res.json(repo);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/github/generate-description
 * Generate AI enhanced description for a repo
 */
router.post('/generate-description', async (req: Request, res: Response) => {
  try {
    const { repo } = req.body;
    if (!repo) {
      return res.status(400).json({ success: false, message: 'Repo data is required' });
    }
    const description = await githubService.generateProjectDescription(repo);
    res.json({ description });
  } catch (error: any) {
    logger.error('[githubApi/generate-description] Error', error);
    res.status(500).json({ success: false, message: 'Failed to generate description' });
  }
});

export default router;
