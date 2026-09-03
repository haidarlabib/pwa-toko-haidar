import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';

/**
 * Protects Admin routes:
 * 1. Unauthenticated users are redirected to /auth
 * 2. Authenticated USER role users are redirected to /user/dashboard
 */
export const AdminRoute: React.FC = () => {
  const { isAuthenticated, currentUser } = useAppStore();

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
 * 1. Unauthenticated users are redirected to /auth
 * 2. Authenticated ADMIN role users are redirected to /admin/dashboard
 */
export const UserRoute: React.FC = () => {
  const { isAuthenticated, currentUser } = useAppStore();

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
  const { isAuthenticated, currentUser } = useAppStore();

  if (isAuthenticated && currentUser) {
    if (currentUser.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/user/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
