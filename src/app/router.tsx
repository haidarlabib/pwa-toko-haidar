import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { UserLayout } from '../components/layout/UserLayout';
import { LandingPage } from '../features/landing/pages/LandingPage';
import { AuthPage } from '../features/auth/pages/AuthPage';
import { AdminRoute, UserRoute, PublicAuthRoute } from '../components/auth/RouteGuards';

import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { BarangPage } from '../features/barang/pages/BarangPage';
import { DataPage } from '../features/data/pages/DataPage';
import { AdminProfilePage } from '../features/admin/profile/AdminProfilePage';

import { UserDashboardPage } from '../features/user/dashboard/UserDashboardPage';
import { UserBarangPage } from '../features/user/barang/UserBarangPage';
import { UserCheckPage } from '../features/user/check/UserCheckPage';
import { UserProfilePage } from '../features/user/profile/UserProfilePage';

export const router = createBrowserRouter([
  // 1. Public Opening Experience (Landing & Hero)
  {
    path: '/',
    element: <LandingPage />,
  },

  // 2. Public Authentication Portal (Login / Register)
  {
    path: '/auth',
    element: (
      <PublicAuthRoute>
        <AuthPage />
      </PublicAuthRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicAuthRoute>
        <AuthPage />
      </PublicAuthRoute>
    ),
  },

  // 3. Isolated Admin Management Application (/admin/*)
  // Primary Navigation: Home, Barang, Data, Profil (PRD Section 4 & 5)
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'barang',
            element: <BarangPage />,
          },
          {
            path: 'data',
            element: <DataPage />,
          },
          {
            path: 'profile',
            element: <AdminProfilePage />,
          },
          // Secondary tools redirect to Profile tabs
          {
            path: 'riwayat',
            element: <Navigate to="/admin/profile?tab=price_history" replace />,
          },
          {
            path: 'export',
            element: <Navigate to="/admin/profile?tab=export" replace />,
          },
        ],
      },
    ],
  },

  // 4. Isolated User Operational Application (/user/*)
  {
    path: '/user',
    element: <UserRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/user/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <UserDashboardPage />,
          },
          {
            path: 'barang',
            element: <UserBarangPage />,
          },
          {
            path: 'products',
            element: <Navigate to="/user/barang" replace />,
          },
          {
            path: 'check',
            element: <UserCheckPage />,
          },
          {
            path: 'profile',
            element: <UserProfilePage />,
          },
        ],
      },
    ],
  },

  // 5. Backwards-compatibility redirects from v1/legacy paths
  {
    path: '/dashboard',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/barang',
    element: <Navigate to="/admin/barang" replace />,
  },
  {
    path: '/data',
    element: <Navigate to="/admin/data" replace />,
  },
  {
    path: '/riwayat',
    element: <Navigate to="/admin/profile?tab=price_history" replace />,
  },
  {
    path: '/export',
    element: <Navigate to="/admin/profile?tab=export" replace />,
  },
  {
    path: '/profile',
    element: <Navigate to="/admin/profile" replace />,
  },

  // 6. Global fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
