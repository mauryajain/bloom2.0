// ============================================================
// BLOOM — Main Entry Point
// Sets up BrowserRouter + Supabase auth state listener
// ============================================================

import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { supabase, isSupabaseConfigured } from './lib/supabase.ts';
import { useBloomStore } from './store/useBloomStore.ts';

function Root() {
  const { loginAsReal, logout, setAuthLoading, isAuthenticated, isDemoMode } = useBloomStore();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // No Supabase credentials — run in demo-only mode, skip all auth checks
      setAuthLoading(false);
      return;
    }

    // On initial load, check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !isDemoMode) {
        loginAsReal(session.user.id, session.user.email ?? '');
      } else {
        setAuthLoading(false);
      }
    });

    // Listen for auth changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          if (!isDemoMode) logout();
        } else if (event === 'SIGNED_IN' && session?.user && !isDemoMode) {
          if (!isAuthenticated) {
            loginAsReal(session.user.id, session.user.email ?? '');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Root />
    </HashRouter>
  </StrictMode>
);
