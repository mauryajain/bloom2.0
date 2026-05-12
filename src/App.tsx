// ============================================================
// BLOOM — App Routes
// ============================================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useBloomStore } from './store/useBloomStore';
import LandingPage from './components/onboarding/LandingPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import AppShell from './components/layout/AppShell';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, onboardingComplete, authLoading } = useBloomStore();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-bloom-200 border-t-bloom-500 rounded-full animate-spin" />
          <p className="text-warm-400 text-sm">Loading your Bloom...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, onboardingComplete, authLoading } = useBloomStore();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-bloom-200 border-t-bloom-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (onboardingComplete) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <OnboardingFlow />
          </OnboardingRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
