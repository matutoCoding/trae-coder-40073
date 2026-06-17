import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  seedElectrodes,
  type Electrode,
  type ElectrodeStatus,
} from '../data/seed';

export interface ElectrodeState {
  electrodes: Electrode[];
  statusFilter: ElectrodeStatus | 'all';
  projectFilter: string;
}

export interface ElectrodeActions {
  filteredElectrodes: () => Electrode[];
  setStatusFilter: (s: ElectrodeStatus | 'all') => void;
  setProjectFilter: (pid: string) => void;
  getElectrode: (id: string) => Electrode | undefined;
  getElectrodesByProject: (projectId: string) => Electrode[];
  addElectrode: (e: Omit<Electrode, 'id'>) => void;
  updateElectrode: (id: string, patch: Partial<Electrode>) => void;
  deleteElectrode: (id: string) => void;
  changeStatus: (id: string, status: ElectrodeStatus) => void;
  recordUsage: (id: string, hours?: number) => void;
  updateEdmParams: (id: string, params: Partial<Electrode['edmParams']>) => void;
}

export type ElectrodeStore = ElectrodeState & ElectrodeActions;

export const useElectrodeStore = create<ElectrodeStore>()(
  persist(
    (set, get) => ({
      electrodes: seedElectrodes,
      statusFilter: 'all',
      projectFilter: '',

      filteredElectrodes: () => {
        const { electrodes, statusFilter, projectFilter } = get();
        return electrodes.filter((e) => {
          const matchStatus = statusFilter === 'all' || e.status === statusFilter;
          const matchProject = !projectFilter || e.projectId === projectFilter;
          return matchStatus && matchProject;
        });
      },

      setStatusFilter: (s) => set({ statusFilter: s }),
      setProjectFilter: (pid) => set({ projectFilter: pid }),

      getElectrode: (id) => get().electrodes.find((e) => e.id === id),
      getElectrodesByProject: (projectId) =>
        get().electrodes.filter((e) => e.projectId === projectId),

      addElectrode: (e) =>
        set((state) => ({
          electrodes: [...state.electrodes, { ...e, id: `e${Date.now()}` }],
        })),

      updateElectrode: (id, patch) =>
        set((state) => ({
          electrodes: state.electrodes.map((e) =>
            e.id === id ? { ...e, ...patch } : e,
          ),
        })),

      deleteElectrode: (id) =>
        set((state) => ({
          electrodes: state.electrodes.filter((e) => e.id !== id),
        })),

      changeStatus: (id, status) =>
        set((state) => ({
          electrodes: state.electrodes.map((e) => {
            if (e.id !== id) return e;
            const usedCount = status === 'using' ? Math.min(e.usedCount + 1, e.maxUseCount) : e.usedCount;
            const finalStatus = usedCount >= e.maxUseCount ? 'worn' : status;
            return { ...e, status: finalStatus, usedCount };
          }),
        })),

      recordUsage: (id, hours) =>
        set((state) => ({
          electrodes: state.electrodes.map((e) => {
            if (e.id !== id) return e;
            const usedCount = Math.min(e.usedCount + 1, e.maxUseCount);
            const status = usedCount >= e.maxUseCount ? 'worn' : e.status === 'pending' ? 'using' : e.status;
            return {
              ...e,
              usedCount,
              status,
              actualHours: hours !== undefined ? e.actualHours + hours : e.actualHours,
            };
          }),
        })),

      updateEdmParams: (id, params) =>
        set((state) => ({
          electrodes: state.electrodes.map((e) =>
            e.id === id ? { ...e, edmParams: { ...e.edmParams, ...params } } : e,
          ),
        })),
    }),
    {
      name: 'mold-electrode-store',
    },
  ),
);
