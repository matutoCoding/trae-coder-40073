import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { seedMoldBases, type MoldBase } from '../data/seed';

export interface MoldBaseState {
  moldBases: MoldBase[];
  typeFilter: string;
  seriesFilter: string;
  keyword: string;
}

export interface MoldBaseActions {
  filteredMoldBases: () => MoldBase[];
  getTypes: () => string[];
  getSeries: () => string[];
  setTypeFilter: (type: string) => void;
  setSeriesFilter: (series: string) => void;
  setKeyword: (kw: string) => void;
  getMoldBaseByCode: (code: string) => MoldBase | undefined;
  getMoldBase: (id: string) => MoldBase | undefined;
  addMoldBase: (mb: Omit<MoldBase, 'id'>) => void;
  updateMoldBase: (id: string, patch: Partial<MoldBase>) => void;
  deleteMoldBase: (id: string) => void;
  filterByDimension: (minL?: number, maxL?: number, minW?: number, maxW?: number) => MoldBase[];
}

export type MoldBaseStore = MoldBaseState & MoldBaseActions;

export const useMoldBaseStore = create<MoldBaseStore>()(
  persist(
    (set, get) => ({
      moldBases: seedMoldBases,
      typeFilter: 'all',
      seriesFilter: 'all',
      keyword: '',

      filteredMoldBases: () => {
        const { moldBases, typeFilter, seriesFilter, keyword } = get();
        return moldBases.filter((m) => {
          const matchType = typeFilter === 'all' || m.type === typeFilter;
          const matchSeries = seriesFilter === 'all' || m.series === seriesFilter;
          const matchKeyword =
            !keyword ||
            m.code.includes(keyword) ||
            m.type.includes(keyword) ||
            m.series.includes(keyword);
          return matchType && matchSeries && matchKeyword;
        });
      },

      getTypes: () => Array.from(new Set(get().moldBases.map((m) => m.type))),
      getSeries: () => Array.from(new Set(get().moldBases.map((m) => m.series))),

      setTypeFilter: (type) => set({ typeFilter: type }),
      setSeriesFilter: (series) => set({ seriesFilter: series }),
      setKeyword: (kw) => set({ keyword: kw }),

      getMoldBaseByCode: (code) => get().moldBases.find((m) => m.code === code),
      getMoldBase: (id) => get().moldBases.find((m) => m.id === id),

      addMoldBase: (mb) =>
        set((state) => ({
          moldBases: [...state.moldBases, { ...mb, id: `mb${Date.now()}` }],
        })),

      updateMoldBase: (id, patch) =>
        set((state) => ({
          moldBases: state.moldBases.map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        })),

      deleteMoldBase: (id) =>
        set((state) => ({
          moldBases: state.moldBases.filter((m) => m.id !== id),
        })),

      filterByDimension: (minL, maxL, minW, maxW) =>
        get().moldBases.filter((m) => {
          if (minL !== undefined && m.length < minL) return false;
          if (maxL !== undefined && m.length > maxL) return false;
          if (minW !== undefined && m.width < minW) return false;
          if (maxW !== undefined && m.width > maxW) return false;
          return true;
        }),
    }),
    {
      name: 'mold-moldbase-store',
      partialize: (state) => ({ moldBases: state.moldBases }),
    },
  ),
);
