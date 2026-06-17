import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  seedRepairOrders,
  seedConsumableParts,
  seedMoldLedgers,
  type RepairOrder,
  type RepairStatus,
  type ConsumableParts,
  type ConsumableUsage,
  type MoldLedger,
  type LedgerStatus,
} from '../data/seed';

export interface MaintenanceState {
  repairOrders: RepairOrder[];
  consumableParts: ConsumableParts[];
  moldLedgers: MoldLedger[];
  repairStatusFilter: RepairStatus | 'all';
  ledgerStatusFilter: LedgerStatus | 'all';
  projectFilter: string;
}

export interface MaintenanceActions {
  filteredRepairOrders: () => RepairOrder[];
  filteredLedgers: () => MoldLedger[];
  setRepairStatusFilter: (s: RepairStatus | 'all') => void;
  setLedgerStatusFilter: (s: LedgerStatus | 'all') => void;
  setProjectFilter: (pid: string) => void;

  getRepairOrder: (id: string) => RepairOrder | undefined;
  getRepairOrdersByProject: (projectId: string) => RepairOrder[];
  addRepairOrder: (r: Omit<RepairOrder, 'id'>) => void;
  updateRepairOrder: (id: string, patch: Partial<RepairOrder>) => void;
  deleteRepairOrder: (id: string) => void;
  changeRepairStatus: (id: string, status: RepairStatus) => void;
  addRepairPart: (repairId: string, usage: Omit<ConsumableUsage, 'id'>) => void;
  removeRepairPart: (repairId: string, usageId: string) => void;

  getConsumablePart: (id: string) => ConsumableParts | undefined;
  getLowStockParts: () => ConsumableParts[];
  addConsumablePart: (p: Omit<ConsumableParts, 'id'>) => void;
  updateConsumablePart: (id: string, patch: Partial<ConsumableParts>) => void;
  deleteConsumablePart: (id: string) => void;
  stockIn: (id: string, qty: number) => void;
  stockOut: (id: string, qty: number) => boolean;

  getLedger: (id: string) => MoldLedger | undefined;
  getLedgerByProject: (projectId: string) => MoldLedger | undefined;
  addLedger: (l: Omit<MoldLedger, 'id'>) => void;
  updateLedger: (id: string, patch: Partial<MoldLedger>) => void;
  deleteLedger: (id: string) => void;
  changeLedgerStatus: (id: string, status: LedgerStatus, borrower?: string) => void;
  updateLastCycles: (id: string, cycles: number) => void;
}

export type MaintenanceStore = MaintenanceState & MaintenanceActions;

