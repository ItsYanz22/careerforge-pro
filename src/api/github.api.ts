import { apiClient } from './apiClient';

export interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  updated_at: string;
  topics: string[];
}

export const githubApi = {
  getRepos: (username: string) => 
    apiClient.get<GitHubRepo[]>(`/github/repos/${username}`),

  getRepoInfo: (url: string) => 
    apiClient.post<GitHubRepo>('/github/repo-info', { url }),

  generateDescription: (repo: GitHubRepo) => 
    apiClient.post<{ description: string }>('/github/generate-description', { repo }),
};
