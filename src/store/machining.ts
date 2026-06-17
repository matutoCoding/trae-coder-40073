import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  seedCavityTasks,
  seedWireCutTasks,
  type CavityTask,
  type CavityTaskStatus,
  type PartType,
  type WireCutStatus,
  type WireCutTask,
} from '../data/seed';

export interface MachiningState {
  cavityTasks: CavityTask[];
  wireCutTasks: WireCutTask[];
  cavityStatusFilter: CavityTaskStatus | 'all';
  wireCutStatusFilter: WireCutStatus | 'all';
  partTypeFilter: PartType | 'all';
  projectFilter: string;
}

export interface MachiningActions {
  filteredCavityTasks: () => CavityTask[];
  filteredWireCutTasks: () => WireCutTask[];
  setCavityStatusFilter: (s: CavityTaskStatus | 'all') => void;
  setWireCutStatusFilter: (s: WireCutStatus | 'all') => void;
  setPartTypeFilter: (t: PartType | 'all') => void;
  setProjectFilter: (pid: string) => void;

  getCavityTask: (id: string) => CavityTask | undefined;
  getCavityTasksByProject: (projectId: string) => CavityTask[];
  addCavityTask: (t: Omit<CavityTask, 'id'>) => void;
  updateCavityTask: (id: string, patch: Partial<CavityTask>) => void;
  deleteCavityTask: (id: string) => void;
  changeCavityStatus: (id: string, status: CavityTaskStatus) => void;
  advanceCavityProcess: (id: string, hours: number) => void;

  getWireCutTask: (id: string) => WireCutTask | undefined;
  getWireCutTasksByProject: (projectId: string) => WireCutTask[];
  addWireCutTask: (t: Omit<WireCutTask, 'id'>) => void;
  updateWireCutTask: (id: string, patch: Partial<WireCutTask>) => void;
  deleteWireCutTask: (id: string) => void;
  changeWireCutStatus: (id: string, status: WireCutStatus, hours?: number) => void;
}

export type MachiningStore = MachiningState & MachiningActions;

export const useMachiningStore = create<MachiningStore>()(
  persist(
    (set, get) => ({
      cavityTasks: seedCavityTasks,
      wireCutTasks: seedWireCutTasks,
      cavityStatusFilter: 'all',
      wireCutStatusFilter: 'all',
      partTypeFilter: 'all',
      projectFilter: '',

      filteredCavityTasks: () => {
        const { cavityTasks, cavityStatusFilter, partTypeFilter, projectFilter } = get();
        return cavityTasks.filter((t) => {
          const matchStatus = cavityStatusFilter === 'all' || t.status === cavityStatusFilter;
          const matchType = partTypeFilter === 'all' || t.partType === partTypeFilter;
          const matchProject = !projectFilter || t.projectId === projectFilter;
          return matchStatus && matchType && matchProject;
        });
      },

      filteredWireCutTasks: () => {
        const { wireCutTasks, wireCutStatusFilter, projectFilter } = get();
        return wireCutTasks.filter((t) => {
          const matchStatus = wireCutStatusFilter === 'all' || t.status === wireCutStatusFilter;
          const matchProject = !projectFilter || t.projectId === projectFilter;
          return matchStatus && matchProject;
        });
      },

      setCavityStatusFilter: (s) => set({ cavityStatusFilter: s }),
      setWireCutStatusFilter: (s) => set({ wireCutStatusFilter: s }),
      setPartTypeFilter: (t) => set({ partTypeFilter: t }),
      setProjectFilter: (pid) => set({ projectFilter: pid }),

      getCavityTask: (id) => get().cavityTasks.find((t) => t.id === id),
      getCavityTasksByProject: (projectId) =>
        get().cavityTasks.filter((t) => t.projectId === projectId),

      addCavityTask: (t) =>
        set((state) => ({
          cavityTasks: [...state.cavityTasks, { ...t, id: `ct${Date.now()}` }],
        })),

      updateCavityTask: (id, patch) =>
        set((state) => ({
          cavityTasks: state.cavityTasks.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),

      deleteCavityTask: (id) =>
        set((state) => ({
          cavityTasks: state.cavityTasks.filter((t) => t.id !== id),
        })),

      changeCavityStatus: (id, status) =>
        set((state) => ({
          cavityTasks: state.cavityTasks.map((t) => {
            if (t.id !== id) return t;
            const updated: Partial<CavityTask> = { status };
            if (status === 'completed' && !t.finishDate) {
              updated.finishDate = new Date().toISOString().slice(0, 10);
            }
            return { ...t, ...updated };
          }),
        })),

      advanceCavityProcess: (id, hours) =>
        set((state) => ({
          cavityTasks: state.cavityTasks.map((t) => {
            if (t.id !== id) return t;
            const nextProcess = Math.min(t.currentProcess + 1, t.processRoute.length);
            const isDone = nextProcess >= t.processRoute.length;
            return {
              ...t,
              currentProcess: nextProcess,
              actualHours: t.actualHours + hours,
              status: isDone
                ? 'completed'
                : nextProcess === 1
                  ? 'programming'
                  : nextProcess >= t.processRoute.length - 1
                    ? 'inspection'
                    : 'machining',
              finishDate: isDone
                ? new Date().toISOString().slice(0, 10)
                : t.finishDate,
            };
          }),
        })),

      getWireCutTask: (id) => get().wireCutTasks.find((t) => t.id === id),
      getWireCutTasksByProject: (projectId) =>
        get().wireCutTasks.filter((t) => t.projectId === projectId),

      addWireCutTask: (t) =>
        set((state) => ({
          wireCutTasks: [...state.wireCutTasks, { ...t, id: `wc${Date.now()}` }],
        })),

      updateWireCutTask: (id, patch) =>
        set((state) => ({
          wireCutTasks: state.wireCutTasks.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),

      deleteWireCutTask: (id) =>
        set((state) => ({
          wireCutTasks: state.wireCutTasks.filter((t) => t.id !== id),
        })),

      changeWireCutStatus: (id, status, hours) =>
        set((state) => ({
          wireCutTasks: state.wireCutTasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  actualHours: hours !== undefined ? t.actualHours + hours : t.actualHours,
                }
              : t,
          ),
        })),
    }),
    {
      name: 'mold-machining-store',
    },
  ),
);
