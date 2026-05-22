import { useState, useEffect } from 'react';
import { useResumeStore } from '@stores/resumeStore';
import { Education } from '@types';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function EducationForm() {
  const { currentResume, updateResumeData } = useResumeStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  if (!currentResume) return null;

  const education = currentResume.data?.education || [];

  // Ensure all education items have valid _id values
  useEffect(() => {
    const educationNeedingIds = education.some(edu => !edu._id);
    if (educationNeedingIds) {
      const fixedEducation = education.map(edu => ({
        ...edu,
        _id: edu._id || uuidv4(),
      }));
      updateResumeData(currentResume._id, { education: fixedEducation });
    }
  }, [currentResume._id]);

  const handleAdd = () => {
    const newId = uuidv4();
    const newEducation: Education = {
      _id: newId,
      school: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: '',
      description: '',
    };
    updateResumeData(currentResume._id, {
      education: [...education, newEducation],
    });
    setExpandedId(newId);
  };

  const handleUpdate = (id: string, field: keyof Education, value: string) => {
    const updated = education.map((edu) => {
      if (edu._id === id) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    updateResumeData(currentResume._id, { education: updated });
  };

  const handleDelete = (id: string) => {
    const updated = education.filter((edu) => edu._id !== id);
    updateResumeData(currentResume._id, { education: updated });
  };

  const inputClasses = "w-full px-4 py-2.5 bg-input border border-input rounded-xl text-foreground focus:bg-secondary focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-border outline-none transition-all shadow-sm placeholder:text-muted-foreground";
  const labelClasses = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Education</h2>
        <p className="text-sm font-medium text-muted-foreground">Add your educational background.</p>
      </div>

      <div className="space-y-4">
        {education.map((edu, index) => {
          const isExpanded = expandedId === edu._id || (!expandedId && index === 0);
          
          return (
            <div key={edu._id} className="border border-border dark:border-border/80 rounded-2xl bg-card dark:bg-card overflow-hidden shadow-sm transition-all hover:border-border dark:hover:border-zinc-600">
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? 'border-b border-border dark:border-border bg-secondary/50' : 'hover:bg-secondary/80'}`}
                onClick={() => setExpandedId(isExpanded ? null : (edu._id || null))}
              >
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing px-1" onClick={(e) => e.stopPropagation()}>
                    <GripVertical size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground tracking-tight">{edu.school || '(Not specified)'}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{edu.degree ? `${edu.degree} in ${edu.field} • ${edu.graduationDate || 'Graduation Date'}` : 'Degree Details'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(edu._id!); }}
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
                      <label className={labelClasses}>School / University</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => handleUpdate(edu._id!, 'school', e.target.value)}
                        className={inputClasses}
                        placeholder="Stanford University"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleUpdate(edu._id!, 'degree', e.target.value)}
                        className={inputClasses}
                        placeholder="Bachelor of Science"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Field of Study</label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => handleUpdate(edu._id!, 'field', e.target.value)}
                        className={inputClasses}
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Graduation Date</label>
                      <input
                        type="text"
                        value={edu.graduationDate}
                        onChange={(e) => handleUpdate(edu._id!, 'graduationDate', e.target.value)}
                        className={inputClasses}
                        placeholder="May 2024"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>GPA (Optional)</label>
                      <input
                        type="text"
                        value={edu.gpa || ''}
                        onChange={(e) => handleUpdate(edu._id!, 'gpa', e.target.value)}
                        className={inputClasses}
                        placeholder="3.8/4.0"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Description (Optional)</label>
                      <textarea
                        value={edu.description || ''}
                        onChange={(e) => handleUpdate(edu._id!, 'description', e.target.value)}
                        rows={3}
                        className={`${inputClasses} resize-y py-3`}
                        placeholder="Relevant coursework, honors, societies..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={handleAdd}
        className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-foreground-muted font-semibold hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Add Education
      </button>
    </div>
  );
}
