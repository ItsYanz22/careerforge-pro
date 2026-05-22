import { create } from 'zustand';
import { ExportStage } from '../types';

interface ExportState {
  stage: ExportStage;
  error: string | null;

  // Actions
  startExport: () => void;
  setStage: (stage: ExportStage) => void;
  setError: (error: string) => void;
  reset: () => void;
}

/**
 * Export store — drives the ExportButton progress states.
 *
 * Stage flow:
 *   idle → preparing → rendering → generating → downloading → idle
 *
 * On failure:
 *   any stage → error (with message) → idle (after retry or dismiss)
 */
export const useExportStore = create<ExportState>((set) => ({
  stage: 'idle',
  error: null,

  startExport: () => set({ stage: 'preparing', error: null }),

  setStage: (stage) => set({ stage }),

  setError: (error) => set({ stage: 'error', error }),

  reset: () => set({ stage: 'idle', error: null }),
}));
