'use client';

import axios from 'axios';
import { create } from 'zustand';
import type { UserRole } from '@/lib/validations/auth';

// ─── Types ───────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  clearError: () => void;
  hydrate: () => void;
}

type AuthStore = AuthState & AuthActions;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function normalizeRole(role: string): UserRole {
  return role.toLowerCase() as UserRole;
}

// ─── Helpers ─────────────────────────────────────────────────
const TOKEN_KEY = 'harvest_auth_token';
const USER_KEY = 'harvest_auth_user';

function saveToStorage(token: string, user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function loadFromStorage(): { token: string | null; user: User | null } {
  if (typeof window === 'undefined') return { token: null, user: null };
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { access_token, user } = response.data;
      const normalizedUser = { ...user, role: normalizeRole(user.role) };
      saveToStorage(access_token, normalizedUser);
      set({ user: normalizedUser, token: access_token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Login failed. Check your credentials.',
      });
    }
  },

  signup: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        full_name: name,
        email,
        password,
        role: role.toUpperCase(),
      });

      const { access_token, user } = response.data;
      const normalizedUser = { ...user, role: normalizeRole(user.role) };
      saveToStorage(access_token, normalizedUser);
      set({ user: normalizedUser, token: access_token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Signup failed. Please try again.',
      });
    }
  },

  logout: async () => {
    try {
      const { token } = loadFromStorage();
      if (token) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
    } catch {
      // ignore logout failures
    } finally {
      clearStorage();
      set({ user: null, token: null, isAuthenticated: false, error: null });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      set({ isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Request failed. Please try again.',
      });
    }
  },

  clearError: () => set({ error: null }),

  hydrate: () => {
    const { token, user } = loadFromStorage();
    if (token && user) {
      set({ token, user, isAuthenticated: true });
    }
  },
}));
