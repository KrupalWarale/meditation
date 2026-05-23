/**
 * File: ProtectedRoute.tsx
 *
 * Description: Authentication guard that redirects unauthenticated users to the login page.
 *
 * Author: Navnit(Ninjacode911)
 */

import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export function ProtectedRoute() {
  // DEV MODE: bypass auth when no Supabase is configured
  const isDev = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(isDev ? true : null);

  useEffect(() => {
    if (isDev) return; // Skip auth check in dev without Supabase

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAuthenticated(false);
          return;
        }

        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setIsAuthenticated(profile?.role === 'admin');
      } catch {
        setIsAuthenticated(false);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          setIsAuthenticated(false);
          return;
        }

        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setIsAuthenticated(profile?.role === 'admin');
      }
    );

    return () => subscription.unsubscribe();
  }, [isDev]);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
