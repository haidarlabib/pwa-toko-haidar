import { create } from 'zustand';
import type { User, UserRole } from '../types/database.types';
import { INITIAL_USERS } from '../lib/seedData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password?: string;
}

interface AppState {
  isOnline: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  availableUsers: User[];
  toasts: Toast[];
  setOnline: (status: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => Promise<void>;
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  syncAuthSession: () => Promise<void>;
}

const STORAGE_KEY_USER = 'haidar_active_user';
const STORAGE_KEY_USERS_LIST = 'haidar_available_users';

function getStoredInitialState(): { currentUser: User | null; isAuthenticated: boolean; availableUsers: User[] } {
  try {
    const storedUsers = localStorage.getItem(STORAGE_KEY_USERS_LIST);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;

    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return { currentUser: parsed, isAuthenticated: true, availableUsers: users };
    }

    return { currentUser: users[0], isAuthenticated: true, availableUsers: users };
  } catch {
    return { currentUser: INITIAL_USERS[0], isAuthenticated: true, availableUsers: INITIAL_USERS };
  }
}

const initial = getStoredInitialState();

export const useAppStore = create<AppState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isAuthenticated: initial.isAuthenticated,
  currentUser: initial.currentUser,
  availableUsers: initial.availableUsers,
  toasts: [],

  setOnline: (status) => set({ isOnline: status }),

  showToast: (message, type = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3500);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  syncAuthSession: async () => {
    if (!isSupabaseConfigured()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const user: User = {
            id: profile.id,
            name: profile.full_name,
            username: profile.username,
            email: session.user.email || profile.username + '@haidarplastik.com',
            role: profile.role as UserRole,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          };
          set({ currentUser: user, isAuthenticated: true });
          try {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Auth session check failed:', err);
    }
  },

  login: async (identifier: string, password?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, error: 'Silakan masukkan username atau email' };
    }

    // 1. Try Supabase Auth if password provided and online
    if (isSupabaseConfigured() && password && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const emailToUse = cleanId.includes('@') ? cleanId : `${cleanId}@haidarplastik.com`;
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: password,
        });

        if (!authError && authData.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profile) {
            const user: User = {
              id: profile.id,
              name: profile.full_name,
              username: profile.username,
              email: authData.user.email || emailToUse,
              role: profile.role as UserRole,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
            };

            set({ currentUser: user, isAuthenticated: true });
            try {
              localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
            } catch {}

            get().showToast(`Selamat datang, ${user.name}!`);
            return { success: true, role: user.role };
          }
        }
      } catch (err) {
        console.warn('Supabase auth sign in fallback to local accounts:', err);
      }
    }

    // 2. Local / Demo User matching (for instant evaluations & offline resilience)
    const { availableUsers } = get();
    const user = availableUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (!user) {
      return {
        success: false,
        error: 'Akun tidak ditemukan. Cek kembali username/email atau pilih akun demo.',
      };
    }

    set({ currentUser: user, isAuthenticated: true });
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch {}

    get().showToast(`Selamat datang, ${user.name}!`);
    return { success: true, role: user.role };
  },

  register: async (input: RegisterInput) => {
    const { name, username, email, password } = input;
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanUsername || !cleanEmail) {
      return { success: false, error: 'Semua kolom wajib diisi' };
    }

    const { availableUsers } = get();
    const existing = availableUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      return { success: false, error: 'Username atau Email sudah terdaftar' };
    }

    // 1. If Supabase is online and password provided, create in Supabase Auth
    if (isSupabaseConfigured() && password && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: name.trim(),
              username: cleanUsername,
              role: 'USER', // Strictly assign 'USER' role
            },
          },
        });

        if (!authErr && authData.user) {
          const newUser: User = {
            id: authData.user.id,
            name: name.trim(),
            username: cleanUsername,
            email: cleanEmail,
            role: 'USER',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const updatedUsers = [...availableUsers, newUser];
          set({
            availableUsers: updatedUsers,
            currentUser: newUser,
            isAuthenticated: true,
          });

          try {
            localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(updatedUsers));
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
          } catch {}

          get().showToast(`Akun staf "${newUser.name}" berhasil didaftarkan!`);
          return { success: true, role: 'USER' };
        }
      } catch (err) {
        console.warn('Supabase register error fallback:', err);
      }
    }

    // 2. Local registration fallback
    const newUser: User = {
      id: 'u-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      role: 'USER', // System strictly assigns 'USER' role per PRD
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedUsers = [...availableUsers, newUser];
    set({
      availableUsers: updatedUsers,
      currentUser: newUser,
      isAuthenticated: true,
    });

    try {
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(updatedUsers));
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    } catch {}

    get().showToast(`Akun staf "${newUser.name}" berhasil didaftarkan!`);
    return { success: true, role: newUser.role };
  },

  logout: async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    set({ currentUser: null, isAuthenticated: false });
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}
    get().showToast('Anda telah keluar dari sistem', 'info');
  },

  setCurrentUser: (user) => {
    set({ currentUser: user, isAuthenticated: true });
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch {}
  },

  switchUserById: (userId) => {
    const target = get().availableUsers.find((u) => u.id === userId);
    if (target) {
      set({ currentUser: target, isAuthenticated: true });
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(target));
      } catch {}
    }
  },

  switchRole: (role) => {
    const target = get().availableUsers.find((u) => u.role === role);
    if (target) {
      set({ currentUser: target, isAuthenticated: true });
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(target));
      } catch {}
    }
  },
}));
