import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface User {
  id: string | null;
  name: string | null | undefined;
  dateOfBirth: string | null;
  gender: string | null;
  mobileNumber: string | null;
  email: string | null;
  avatar: string | null;
  role: string | null;
  authProvider: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User;
  login: (user: User) => void;
  logout: () => void;
  update: (userData: Partial<User>) => void;
}

const isDev = import.meta.env?.MODE === 'development';

export const useAuthStore = create<AuthState>()(
  persist(
    devtools(
      (set) => ({
        isAuthenticated: false,
        user: {
          id: null,
          name: null,
          email: null,
          avatar: null,
          role: null,
          dateOfBirth: null,
          gender: null,
          mobileNumber: null,
          authProvider: null,
        },
        login: (user) =>
          set({
            user,
            isAuthenticated: true,
          }),
        update: (userData) =>
          set((state) => ({
            user: {
              ...state.user,
              ...userData,
            },
          })),
        logout: () =>
          set({
            isAuthenticated: false,
            user: {
              id: null,
              name: null,
              email: null,
              avatar: null,
              role: null,
              dateOfBirth: null,
              gender: null,
              mobileNumber: null,
              authProvider: null,
            },
          }),
      }),
      { name: 'AuthStore', enabled: isDev },
    ),
    {
      name: 'auth-storage',
    },
  ),
);
