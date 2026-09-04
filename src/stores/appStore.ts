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

interface AuthResponse {
  success: boolean;
  role?: UserRole;
  requiresEmailConfirmation?: boolean;
  error?: string;
  message?: string;
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
  login: (identifier: string, password?: string) => Promise<AuthResponse>;
  register: (input: RegisterInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  syncAuthSession: () => Promise<void>;
}

const STORAGE_KEY_USER = 'haidar_active_user';

export function mapSupabaseAuthError(err: any): string {
  if (!err) return 'Terjadi kesalahan autentikasi.';
  const msg = (err.message || err.error_description || String(err)).toLowerCase();

  if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
    return 'Batas pengiriman email verifikasi dari Supabase tercapai (rate limit). Silakan tunggu beberapa menit sebelum mencoba mendaftar lagi, atau masuk langsung jika akun sudah terdaftar.';
  }
  if (msg.includes('user already registered') || msg.includes('already exists') || msg.includes('unique constraint')) {
    return 'Email sudah terdaftar. Silakan beralih ke tab Masuk untuk login ke akun Anda.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Email atau password salah. Periksa kembali akun Anda.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Periksa kotak masuk atau spam email Anda untuk mengonfirmasi pendaftaran sebelum masuk.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak_password') || msg.includes('at least 6')) {
    return 'Password terlalu pendek. Gunakan minimal 6 karakter.';
  }
  if (msg.includes('invalid email') || msg.includes('unable to validate')) {
    return 'Format alamat email tidak valid.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Koneksi ke server gagal. Periksa koneksi internet Anda.';
  }
  return err.message || 'Terjadi kesalahan sistem saat autentikasi.';
}

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
        // Session exists but profile lookup failed/deleted -> reset to unauthenticated
        set({ currentUser: null, isAuthenticated: false, isAuthLoading: false });
        try {
          localStorage.removeItem(STORAGE_KEY_USER);
        } catch {}
      }
    } catch (err) {
      console.warn('Auth session check error:', err);
      set({ currentUser: null, isAuthenticated: false, isAuthLoading: false });
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
          error: mapSupabaseAuthError(authError),
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
      return { success: false, error: mapSupabaseAuthError(err) };
    }
  },

  register: async (input: RegisterInput) => {
    const { name, username, email, password } = input;
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanUsername || !cleanEmail || !password) {
      return { success: false, error: 'Semua kolom wajib diisi' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password minimal 6 karakter' };
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Koneksi Supabase belum terkonfigurasi' };
    }

    try {
      // 1. Trigger Supabase Auth signup
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: name.trim(),
            username: cleanUsername,
            role: 'USER', // System strictly forces USER role (trigger handle_new_user overrides unconditionally)
          },
        },
      });

      if (authErr) {
        return {
          success: false,
          error: mapSupabaseAuthError(authErr),
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Pendaftaran gagal dibuat oleh server autentikasi.',
        };
      }

      // 2. If session is immediately returned (Email confirmation disabled in Supabase project)
      if (authData.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        const role: UserRole = (profile?.role as UserRole) || 'USER';
        const newUser: User = {
          id: authData.user.id,
          name: profile?.full_name || name.trim(),
          username: profile?.username || cleanUsername,
          email: cleanEmail,
          role: role,
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: profile?.updated_at || new Date().toISOString(),
        };

        set({ currentUser: newUser, isAuthenticated: true, isAuthLoading: false });
        try {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
        } catch {}

        get().showToast(`Akun staf "${newUser.name}" berhasil didaftarkan!`);
        return { success: true, role, requiresEmailConfirmation: false };
      }

      // 3. If session is null, attempt immediate signInWithPassword (in case auto-confirm is active)
      const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!loginErr && loginData.user && loginData.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', loginData.user.id)
          .single();

        const role: UserRole = (profile?.role as UserRole) || 'USER';
        const newUser: User = {
          id: loginData.user.id,
          name: profile?.full_name || name.trim(),
          username: profile?.username || cleanUsername,
          email: cleanEmail,
          role: role,
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: profile?.updated_at || new Date().toISOString(),
        };

        set({ currentUser: newUser, isAuthenticated: true, isAuthLoading: false });
        try {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
        } catch {}

        get().showToast(`Akun staf "${newUser.name}" berhasil didaftarkan!`);
        return { success: true, role, requiresEmailConfirmation: false };
      }

      // 4. If Supabase project requires email confirmation link
      return {
        success: true,
        requiresEmailConfirmation: true,
        message: 'Pendaftaran staf berhasil! Tautan konfirmasi telah dikirim ke email Anda. Silakan periksa inbox/spam sebelum masuk.',
      };
    } catch (err: any) {
      return { success: false, error: mapSupabaseAuthError(err) };
    }
  },

  logout: async () => {
    // 1. Immediately reset state in memory and localStorage so all guards evaluate as unauthenticated
    set({ currentUser: null, isAuthenticated: false, isAuthLoading: false });
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}

    // 2. Invalidate Supabase session
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }

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
