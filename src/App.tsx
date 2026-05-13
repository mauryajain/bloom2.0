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
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bloom-void)'}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'12px'}}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid var(--bloom-border)',
            borderTopColor: 'var(--bloom-glow)',
            animation: 'spin 0.6s linear infinite'
          }} />
          <p style={{color: 'var(--bloom-muted)', fontSize: 14, fontFamily: 'var(--font-body)'}}>Loading your Bloom...</p>
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
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bloom-void)'}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'12px'}}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid var(--bloom-border)',
            borderTopColor: 'var(--bloom-glow)',
            animation: 'spin 0.6s linear infinite'
          }} />
          <p style={{color: 'var(--bloom-muted)', fontSize: 14, fontFamily: 'var(--font-body)'}}>Loading your Bloom...</p>
        </div>
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
