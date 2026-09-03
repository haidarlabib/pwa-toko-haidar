import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { useAppStore } from '../stores/appStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const App: React.FC = () => {
  const syncAuthSession = useAppStore((state) => state.syncAuthSession);

  useEffect(() => {
    syncAuthSession();

    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, _session) => {
        syncAuthSession();
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [syncAuthSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
