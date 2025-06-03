import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface User {
  id: string | null;
  name: string | null | undefined;
  email: string | null;
  avatar: string | null | undefined;
  role: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User;
  login: (user: User) => void;
  logout: () => void;
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
        },
        login: (user) =>
          set({
            user,
            isAuthenticated: true,
          }),
        logout: () =>
          set({
            isAuthenticated: false,
            user: {
              id: null,
              name: null,
              email: null,
              avatar: null,
              role: null,
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
