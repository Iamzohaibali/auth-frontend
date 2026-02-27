import { create } from 'zustand';
import { authAPI } from '../api/index.js';

const useAuthStore = create((set) => ({
  user:            null,
  isLoading:       true,   // true only on first mount
  isAuthenticated: false,

  // Called once on app mount to restore session from cookie
  checkAuth: async () => {
    try {
      const res = await authAPI.getMe();
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      // Not logged in — always clear loading state
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    const res = await authAPI.login(credentials);
    if (res.data.requires2FA) {
      return { requires2FA: true, pendingToken: res.data.pendingToken };
    }
    set({ user: res.data.user, isAuthenticated: true });
    return { requires2FA: false };
  },

  verify2FA: async (data) => {
    const res = await authAPI.verify2FA(data);
    set({ user: res.data.user, isAuthenticated: true });
  },

  logout: async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));

export default useAuthStore;