import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  seedTryMoldApplies,
  seedTryMoldRecords,
  seedInspections,
  type TryMoldApply,
  type TryMoldApplyStatus,
  type TryMoldRecord,
  type Inspection,
  type InspectionItem,
  type InspectionResult,
} from '../data/seed';

export interface TryMoldState {
  applies: TryMoldApply[];
  records: TryMoldRecord[];
  inspections: Inspection[];
  applyStatusFilter: TryMoldApplyStatus | 'all';
  projectFilter: string;
}

export interface TryMoldActions {
  filteredApplies: () => TryMoldApply[];
  setApplyStatusFilter: (s: TryMoldApplyStatus | 'all') => void;
  setProjectFilter: (pid: string) => void;

  getApply: (id: string) => TryMoldApply | undefined;
  getAppliesByProject: (projectId: string) => TryMoldApply[];
  getApplyRecords: (applyId: string) => TryMoldRecord[];
  getRecordInspection: (tryRecordId: string) => Inspection | undefined;
  getProjectLifetimeStats: () => { projectId: string; projectNo: string; totalTries: number; cycles: number; inspections: number; passRate: number }[];

  addApply: (a: Omit<TryMoldApply, 'id'>) => void;
  updateApply: (id: string, patch: Partial<TryMoldApply>) => void;
  deleteApply: (id: string) => void;
  changeApplyStatus: (id: string, status: TryMoldApplyStatus) => void;

  addRecord: (r: Omit<TryMoldRecord, 'id'>) => void;
  updateRecord: (id: string, patch: Partial<TryMoldRecord>) => void;
  deleteRecord: (id: string) => void;

  addInspection: (i: Omit<Inspection, 'id'>) => void;
  updateInspection: (id: string, patch: Partial<Inspection>) => void;
  deleteInspection: (id: string) => void;
  addInspectionItem: (inspectionId: string, item: Omit<InspectionItem, 'id'>) => void;
  updateInspectionItem: (inspectionId: string, itemId: string, patch: Partial<InspectionItem>) => void;
  removeInspectionItem: (inspectionId: string, itemId: string) => void;
  calcInspectionResult: (inspectionId: string) => void;
}

export type TryMoldStore = TryMoldState & TryMoldActions;

const calcResult = (items: InspectionItem[]): InspectionResult => {
  if (items.length === 0) return 'conditional';
  const fail = items.filter((i) => i.result === 'fail').length;
  if (fail === 0) return 'pass';
  if (fail / items.length > 0.3) return 'fail';
  return 'conditional';
};

export const useTryMoldStore = create<TryMoldStore>()(
  persist(
    (set, get) => ({
      applies: seedTryMoldApplies,
      records: seedTryMoldRecords,
      inspections: seedInspections,
      applyStatusFilter: 'all',
      projectFilter: '',

      filteredApplies: () => {
        const { applies, applyStatusFilter, projectFilter } = get();
        return applies.filter((a) => {
          const matchStatus = applyStatusFilter === 'all' || a.status === applyStatusFilter;
          const matchProject = !projectFilter || a.projectId === projectFilter;
          return matchStatus && matchProject;
        });
      },

      setApplyStatusFilter: (s) => set({ applyStatusFilter: s }),
      setProjectFilter: (pid) => set({ projectFilter: pid }),

      getApply: (id) => get().applies.find((a) => a.id === id),
      getAppliesByProject: (projectId) =>
        get().applies.filter((a) => a.projectId === projectId),
      getApplyRecords: (applyId) =>
        get().records.filter((r) => r.applyId === applyId),
      getRecordInspection: (tryRecordId) =>
        get().inspections.find((i) => i.tryRecordId === tryRecordId),

      getProjectLifetimeStats: () => {
        const { applies, inspections } = get();
        const grouped: Record<string, { projectId: string; projectNo: string; applies: TryMoldApply[]; inspections: Inspection[] }> = {};
        applies.forEach((a) => {
          if (!grouped[a.projectId]) {
            grouped[a.projectId] = { projectId: a.projectId, projectNo: a.projectNo, applies: [], inspections: [] };
          }
          grouped[a.projectId].applies.push(a);
        });
        inspections.forEach((ins) => {
          const apply = applies.find((a) => ins.tryRecordId && get().records.some((r) => r.id === ins.tryRecordId && r.applyId === a.id));
          if (apply && grouped[apply.projectId]) {
            grouped[apply.projectId].inspections.push(ins);
          }
        });
        return Object.values(grouped).map((g) => {
          const passItems = g.inspections.flatMap((i) => i.items).filter((it) => it.result === 'pass').length;
          const totalItems = g.inspections.flatMap((i) => i.items).length;
          return {
            projectId: g.projectId,
            projectNo: g.projectNo,
            totalTries: g.applies.length,
            cycles: g.applies.length * 1000,
            inspections: g.inspections.length,
            passRate: totalItems === 0 ? 0 : Math.round((passItems / totalItems) * 100),
          };
        });
      },

      addApply: (a) =>
        set((state) => ({
          applies: [...state.applies, { ...a, id: `tma${Date.now()}` }],
        })),

      updateApply: (id, patch) =>
        set((state) => ({
          applies: state.applies.map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          ),
        })),

      deleteApply: (id) =>
        set((state) => ({
          applies: state.applies.filter((a) => a.id !== id),
        })),

      changeApplyStatus: (id, status) =>
        set((state) => ({
          applies: state.applies.map((a) =>
            a.id === id ? { ...a, status } : a,
          ),
        })),

      addRecord: (r) =>
        set((state) => ({
          records: [...state.records, { ...r, id: `tmr${Date.now()}` }],
        })),

      updateRecord: (id, patch) =>
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...patch } : r,
          ),
        })),

      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),

      addInspection: (i) =>
        set((state) => ({
          inspections: [...state.inspections, { ...i, id: `ins${Date.now()}` }],
        })),

      updateInspection: (id, patch) =>
        set((state) => ({
          inspections: state.inspections.map((ins) =>
            ins.id === id ? { ...ins, ...patch } : ins,
          ),
        })),

      deleteInspection: (id) =>
        set((state) => ({
          inspections: state.inspections.filter((ins) => ins.id !== id),
        })),

      addInspectionItem: (inspectionId, item) =>
        set((state) => ({
          inspections: state.inspections.map((ins) => {
            if (ins.id !== inspectionId) return ins;
            const newItem: InspectionItem = { ...item, id: `it${Date.now()}` };
            const items = [...ins.items, newItem];
            return { ...ins, items, result: calcResult(items) };
          }),
        })),

      updateInspectionItem: (inspectionId, itemId, patch) =>
        set((state) => ({
          inspections: state.inspections.map((ins) => {
            if (ins.id !== inspectionId) return ins;
            const items = ins.items.map((it) =>
              it.id === itemId ? { ...it, ...patch } : it,
            );
            return { ...ins, items, result: calcResult(items) };
          }),
        })),

      removeInspectionItem: (inspectionId, itemId) =>
        set((state) => ({
          inspections: state.inspections.map((ins) => {
            if (ins.id !== inspectionId) return ins;
            const items = ins.items.filter((it) => it.id !== itemId);
            return { ...ins, items, result: calcResult(items) };
          }),
        })),

      calcInspectionResult: (inspectionId) =>
        set((state) => ({
          inspections: state.inspections.map((ins) =>
            ins.id === inspectionId ? { ...ins, result: calcResult(ins.items) } : ins,
          ),
        })),
    }),
    {
      name: 'mold-trymold-store',
    },
  ),
);
