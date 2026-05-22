import axios from 'axios';
import { aiService } from './ai.service';
import logger from '../utils/logger';

export interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  updated_at: string;
  topics: string[];
}

export const githubService = {
  /**
   * Fetch public repositories for a GitHub user
   */
  getUserRepos: async (username: string): Promise<GitHubRepo[]> => {
    try {
      const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'CareerForge-Pro-Server'
        }
      });
      
      return response.data.map((repo: any) => ({
        name: repo.name,
        description: repo.description || '',
        html_url: repo.html_url,
        language: repo.language || '',
        stargazers_count: repo.stargazers_count,
        updated_at: repo.updated_at,
        topics: repo.topics || []
      }));
    } catch (error: any) {
      logger.error(`[githubService/getUserRepos] Error fetching repos for ${username}`, error);
      if (error.response?.status === 404) {
        throw new Error('GitHub user not found');
      }
      if (error.response?.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch GitHub repositories');
    }
  },

  /**
   * Fetch a single repository by URL or owner/repo
   */
  getRepoDetails: async (repoPath: string): Promise<GitHubRepo> => {
    try {
      // Clean up repoPath (handle full URLs)
      const path = repoPath.replace('https://github.com/', '').replace(/\/$/, '');
      const [owner, repo] = path.split('/');
      
      if (!owner || !repo) {
        throw new Error('Invalid GitHub repository path');
      }

      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'CareerForge-Pro-Server'
        }
      });

      const data = response.data;
      return {
        name: data.name,
        description: data.description || '',
        html_url: data.html_url,
        language: data.language || '',
        stargazers_count: data.stargazers_count,
        updated_at: data.updated_at,
        topics: data.topics || []
      };
    } catch (error: any) {
      logger.error(`[githubService/getRepoDetails] Error fetching repo: ${repoPath}`, error);
      if (error.response?.status === 404) {
        throw new Error('GitHub repository not found');
      }
      throw new Error('Failed to fetch GitHub repository details');
    }
  },

  /**
   * Generate a polished project description using AI based on repo data
   */
  generateProjectDescription: async (repo: GitHubRepo): Promise<string> => {
    const prompt = `You are an expert resume writer. Create a professional, action-oriented project description for a resume based on this GitHub repository data.
    
    Project Name: ${repo.name}
    Description: ${repo.description}
    Primary Language: ${repo.language}
    Topics: ${repo.topics.join(', ')}
    
    Requirements:
    - Focus on technical implementation and impact.
    - Use strong action verbs.
    - Keep it to 1-2 powerful sentences.
    - Mention key technologies used.
    
    Return a JSON response:
    { "description": "The polished project description" }`;

    try {
      const result = await aiService.generateText(prompt);
      // Clean up markdown code blocks if present
      const cleanedJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);
      return parsed.description;
    } catch (error) {
      logger.error('[githubService/generateProjectDescription] AI Error', error);
      return repo.description; // Fallback to original description
    }
  }
};
