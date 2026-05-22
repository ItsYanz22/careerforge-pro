import { useState, useEffect } from 'react';
import { useResumeStore } from '@stores/resumeStore';
import { Project } from '@types';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Github } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import GitHubImportModal from '../github/GitHubImportModal';

export default function ProjectsForm() {
  const { currentResume, updateResumeData } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  
  if (!currentResume) return null;
// ... (rest of the code omitted for brevity in replacement chunk, will use actual content in tool call)

  const projects = currentResume.data?.projects || [];

  // Ensure all projects have valid _id values
  useEffect(() => {
    const projectsNeedingIds = projects.some(proj => !proj._id);
    if (projectsNeedingIds) {
      const fixedProjects = projects.map(proj => ({
        ...proj,
        _id: proj._id || uuidv4(),
      }));
      updateResumeData(currentResume._id, { projects: fixedProjects });
    }
  }, [currentResume._id]);

  const handleAdd = () => {
    const newId = uuidv4();
    const newProject: Project = {
      _id: newId,
      title: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      link: '',
    };
    updateResumeData(currentResume._id, {
      projects: [...projects, newProject],
    });
    setExpandedId(newId);
  };

  const handleImportGithub = (githubProjects: any[]) => {
    const projectsWithIds = githubProjects.map(p => ({
      ...p,
      _id: uuidv4()
    }));
    
    updateResumeData(currentResume._id, {
      projects: [...projects, ...projectsWithIds]
    });
    
    if (projectsWithIds.length > 0) {
      setExpandedId(projectsWithIds[0]._id);
    }
  };

  const handleUpdate = (id: string, field: keyof Project, value: any) => {
    const updated = projects.map((proj) => {
      if (proj._id === id) {
        return { ...proj, [field]: value };
      }
      return proj;
    });
    updateResumeData(currentResume._id, { projects: updated });
  };

  const handleTechString = (id: string, value: string) => {
    const techArray = value.split(',').map(s => s.trim()).filter(s => s);
    handleUpdate(id, 'technologies', techArray);
  };

  const handleDelete = (id: string) => {
    const updated = projects.filter((proj) => proj._id !== id);
    updateResumeData(currentResume._id, { projects: updated });
  };

  const inputClasses = "w-full px-4 py-2.5 bg-input border border-input rounded-xl text-foreground focus:bg-secondary focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-border outline-none transition-all shadow-sm placeholder:text-muted-foreground";
  const labelClasses = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Projects</h2>
        <p className="text-sm font-medium text-muted-foreground">Highlight key projects, open-source contributions, or portfolio pieces.</p>
      </div>

      <div className="space-y-4">
        {projects.map((proj, index) => {
          const isExpanded = expandedId === proj._id || (!expandedId && index === 0);
          
          return (
            <div key={proj._id} className="border border-border dark:border-border/80 rounded-2xl bg-card dark:bg-card overflow-hidden shadow-sm transition-all hover:border-border">
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? 'border-b border-border dark:border-border bg-secondary/50' : 'hover:bg-secondary/80'}`}
                onClick={() => setExpandedId(isExpanded ? null : (proj._id || null))}
              >
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground hover:text-zinc-600 cursor-grab active:cursor-grabbing px-1" onClick={(e) => e.stopPropagation()}>
                    <GripVertical size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground tracking-tight">{proj.title || '(Not specified)'}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{proj.technologies?.length ? proj.technologies.join(', ') : 'Technologies'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(proj._id!); }}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  {isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 sm:p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Project Name</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleUpdate(proj._id!, 'title', e.target.value)}
                        className={inputClasses}
                        placeholder="CareerForge Pro"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Start Date</label>
                      <input
                        type="text"
                        value={proj.startDate}
                        onChange={(e) => handleUpdate(proj._id!, 'startDate', e.target.value)}
                        className={inputClasses}
                        placeholder="Jan 2024"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>End Date</label>
                      <input
                        type="text"
                        value={proj.endDate || ''}
                        onChange={(e) => handleUpdate(proj._id!, 'endDate', e.target.value)}
                        className={inputClasses}
                        placeholder="Present"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Project Link</label>
                      <input
                        type="url"
                        value={proj.link || ''}
                        onChange={(e) => handleUpdate(proj._id!, 'link', e.target.value)}
                        className={inputClasses}
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={proj.technologies.join(', ')}
                        onChange={(e) => handleTechString(proj._id!, e.target.value)}
                        className={inputClasses}
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Description</label>
                      <textarea
                        value={proj.description}
                        onChange={(e) => handleUpdate(proj._id!, 'description', e.target.value)}
                        rows={3}
                        className={`${inputClasses} resize-y py-3`}
                        placeholder="Built a full-stack SaaS application..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={handleAdd}
          className="flex-1 py-4 border-2 border-dashed border-border rounded-2xl text-zinc-600 font-semibold hover:border-[hsl(var(--primary))] hover:text-primary-600 hover:bg-primary-50 dark:bg-primary-950/50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Project
        </button>
        <button 
          onClick={() => setIsGithubModalOpen(true)}
          className="flex-1 py-4 border-2 border-dashed border-border rounded-2xl text-zinc-600 font-semibold hover:border-foreground/40 hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-2"
        >
          <Github size={18} />
          Import from GitHub
        </button>
      </div>

      <GitHubImportModal 
        isOpen={isGithubModalOpen} 
        onClose={() => setIsGithubModalOpen(false)} 
        onImport={handleImportGithub} 
      />
    </div>
  );
}
