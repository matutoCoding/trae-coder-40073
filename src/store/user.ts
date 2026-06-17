import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { seedUsers, type User, type UserRole } from '../data/seed';

export interface UserState {
  users: User[];
  currentUserId: string;
}

export interface UserActions {
  getCurrentUser: () => User | undefined;
  setCurrentUser: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  findUsersByRole: (role: UserRole) => User[];
}

export type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      currentUserId: seedUsers.find((u) => u.role === 'admin')?.id ?? seedUsers[0]?.id ?? '',

      getCurrentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId);
      },

      setCurrentUser: (id) => set({ currentUserId: id }),

      addUser: (user) =>
        set((state) => ({
          users: [
            ...state.users,
            { ...user, id: `u${Date.now()}` },
          ],
        })),

      updateUser: (id, patch) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...patch } : u,
          ),
        })),

      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),

      findUsersByRole: (role) => {
        const { users } = get();
        return users.filter((u) => u.role === role);
      },
    }),
    {
      name: 'mold-user-store',
    },
  ),
);
