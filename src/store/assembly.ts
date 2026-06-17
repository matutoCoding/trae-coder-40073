import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  seedAssemblyTasks,
  type AssemblyStatus,
  type AssemblyStep,
  type AssemblyTask,
} from '../data/seed';

export interface AssemblyState {
  assemblyTasks: AssemblyTask[];
  statusFilter: AssemblyStatus | 'all';
  projectFilter: string;
}

export interface AssemblyActions {
  filteredTasks: () => AssemblyTask[];
  setStatusFilter: (s: AssemblyStatus | 'all') => void;
  setProjectFilter: (pid: string) => void;
  getTask: (id: string) => AssemblyTask | undefined;
  getTasksByProject: (projectId: string) => AssemblyTask | undefined;
  addTask: (t: Omit<AssemblyTask, 'id'>) => void;
  updateTask: (id: string, patch: Partial<AssemblyTask>) => void;
  deleteTask: (id: string) => void;
  toggleStep: (taskId: string, stepId: string, hours?: number) => void;
  addStep: (taskId: string, step: Omit<AssemblyStep, 'id' | 'done' | 'order'>) => void;
  removeStep: (taskId: string, stepId: string) => void;
  changeStatus: (id: string, status: AssemblyStatus) => void;
  addIssue: (taskId: string, issue: string) => void;
  removeIssue: (taskId: string, index: number) => void;
  recalcActualHours: (taskId: string) => void;
}

export type AssemblyStore = AssemblyState & AssemblyActions;

const recalcHours = (steps: AssemblyStep[]) =>
  steps.filter((s) => s.done).reduce((sum, s) => sum + s.hours, 0);

const reorderSteps = (steps: AssemblyStep[]) =>
  [...steps].sort((a, b) => a.order - b.order).map((s, idx) => ({ ...s, order: idx + 1 }));

export const useAssemblyStore = create<AssemblyStore>()(
  persist(
    (set, get) => ({
      assemblyTasks: seedAssemblyTasks,
      statusFilter: 'all',
      projectFilter: '',

      filteredTasks: () => {
        const { assemblyTasks, statusFilter, projectFilter } = get();
        return assemblyTasks.filter((t) => {
          const matchStatus = statusFilter === 'all' || t.status === statusFilter;
          const matchProject = !projectFilter || t.projectId === projectFilter;
          return matchStatus && matchProject;
        });
      },

      setStatusFilter: (s) => set({ statusFilter: s }),
      setProjectFilter: (pid) => set({ projectFilter: pid }),

      getTask: (id) => get().assemblyTasks.find((t) => t.id === id),
      getTasksByProject: (projectId) =>
        get().assemblyTasks.find((t) => t.projectId === projectId),

      addTask: (t) =>
        set((state) => ({
          assemblyTasks: [...state.assemblyTasks, { ...t, id: `asm${Date.now()}` }],
        })),

      updateTask: (id, patch) =>
        set((state) => ({
          assemblyTasks: state.assemblyTasks.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          assemblyTasks: state.assemblyTasks.filter((t) => t.id !== id),
        })),

      toggleStep: (taskId, stepId, hours) =>
        set((state) => ({
          assemblyTasks: state.assemblyTasks.map((t) => {
            if (t.id !== taskId) return t;
            const newSteps = t.steps.map((s) => {
              if (s.id !== stepId) return s;
              const done = !s.done;
              return { ...s, done, hours: hours !== undefined && done ? hours : s.hours };
            });
            const allDone = newSteps.length > 0 && newSteps.every((s) => s.done);
            return {
              ...t,
              steps: newSteps,
              actualHours: recalcHours(newSteps),
              status: allDone ? 'inspection' : t.status === 'pending' ? 'in_progress' : t.status,
            };
          }),
        })),

      addStep: (taskId, step) =>
        set((state) => ({
          assemblyTasks: state.assemblyTasks.map((t) => {
            if (t.id !== taskId) return t;
            const newStep: AssemblyStep = {
              ...step,
              id: `s${Date.now()}${Math.floor(Math.random() * 100)}`,
              done: false,
              order: t.steps.length + 1,
            };
            return { ...t, steps: [...t.steps, newStep] };
          }),
        })),

      removeStep: (taskId, stepId) =>
        set((state) => ({
          assemblyTasks: state.assemblyTasks.map((t) => {
            if (t.id !== taskId) return t;
            const steps = reorderSteps(t.steps.filter((s) => s.id !== stepId));
            return { ...t, steps, actualHours: recalcHours(steps) };
          }),
        })),

      changeStatus: (id, status) =>
        set((state) => ({
          assemblyTasks: state.assemblyTasks.map((t) =>
            t.id === id ? { ...t, status } : t,
          ),
        })),

      addIssue: (taskId, issue) =>
        set((state) => ({
          assemblyTasks: state.assemblyTasks.map((t) =>
            t.id === taskId ? { ...t, issues: [...t.issues, issue] } : t,
          ),
        })),

      removeIssue: (taskId, index) =>
        set((state) => ({
          assemblyTasks: state.assemblyTasks.map((t) => {
            if (t.id !== taskId) return t;
            const issues = t.issues.filter((_, i) => i !== index);
            return { ...t, issues };
          }),
        })),

      recalcActualHours: (taskId) =>
        set((state) => ({
          assemblyTasks: state.assemblyTasks.map((t) =>
            t.id === taskId ? { ...t, actualHours: recalcHours(t.steps) } : t,
          ),
        })),
    }),
    {
      name: 'mold-assembly-store',
    },
  ),
);
