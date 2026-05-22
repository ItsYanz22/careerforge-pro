import { create } from 'zustand';

interface AICoachState {
  isOpen: boolean;
  content: string;
  type: string;
  
  openCoach: (content: string, type: string) => void;
  closeCoach: () => void;
}

export const useAICoachStore = create<AICoachState>((set) => ({
  isOpen: false,
  content: '',
  type: 'bullet',
  
  openCoach: (content, type) => set({ isOpen: true, content, type }),
  closeCoach: () => set({ isOpen: false, content: '' }),
}));
