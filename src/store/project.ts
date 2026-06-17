import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  seedProjects,
  type MoldProject,
  type ProjectStatus,
  type Quotation,
} from '../data/seed';

export interface ProjectState {
  projects: MoldProject[];
  statusFilter: ProjectStatus | 'all';
  keyword: string;
}

export interface ProjectActions {
  filteredProjects: () => MoldProject[];
  setStatusFilter: (status: ProjectStatus | 'all') => void;
  setKeyword: (kw: string) => void;
  getProject: (id: string) => MoldProject | undefined;
  getProjectsByStatus: (status: ProjectStatus) => MoldProject[];
  createFromQuotation: (quotation: Quotation, moldBaseCode?: string) => void;
  addProject: (project: Omit<MoldProject, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, patch: Partial<MoldProject>) => void;
  deleteProject: (id: string) => void;
  changeStatus: (id: string, status: ProjectStatus) => void;
  addCycles: (id: string, cycles: number) => void;
}

export type ProjectStore = ProjectState & ProjectActions;

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: seedProjects,
      statusFilter: 'all',
      keyword: '',

      filteredProjects: () => {
        const { projects, statusFilter, keyword } = get();
        return projects.filter((p) => {
          const matchStatus = statusFilter === 'all' || p.status === statusFilter;
          const matchKeyword =
            !keyword ||
            p.projectNo.includes(keyword) ||
            p.customerName.includes(keyword) ||
            p.moldName.includes(keyword);
          return matchStatus && matchKeyword;
        });
      },

      setStatusFilter: (status) => set({ statusFilter: status }),
      setKeyword: (kw) => set({ keyword: kw }),

      getProject: (id) => get().projects.find((p) => p.id === id),

      getProjectsByStatus: (status) =>
        get().projects.filter((p) => p.status === status),

      createFromQuotation: (quotation, moldBaseCode = '') => {
        if (quotation.status !== 'approved') return;
        const exists = get().projects.some((p) => p.quotationId === quotation.id);
        if (exists) return;
        const newProject: MoldProject = {
          id: `p${Date.now()}`,
          projectNo: `PM${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(get().projects.length + 1).padStart(3, '0')}`,
          quotationId: quotation.id,
          moldName: quotation.moldName,
          customerId: quotation.customerId,
          customerName: quotation.customerName,
          moldBaseCode,
          status: 'design',
          totalCycles: quotation.estimatedCycles,
          currentCycles: 0,
          createdAt: new Date().toISOString(),
          plannedDeliveryDate: new Date(Date.now() + quotation.deliveryDays * 86400000)
            .toISOString()
            .slice(0, 10),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },

      addProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            { ...project, id: `p${Date.now()}`, createdAt: new Date().toISOString() },
          ],
        })),

      updateProject: (id, patch) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      changeStatus: (id, status) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== id) return p;
            const updated: Partial<MoldProject> = { status };
            if (status === 'completed' && !p.actualDeliveryDate) {
              updated.actualDeliveryDate = new Date().toISOString().slice(0, 10);
            }
            return { ...p, ...updated };
          }),
        })),

      addCycles: (id, cycles) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, currentCycles: p.currentCycles + cycles } : p,
          ),
        })),
    }),
    {
      name: 'mold-project-store',
    },
  ),
);
