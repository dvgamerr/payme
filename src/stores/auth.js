/**
 * Authentication Store
 * Manages user authentication state and operations
 */
import { writable } from 'svelte/store';
import { api } from '../lib/api.js';

function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    loading: true,
    error: null,
  });

  return {
    subscribe,

    /**
     * Check if user is authenticated
     */
    checkAuth: async () => {
      try {
        const user = await api.auth.me();
        set({ user, loading: false, error: null });
      } catch (error) {
        set({ user: null, loading: false, error: null });
      }
    },

    /**
     * Register new user and auto-login
     * @param {string} username
     * @param {string} password
     */
    register: async (username, password) => {
      try {
        update((state) => ({ ...state, loading: true, error: null }));
        const user = await api.auth.register(username, password);
        set({ user, loading: false, error: null });
        return { success: true };
      } catch (error) {
        update((state) => ({ ...state, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
    },

    /**
     * Login existing user
     * @param {string} username
     * @param {string} password
     */
    login: async (username, password) => {
      try {
        update((state) => ({ ...state, loading: true, error: null }));
        const user = await api.auth.login(username, password);
        set({ user, loading: false, error: null });
        return { success: true };
      } catch (error) {
        update((state) => ({ ...state, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
    },

    /**
     * Logout current user
     */
    logout: async () => {
      try {
        await api.auth.logout();
        set({ user: null, loading: false, error: null });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    },

    /**
     * Clear error state
     */
    clearError: () => {
      update((state) => ({ ...state, error: null }));
    },
  };
}

export const auth = createAuthStore();
