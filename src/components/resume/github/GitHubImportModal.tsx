import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, X, Search, Terminal, Stars, GitBranch, Loader2, Check, ExternalLink, Sparkles } from 'lucide-react';
import { githubApi, GitHubRepo } from '../../../api/github.api';
import toast from 'react-hot-toast';

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (projects: any[]) => void;
}

export default function GitHubImportModal({ isOpen, onClose, onImport }: GitHubImportModalProps) {
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  const fetchRepos = async () => {
    if (!username.trim()) {
      toast.error('Please enter a GitHub username');
      return;
    }
    setIsLoading(true);
    try {
      const response = await githubApi.getRepos(username.trim());
      setRepos(response);
      toast.success(`Found ${response.length} repositories`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch repositories');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRepo = (repoName: string) => {
    const next = new Set(selectedRepos);
    if (next.has(repoName)) {
      next.delete(repoName);
    } else {
      next.add(repoName);
    }
    setSelectedRepos(next);
  };

  const handleImport = async () => {
    if (selectedRepos.size === 0) {
      toast.error('Please select at least one repository');
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading('Importing and enhancing projects...');
    
    try {
      const projectsToImport = await Promise.all(
        Array.from(selectedRepos).map(async (repoName) => {
          const repo = repos.find(r => r.name === repoName)!;
          
          // Generate AI description
          let description = repo.description;
          try {
            const aiRes = await githubApi.generateDescription(repo);
            description = aiRes.description;
          } catch (e) {
            console.warn('AI description generation failed, using original', e);
          }

          return {
            title: repo.name,
            description: description,
            technologies: repo.language ? [repo.language, ...repo.topics] : repo.topics,
            link: repo.html_url,
            startDate: '', // Not provided by GitHub API easily
            endDate: repo.updated_at.split('T')[0],
          };
        })
      );

      onImport(projectsToImport);
      toast.success(`Successfully imported ${projectsToImport.length} projects`, { id: toastId });
      onClose();
    } catch (error) {
      toast.error('Failed to import some projects', { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.language?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputClass = "w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-foreground focus:bg-card focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground outline-none transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-premium overflow-hidden flex flex-col max-h-[85vh] z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-foreground text-background rounded-xl">
                  <Github size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Import from GitHub</h3>
                  <p className="text-sm text-muted-foreground">Fetch your projects and enhance them with AI</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Search/User Input */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchRepos()}
                    placeholder="Enter GitHub username (e.g. torvalds)"
                    className={`${inputClass} pl-11`}
                  />
                </div>
                <button
                  onClick={fetchRepos}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-foreground text-background font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Fetch'}
                </button>
              </div>

              {repos.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      Select Repositories ({selectedRepos.size} selected)
                    </h4>
                    <div className="relative w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter repos..."
                        className="w-full pl-9 pr-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredRepos.map((repo) => {
                      const isSelected = selectedRepos.has(repo.name);
                      return (
                        <div
                          key={repo.name}
                          onClick={() => toggleRepo(repo.name)}
                          className={`
                            p-4 rounded-2xl border cursor-pointer transition-all group
                            ${isSelected 
                              ? 'bg-primary-50/50 dark:bg-primary-950/30 border-primary shadow-sm shadow-primary/10' 
                              : 'bg-card border-border hover:border-foreground/20 hover:bg-secondary/40'}
                          `}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-foreground truncate flex-1 group-hover:text-primary transition-colors">
                              {repo.name}
                            </h5>
                            {isSelected ? (
                              <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                                <Check size={12} />
                              </div>
                            ) : (
                              <a 
                                href={repo.html_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-muted-foreground hover:text-foreground p-1"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 h-8">
                            {repo.description || 'No description provided.'}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                            {repo.language && (
                              <span className="flex items-center gap-1">
                                <Terminal size={10} className="text-primary" />
                                {repo.language}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Stars size={10} className="text-amber-500" />
                              {repo.stargazers_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitBranch size={10} />
                              Updated {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredRepos.length === 0 && (
                    <div className="text-center py-12 bg-secondary/20 rounded-3xl border border-dashed border-border">
                      <Search size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">No repositories found matching your search.</p>
                    </div>
                  )}
                </div>
              )}

              {repos.length === 0 && !isLoading && (
                <div className="text-center py-16 bg-secondary/20 rounded-3xl border border-dashed border-border">
                  <Github size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                  <h4 className="text-lg font-bold text-foreground mb-2">No Repositories Loaded</h4>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Enter a GitHub username above to see your public repositories and import them into your resume.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-secondary/30 flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">
                {selectedRepos.size} items selected
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-card hover:bg-secondary text-foreground font-bold rounded-xl border border-border transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={selectedRepos.size === 0 || isImporting}
                  className="px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isImporting ? (
                    <><Loader2 size={18} className="animate-spin" /> Enhancing…</>
                  ) : (
                    <><Sparkles size={18} /> Import Selected</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
