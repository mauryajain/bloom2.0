// ============================================================
// BLOOM — Sidebar Navigation
// Agent 1 (Full-Stack) + Agent 3 (UI/UX)
// ============================================================

import { useBloomStore } from '../../store/useBloomStore';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../../lib/authService';
import {
  LayoutDashboard, BookHeart, Brain, FileText,
  Library, Flower2, Settings, LogOut, Menu, X, Bell
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'journal', label: 'Symptom Journal', icon: BookHeart },
  { id: 'ask-bloom', label: 'Ask Bloom', icon: Brain },
  { id: 'doctor-prep', label: 'Doctor Prep', icon: FileText },
  { id: 'conditions', label: 'Condition Library', icon: Library },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, currentUser, logout, patterns, isDemoMode } = useBloomStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (!isDemoMode) await signOut();
    logout();
    navigate('/');
  };
  const unreadAlerts = patterns.filter(p => !p.isRead).length;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={sidebarOpen}
        className="mobile-nav fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/80 backdrop-blur shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="mobile-nav fixed inset-0 bg-black/20 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-white/60 z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{ boxShadow: '4px 0 24px -4px rgba(168,85,247,0.08)' }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-bloom-400 to-rose-400 flex items-center justify-center shadow-bloom">
            <Flower2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-[var(--font-display)] gradient-text">BLOOM</h1>
            <p className="text-[10px] text-warm-400 tracking-wider uppercase">Health Companion</p>
          </div>
        </div>

        {/* User card */}
        {currentUser && (
          <div className="mx-4 mb-4 p-3 rounded-xl bg-bloom-50/80 border border-bloom-100">
            <p className="font-semibold text-sm text-warm-800">{currentUser.name}</p>
            <p className="text-xs text-warm-400 capitalize">{currentUser.lifeStage.replace('-', ' ')} · Age {currentUser.age}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item w-full ${isActive ? 'active' : ''}`}
                onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.id === 'dashboard' && unreadAlerts > 0 && (
                  <span className="ml-auto flex items-center gap-1 badge badge-rose text-[10px]">
                    <Bell size={10} />
                    {unreadAlerts}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-warm-100">
          <button
            className="nav-item w-full text-warm-400 hover:text-rose-500"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
          <p className="text-[10px] text-warm-300 text-center mt-2">
            BLOOM v1.0 · {isDemoMode ? 'Demo Mode' : 'Live Mode'}
          </p>
        </div>
      </aside>
    </>
  );
}