export const useMaintenanceStore = create<MaintenanceStore>()(
  persist(
    (set, get) => ({
      repairOrders: seedRepairOrders,
      consumableParts: seedConsumableParts,
      moldLedgers: seedMoldLedgers,
      repairStatusFilter: 'all',
      ledgerStatusFilter: 'all',
      projectFilter: '',

      filteredRepairOrders: () => {
        const { repairOrders, repairStatusFilter, projectFilter } = get();
        return repairOrders.filter((r) => {
          const matchStatus = repairStatusFilter === 'all' || r.status === repairStatusFilter;
          const matchProject = !projectFilter || r.projectId === projectFilter;
          return matchStatus && matchProject;
        });
      },

      filteredLedgers: () => {
        const { moldLedgers, ledgerStatusFilter } = get();
        return moldLedgers.filter((l) => ledgerStatusFilter === 'all' || l.status === ledgerStatusFilter);
      },

      setRepairStatusFilter: (s) => set({ repairStatusFilter: s }),
      setLedgerStatusFilter: (s) => set({ ledgerStatusFilter: s }),
      setProjectFilter: (pid) => set({ projectFilter: pid }),

      getRepairOrder: (id) => get().repairOrders.find((r) => r.id === id),
      getRepairOrdersByProject: (projectId) =>
        get().repairOrders.filter((r) => r.projectId === projectId),

      addRepairOrder: (r) =>
        set((state) => ({
          repairOrders: [...state.repairOrders, { ...r, id: `ro${Date.now()}` }],
        })),

      updateRepairOrder: (id, patch) =>
        set((state) => ({
          repairOrders: state.repairOrders.map((r) =>
            r.id === id ? { ...r, ...patch } : r,
          ),
        })),

      deleteRepairOrder: (id) =>
        set((state) => ({
          repairOrders: state.repairOrders.filter((r) => r.id !== id),
        })),

      changeRepairStatus: (id, status) =>
        set((state) => ({
          repairOrders: state.repairOrders.map((r) => {
            if (r.id !== id) return r;
            const updated: Partial<RepairOrder> = { status };
            if (status === 'completed' && !r.finishDate) {
              updated.finishDate = new Date().toISOString();
            }
            return { ...r, ...updated };
          }),
        })),

      addRepairPart: (repairId, usage) =>
        set((state) => ({
          repairOrders: state.repairOrders.map((r) =>
            r.id === repairId
              ? { ...r, parts: [...r.parts, { ...usage, id: `pu${Date.now()}` }] }
              : r,
          ),
        })),

      removeRepairPart: (repairId, usageId) =>
        set((state) => ({
          repairOrders: state.repairOrders.map((r) =>
            r.id === repairId
              ? { ...r, parts: r.parts.filter((p) => p.id !== usageId) }
              : r,
          ),
        })),

      getConsumablePart: (id) => get().consumableParts.find((p) => p.id === id),
      getLowStockParts: () =>
        get().consumableParts.filter((p) => p.stock <= p.minStock),

      addConsumablePart: (p) =>
        set((state) => ({
          consumableParts: [...state.consumableParts, { ...p, id: `cp${Date.now()}` }],
        })),

      updateConsumablePart: (id, patch) =>
        set((state) => ({
          consumableParts: state.consumableParts.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),

      deleteConsumablePart: (id) =>
        set((state) => ({
          consumableParts: state.consumableParts.filter((p) => p.id !== id),
        })),

      stockIn: (id, qty) =>
        set((state) => ({
          consumableParts: state.consumableParts.map((p) =>
            p.id === id ? { ...p, stock: p.stock + qty } : p,
          ),
        })),

      stockOut: (id, qty) => {
        const part = get().consumableParts.find((p) => p.id === id);
        if (!part || part.stock < qty) return false;
        set((state) => ({
          consumableParts: state.consumableParts.map((p) =>
            p.id === id ? { ...p, stock: p.stock - qty } : p,
          ),
        }));
        return true;
      },

      getLedger: (id) => get().moldLedgers.find((l) => l.id === id),
      getLedgerByProject: (projectId) =>
        get().moldLedgers.find((l) => l.projectId === projectId),

      addLedger: (l) =>
        set((state) => ({
          moldLedgers: [...state.moldLedgers, { ...l, id: `ml${Date.now()}` }],
        })),

      updateLedger: (id, patch) =>
        set((state) => ({
          moldLedgers: state.moldLedgers.map((l) =>
            l.id === id ? { ...l, ...patch } : l,
          ),
        })),

      deleteLedger: (id) =>
        set((state) => ({
          moldLedgers: state.moldLedgers.filter((l) => l.id !== id),
        })),

      changeLedgerStatus: (id, status, borrower) =>
        set((state) => ({
          moldLedgers: state.moldLedgers.map((l) => {
            if (l.id !== id) return l;
            const today = new Date().toISOString().slice(0, 10);
            const updated: Partial<MoldLedger> = { status };
            if (borrower !== undefined) updated.borrower = borrower;
            if ((status === 'in_stock' || status === 'loaned' || status === 'using') && !l.inDate) {
              updated.inDate = today;
            }
            if ((status === 'loaned' || status === 'using') && !l.outDate) {
              updated.outDate = today;
            }
            if (status === 'in_stock') {
              updated.outDate = undefined;
            }
            return { ...l, ...updated };
          }),
        })),

      updateLastCycles: (id, cycles) =>
        set((state) => ({
          moldLedgers: state.moldLedgers.map((l) =>
            l.id === id ? { ...l, lastCycles: l.lastCycles + cycles } : l,
          ),
        })),
    }),
    {
      name: 'mold-maintenance-store',
    },
  ),
);
