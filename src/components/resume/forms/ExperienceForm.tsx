import { useState, useEffect } from 'react';
import { useResumeStore } from '@stores/resumeStore';
import { Experience } from '@types';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Sparkles, Bot } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import AIAssistantModal from '@components/ai/AIAssistantModal';
import { useAICoachStore } from '@stores/aiCoachStore';

export default function ExperienceForm() {
  const { currentResume, updateResumeData } = useResumeStore();
  const aiCoach = useAICoachStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [activeAIContext, setActiveAIContext] = useState<{expId: string, bIndex: number, text: string} | null>(null);
  
  if (!currentResume) return null;

  const experiences = currentResume.data?.experience || [];

  // Ensure all experiences have valid _id values
  useEffect(() => {
    const experiencesNeedingIds = experiences.some(exp => !exp._id);
    if (experiencesNeedingIds) {
      const fixedExperiences = experiences.map(exp => ({
        ...exp,
        _id: exp._id || uuidv4(),
      }));
      updateResumeData(currentResume._id, { experience: fixedExperiences });
    }
  }, [currentResume._id]);

  const handleAdd = () => {
    const newId = uuidv4();
    const newExperience: Experience = {
      _id: newId,
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentRole: false,
      description: '',
      bulletPoints: [''],
    };
    // Replace entire array with new experiences, not merge
    updateResumeData(currentResume._id, {
      experience: [...experiences, newExperience],
    });
    setExpandedId(newId);
  };

  const handleUpdate = (id: string, field: keyof Experience, value: any) => {
    const updated = experiences.map((exp) => {
      if (exp._id === id) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    // Replace entire array with updated experiences
    updateResumeData(currentResume._id, { experience: updated });
  };

  const handleUpdateBullet = (expId: string, index: number, value: string) => {
    const updated = experiences.map((exp) => {
      if (exp._id === expId) {
        const newBullets = [...exp.bulletPoints];
        newBullets[index] = value;
        return { ...exp, bulletPoints: newBullets };
      }
      return exp;
    });
    // Replace entire array with updated experiences
    updateResumeData(currentResume._id, { experience: updated });
  };

  const handleAddBullet = (expId: string) => {
    const updated = experiences.map((exp) => {
      if (exp._id === expId) {
        return { ...exp, bulletPoints: [...exp.bulletPoints, ''] };
      }
      return exp;
    });
    // Replace entire array with updated experiences
    updateResumeData(currentResume._id, { experience: updated });
  };

  const handleDeleteBullet = (expId: string, index: number) => {
    const updated = experiences.map((exp) => {
      if (exp._id === expId) {
        const newBullets = [...exp.bulletPoints];
        newBullets.splice(index, 1);
        return { ...exp, bulletPoints: newBullets };
      }
      return exp;
    });
    // Replace entire array with updated experiences
    updateResumeData(currentResume._id, { experience: updated });
  };

  const handleDelete = (id: string) => {
    if (!id) {
      console.warn('Cannot delete experience without ID');
      return;
    }
    const updated = experiences.filter((exp) => exp._id !== id);
    // Replace entire array with filtered experiences
    updateResumeData(currentResume._id, { experience: updated });
    setExpandedId(null);
  };

  const openAIModal = (expId: string, bIndex: number, text: string) => {
    setActiveAIContext({ expId, bIndex, text });
    setIsAIModalOpen(true);
  };

  const handleAIAccept = (newText: string) => {
    if (activeAIContext) {
      handleUpdateBullet(activeAIContext.expId, activeAIContext.bIndex, newText);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-input border border-input rounded-xl text-foreground focus:bg-secondary focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-border outline-none transition-all shadow-sm placeholder:text-muted-foreground";
  const labelClasses = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Work Experience</h2>
        <p className="text-sm font-medium text-muted-foreground">List your relevant experience, starting with the most recent.</p>
      </div>

      <div className="space-y-4">
        {experiences.map((exp, index) => {
          const isExpanded = expandedId === exp._id || (!expandedId && index === 0);
          
          return (
            <div key={exp._id} className="border border-border rounded-2xl bg-card dark:bg-card overflow-hidden shadow-sm transition-all hover:border-border dark:hover:border-border">
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? 'border-b border-border dark:border-border bg-secondary dark:bg-card' : 'hover:bg-secondary dark:hover:bg-card/80'}`}
                onClick={() => setExpandedId(isExpanded ? null : (exp._id || null))}
              >
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground hover:text-zinc-600 cursor-grab active:cursor-grabbing px-1" onClick={(e) => e.stopPropagation()}>
                    <GripVertical size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground tracking-tight">{exp.jobTitle || '(Not specified)'}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{exp.company ? `${exp.company} • ${exp.startDate || 'Start Date'} - ${exp.isCurrentRole ? 'Present' : (exp.endDate || 'End Date')}` : 'Company Details'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(exp._id!); }}
                    className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  {isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 sm:p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClasses}>Job Title</label>
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) => handleUpdate(exp._id!, 'jobTitle', e.target.value)}
                        className={inputClasses}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleUpdate(exp._id!, 'company', e.target.value)}
                        className={inputClasses}
                        placeholder="Google"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleUpdate(exp._id!, 'startDate', e.target.value)}
                        className={inputClasses}
                        placeholder="Jan 2020"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>End Date</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => handleUpdate(exp._id!, 'endDate', e.target.value)}
                          disabled={exp.isCurrentRole}
                          className={`${inputClasses} disabled:bg-muted dark:disabled:bg-card/50 disabled:text-muted-foreground disabled:border-border disabled:cursor-not-allowed`}
                          placeholder="Present"
                        />
                        <label className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-foreground cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={exp.isCurrentRole}
                            onChange={(e) => handleUpdate(exp._id!, 'isCurrentRole', e.target.checked)}
                            className="rounded border-border dark:border-zinc-600 text-primary-500 focus:ring-primary/40" 
                          />
                          Current
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => handleUpdate(exp._id!, 'location', e.target.value)}
                        className={inputClasses}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-border dark:border-border">
                    <div className="flex justify-between items-center">
                      <label className={labelClasses}>Bullet Points</label>
                    </div>
                    
                    {exp.bulletPoints.map((bullet, bIndex) => (
                      <div key={bIndex} className="flex gap-3 items-start group">
                        <div className="mt-3.5 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0"></div>
                        <div className="flex-1 relative">
                          <textarea
                            value={bullet}
                            onChange={(e) => handleUpdateBullet(exp._id!, bIndex, e.target.value)}
                            rows={2}
                            className={`${inputClasses} py-2 resize-y pr-10 min-h-[60px]`}
                            placeholder="Describe your achievements..."
                          />
                          <div className="absolute right-2 top-2 flex items-center gap-1">
                            <button 
                              onClick={() => aiCoach.openCoach(bullet, 'experience bullet')}
                              className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-lg transition-colors shadow-sm" 
                              title="AI Resume Coach"
                            >
                              <Bot size={14} />
                            </button>
                            <button 
                              onClick={() => openAIModal(exp._id!, bIndex, bullet)}
                              className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-lg transition-colors shadow-sm" 
                              title="AI Rewrite Bullet"
                            >
                              <Sparkles size={14} />
                            </button>
                          </div>
                        </div> 
                        <button 
                          onClick={() => handleDeleteBullet(exp._id!, bIndex)}
                          className="mt-1.5 p-2 text-muted-foreground hover:text-destructive rounded-lg transition-colors opacity-0 group-hover:opacity-100 hover:bg-destructive/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => handleAddBullet(exp._id!)}
                      className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1.5 mt-2 bg-primary-50 dark:bg-primary-950/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus size={14} />
                      Add bullet point
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={handleAdd}
        className="w-full py-4 border-2 border-dashed border-border dark:border-border rounded-2xl text-muted-foreground font-semibold hover:border-primary hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Add Experience
      </button>

      {activeAIContext && (
        <AIAssistantModal 
          isOpen={isAIModalOpen} 
          onClose={() => setIsAIModalOpen(false)} 
          originalText={activeAIContext.text} 
          onAccept={handleAIAccept} 
          contextType="experience" 
        />
      )}
    </div>
  );
}

