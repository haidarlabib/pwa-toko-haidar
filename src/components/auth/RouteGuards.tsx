import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-600">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-stone-300 border-t-emerald-600 rounded-full animate-spin" />
      <span className="text-xs font-medium tracking-wide text-stone-500">Memuat sesi...</span>
    </div>
  </div>
);

/**
 * Protects Admin routes:
 * 1. Waiting for auth state to resolve
 * 2. Unauthenticated users are redirected to /auth
 * 3. Authenticated USER role users are redirected to /user/dashboard
 * 4. Authenticated ADMIN users can access /admin/*
 */
export const AdminRoute: React.FC = () => {
  const { isAuthLoading, isAuthenticated, currentUser } = useAppStore();

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (currentUser.role !== 'ADMIN') {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <Outlet />;
};

/**
 * Protects User routes:
 * 1. Waiting for auth state to resolve
 * 2. Unauthenticated users are redirected to /auth
 * 3. Authenticated ADMIN role users are redirected to /admin/dashboard
 * 4. Authenticated USER role users can access /user/*
 */
export const UserRoute: React.FC = () => {
  const { isAuthLoading, isAuthenticated, currentUser } = useAppStore();

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (currentUser.role !== 'USER') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

/**
 * Guards public auth route:
 * If already authenticated, redirects directly to user's assigned dashboard area.
 */
export const PublicAuthRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthLoading, isAuthenticated, currentUser } = useAppStore();

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated && currentUser) {
    if (currentUser.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/user/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
