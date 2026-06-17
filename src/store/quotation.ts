import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  seedQuotations,
  type Quotation,
  type QuotationStatus,
} from '../data/seed';

export interface QuotationState {
  quotations: Quotation[];
  statusFilter: QuotationStatus | 'all';
  keyword: string;
}

export interface QuotationActions {
  filteredQuotations: () => Quotation[];
  setStatusFilter: (status: QuotationStatus | 'all') => void;
  setKeyword: (kw: string) => void;
  getQuotation: (id: string) => Quotation | undefined;
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'totalCost' | 'profitAmount' | 'quotationPrice'>) => void;
  updateQuotation: (id: string, patch: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  submitQuotation: (id: string) => void;
  approveQuotation: (id: string) => void;
  rejectQuotation: (id: string, remark?: string) => void;
  expireQuotation: (id: string) => void;
}

export type QuotationStore = QuotationState & QuotationActions;

const calcCostFields = (q: Partial<Quotation>) => {
  const mc = q.materialCost ?? 0;
  const mach = q.machiningCost ?? 0;
  const ec = q.electrodeCost ?? 0;
  const ac = q.assemblyCost ?? 0;
  const tmc = q.tryMoldCost ?? 0;
  const oc = q.otherCost ?? 0;
  const totalCost = mc + mach + ec + ac + tmc + oc;
  const margin = q.profitMargin ?? 0.2;
  const profitAmount = Math.round(totalCost * margin);
  const quotationPrice = totalCost + profitAmount;
  return { totalCost, profitAmount, quotationPrice };
};

export const useQuotationStore = create<QuotationStore>()(
  persist(
    (set, get) => ({
      quotations: seedQuotations,
      statusFilter: 'all',
      keyword: '',

      filteredQuotations: () => {
        const { quotations, statusFilter, keyword } = get();
        return quotations.filter((q) => {
          const matchStatus = statusFilter === 'all' || q.status === statusFilter;
          const matchKeyword =
            !keyword ||
            q.quotationNo.includes(keyword) ||
            q.customerName.includes(keyword) ||
            q.moldName.includes(keyword);
          return matchStatus && matchKeyword;
        });
      },

      setStatusFilter: (status) => set({ statusFilter: status }),
      setKeyword: (kw) => set({ keyword: kw }),

      getQuotation: (id) => get().quotations.find((q) => q.id === id),

      addQuotation: (quotation) => {
        const costs = calcCostFields(quotation);
        set((state) => ({
          quotations: [
            ...state.quotations,
            {
              ...quotation,
              ...costs,
              id: `q${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updateQuotation: (id, patch) =>
        set((state) => ({
          quotations: state.quotations.map((q) => {
            if (q.id !== id) return q;
            const merged = { ...q, ...patch };
            const costs = calcCostFields(merged);
            return { ...merged, ...costs };
          }),
        })),

      deleteQuotation: (id) =>
        set((state) => ({
          quotations: state.quotations.filter((q) => q.id !== id),
        })),

      submitQuotation: (id) =>
        set((state) => ({
          quotations: state.quotations.map((q) =>
            q.id === id && q.status === 'draft'
              ? { ...q, status: 'pending' as QuotationStatus }
              : q,
          ),
        })),

      approveQuotation: (id) =>
        set((state) => ({
          quotations: state.quotations.map((q) =>
            q.id === id && q.status === 'pending'
              ? { ...q, status: 'approved' as QuotationStatus, approvedAt: new Date().toISOString() }
              : q,
          ),
        })),

      rejectQuotation: (id, remark) =>
        set((state) => ({
          quotations: state.quotations.map((q) =>
            q.id === id && q.status === 'pending'
              ? { ...q, status: 'rejected' as QuotationStatus, remark }
              : q,
          ),
        })),

      expireQuotation: (id) =>
        set((state) => ({
          quotations: state.quotations.map((q) =>
            q.id === id ? { ...q, status: 'expired' as QuotationStatus } : q,
          ),
        })),
    }),
    {
      name: 'mold-quotation-store',
    },
  ),
);
