import { create } from 'zustand';
import type { User, UserRole } from '../types/database.types';
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
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  toasts: Toast[];
  setOnline: (status: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  syncAuthSession: () => Promise<void>;
}

const STORAGE_KEY_USER = 'haidar_active_user';

function getStoredInitialUser(): User | null {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch {}
  return null;
}

const initialSavedUser = getStoredInitialUser();

export const useAppStore = create<AppState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isAuthLoading: true, // Starts in loading state until session is verified
  isAuthenticated: !!initialSavedUser,
  currentUser: initialSavedUser,
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
    if (!isSupabaseConfigured()) {
      set({ isAuthLoading: false });
      return;
    }

    try {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();

      if (sessionErr || !session?.user) {
        set({ currentUser: null, isAuthenticated: false, isAuthLoading: false });
        try {
          localStorage.removeItem(STORAGE_KEY_USER);
        } catch {}
        return;
      }

      // Query authoritative profile from Supabase PostgreSQL
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile && !profErr) {
        const user: User = {
          id: profile.id,
          name: profile.full_name,
          username: profile.username,
          email: session.user.email || profile.username + '@haidarplastik.com',
          role: profile.role as UserRole,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };

        set({ currentUser: user, isAuthenticated: true, isAuthLoading: false });
        try {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        } catch {}
      } else {
        // Session exists but profile query failed or was missing
        console.warn('Profile not found for session user:', session.user.id);
        set({ isAuthLoading: false });
      }
    } catch (err) {
      console.warn('Auth session check error:', err);
      set({ isAuthLoading: false });
    }
  },

  login: async (identifier: string, password?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, error: 'Silakan masukkan email atau username' };
    }

    if (!password) {
      return { success: false, error: 'Silakan masukkan password' };
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Koneksi Supabase belum terkonfigurasi' };
    }

    try {
      const emailToUse = cleanId.includes('@') ? cleanId : `${cleanId}@gmail.com`;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password,
      });

      if (authError || !authData.user) {
        return {
          success: false,
          error: authError?.message === 'Invalid login credentials'
            ? 'Email atau password salah. Periksa kembali akun Anda.'
            : (authError?.message || 'Login gagal. Silakan coba lagi.')
        };
      }

      // Retrieve role directly from public.profiles
      const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profError || !profile) {
        return {
          success: false,
          error: 'Profil akun belum terdaftar di sistem. Hubungi administrator.',
        };
      }

      const role: UserRole = profile.role as UserRole;
      const user: User = {
        id: profile.id,
        name: profile.full_name,
        username: profile.username,
        email: authData.user.email || emailToUse,
        role: role,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      set({ currentUser: user, isAuthenticated: true, isAuthLoading: false });
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } catch {}

      get().showToast(`Selamat datang, ${user.name}!`);
      return { success: true, role };
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan sistem saat login' };
    }
  },

  register: async (input: RegisterInput) => {
    const { name, username, email, password } = input;
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanUsername || !cleanEmail || !password) {
      return { success: false, error: 'Semua kolom wajib diisi' };
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Koneksi Supabase belum terkonfigurasi' };
    }

    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: name.trim(),
            username: cleanUsername,
            role: 'USER', // System strictly forces USER role
          },
        },
      });

      if (authErr || !authData.user) {
        return {
          success: false,
          error: authErr?.message || 'Pendaftaran gagal. Silakan periksa kembali email Anda.',
        };
      }

      // Wait a moment for trigger on_auth_user_created to insert profile
      let role: UserRole = 'USER';
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profile) {
        role = profile.role as UserRole;
      }

      const newUser: User = {
        id: authData.user.id,
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set({ currentUser: newUser, isAuthenticated: true, isAuthLoading: false });
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
      } catch {}

      get().showToast(`Akun staf "${newUser.name}" berhasil didaftarkan!`);
      return { success: true, role };
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan sistem saat pendaftaran' };
    }
  },

  logout: async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    set({ currentUser: null, isAuthenticated: false, isAuthLoading: false });
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}
    get().showToast('Anda telah keluar dari sistem', 'info');
  },

  setCurrentUser: (user) => {
    set({ currentUser: user, isAuthenticated: !!user, isAuthLoading: false });
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {}
  },
}));
