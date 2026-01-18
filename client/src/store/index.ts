import { create } from 'zustand';

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: localStorage.getItem('theme') === 'dark',
  toggleTheme: () =>
    set((state) => {
      const newIsDark = !state.isDark;
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDark: newIsDark };
    }),
}));

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
