import { create } from 'zustand';
import { Resume, ResumeData, TemplateType, FontType, ThemeType, SpacingConfig } from '@types';
import { resumeApi } from '../api/resume.api';

interface ResumeState {
  currentResume: Resume | null;
  resumes: Resume[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Resume CRUD
  loadResume: (id: string) => Promise<void>;
  loadResumes: () => Promise<void>;
  createResume: (title: string, template?: TemplateType) => Promise<Resume>;
  updateResume: (id: string, data: Partial<Resume>) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  cloneResume: (id: string, newTitle: string) => Promise<Resume>;

  // Data manipulation
  updateResumeData: (id: string, data: Partial<ResumeData>) => void;
  updateTemplate: (id: string, template: TemplateType) => void;
  updateFont: (id: string, font: FontType) => void;
  updateTheme: (id: string, theme: ThemeType) => void;
  updateSpacing: (id: string, spacing: SpacingConfig) => void;

  // Local state
  setCurrentResume: (resume: Resume | null) => void;
  clearError: () => void;
}

let saveTimeout: NodeJS.Timeout | null = null;
let isSaving = false;

const triggerAutosave = (id: string, get: () => ResumeState, set: (fn: (state: ResumeState) => Partial<ResumeState> | Partial<ResumeState>) => void) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    // Prevent duplicate simultaneous saves
    if (isSaving) return;
    
    const state = get();
    const resume = state.currentResume;
    if (!resume || resume._id !== id) return;

    isSaving = true;
    set(() => ({ isSaving: true, error: null }));
    try {
      // Create a copy of the update payload from current state
      const updatePayload = {
        data: resume.data,
        template: resume.template,
        font: resume.font,
        theme: resume.theme,
        spacing: resume.spacing,
      };
      
      const updatedResume = await resumeApi.updateResume(id, updatePayload);
      set((s) => ({
        currentResume: s.currentResume?._id === id ? updatedResume : s.currentResume,
        resumes: s.resumes.map((r) => (r._id === id ? updatedResume : r)),
        isSaving: false,
      }));
    } catch (error) {
      console.error('Autosave failed:', error);
      set(() => ({
        error: error instanceof Error ? error.message : 'Autosave failed',
        isSaving: false,
      }));
    } finally {
      isSaving = false;
      saveTimeout = null;
    }
  }, 2000);
};

export const useResumeStore = create<ResumeState>((set, get) => ({
  currentResume: null,
  resumes: [],
  isLoading: false,
  isSaving: false,
  error: null,

  loadResume: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const resume = await resumeApi.getResume(id);
      set({ currentResume: resume, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load resume',
        isLoading: false,
      });
    }
  },

  loadResumes: async () => {
    set({ isLoading: true, error: null });
    try {
      const resumes = await resumeApi.getResumes();
      set({ resumes, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load resumes',
        isLoading: false,
      });
    }
  },

  createResume: async (title: string, template: TemplateType = 'modern-blue') => {
    set({ isSaving: true, error: null });
    try {
      const resume = await resumeApi.createResume(title, template);
      set((state) => ({
        resumes: [...state.resumes, resume],
        currentResume: resume,
        isSaving: false,
      }));
      return resume;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create resume',
        isSaving: false,
      });
      throw error;
    }
  },

  updateResume: async (id: string, data: Partial<Resume>) => {
    set({ isSaving: true, error: null });
    try {
      const resume = await resumeApi.updateResume(id, data);
      set((state) => ({
        currentResume: state.currentResume?._id === id ? resume : state.currentResume,
        resumes: state.resumes.map((r) => (r._id === id ? resume : r)),
        isSaving: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update resume',
        isSaving: false,
      });
      throw error;
    }
  },

  deleteResume: async (id: string) => {
    set({ isSaving: true, error: null });
    try {
      await resumeApi.deleteResume(id);
      set((state) => ({
        resumes: state.resumes.filter((r) => r._id !== id),
        currentResume: state.currentResume?._id === id ? null : state.currentResume,
        isSaving: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete resume',
        isSaving: false,
      });
      throw error;
    }
  },

  cloneResume: async (id: string, newTitle: string) => {
    set({ isSaving: true, error: null });
    try {
      const cloned = await resumeApi.cloneResume(id, newTitle);
      set((state) => ({
        resumes: [...state.resumes, cloned],
        isSaving: false,
      }));
      return cloned;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to clone resume',
        isSaving: false,
      });
      throw error;
    }
  },

  updateResumeData: (id: string, data: Partial<ResumeData>) => {
    set((state) => {
      if (state.currentResume?._id !== id) return state;
      
      // Proper deep merge for nested resume data (personal, etc.)
      const deepMerge = (target: any, source: any) => {
        const result = { ...target };
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = { ...target[key], ...source[key] };
          } else {
            result[key] = source[key];
          }
        }
        return result;
      };

      const updatedData = deepMerge(state.currentResume.data, data) as ResumeData;
      
      return {
        currentResume: {
          ...state.currentResume,
          data: updatedData
        }
      };
    });
    triggerAutosave(id, get, set);
  },

  updateTemplate: (id: string, template: TemplateType) => {
    set((state) => {
      if (state.currentResume?._id !== id) return state;
      return { currentResume: { ...state.currentResume, template } };
    });
    triggerAutosave(id, get, set);
  },

  updateFont: (id: string, font: FontType) => {
    set((state) => {
      if (state.currentResume?._id !== id) return state;
      return { currentResume: { ...state.currentResume, font } };
    });
    triggerAutosave(id, get, set);
  },

  updateTheme: (id: string, theme: ThemeType) => {
    set((state) => {
      if (state.currentResume?._id !== id) return state;
      return { currentResume: { ...state.currentResume, theme } };
    });
    triggerAutosave(id, get, set);
  },

  updateSpacing: (id: string, spacing: SpacingConfig) => {
    set((state) => {
      if (state.currentResume?._id !== id) return state;
      return { currentResume: { ...state.currentResume, spacing } };
    });
    triggerAutosave(id, get, set);
  },

  setCurrentResume: (resume) => set({ currentResume: resume }),
  clearError: () => set({ error: null }),
}));

