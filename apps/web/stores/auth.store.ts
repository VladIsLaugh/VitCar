import { create } from 'zustand';
import { setAccessToken } from '@/lib/api';

interface AuthStore {
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  accessToken: null,
  login: (token) => {
    setAccessToken(token);
    set({ accessToken: token });
  },
  logout: () => {
    setAccessToken(null);
    set({ accessToken: null });
  },
}));
