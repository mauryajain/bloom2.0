import { useState } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../../lib/authService';
import {
  LayoutDashboard, Road, FileEdit, Sparkles,
  Stethoscope, Book, CircleHelp, Settings, LogOut, Menu, X
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'timeline', label: 'My Journey', icon: Road },
  { id: 'journal', label: 'Symptom Journal', icon: FileEdit },
  { id: 'ask-bloom', label: 'Ask Bloom', icon: Sparkles },
  { id: 'doctor-prep', label: 'Doctor Prep', icon: Stethoscope },
  { id: 'conditions', label: 'Condition Library', icon: Book },
  { id: 'normal-vs-not', label: "What's Normal?", icon: CircleHelp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, currentUser, logout, isDemoMode } = useBloomStore();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleSignOut = async () => {
    if (!isDemoMode) await signOut();
    logout();
    navigate('/');
  };

  const renderPetal = (item: typeof navItems[0]) => {
    const isActive = currentView === item.id;
    const isHovered = hoveredItem === item.id;
    const Icon = item.icon;

    return (
      <div key={item.id} className="relative flex items-center justify-center">
        <button
          className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300"
          style={{
            background: isActive
              ? 'radial-gradient(circle, var(--bloom-glow), transparent 160%)'
              : isHovered
                ? 'var(--bloom-lift)'
                : 'transparent',
            clipPath: isHovered || isActive
              ? 'polygon(50% 0%, 85% 15%, 100% 50%, 85% 85%, 50% 100%, 15% 85%, 0% 50%, 15% 15%)'
              : 'none',
            transform: isActive ? 'rotate(45deg)' : 'none',
            transition: 'clip-path 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease',
            willChange: 'transform',
          }}
          onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          aria-label={item.label}
        >
          <Icon
            size={18}
            style={{
              color: isActive ? 'white' : isHovered ? 'var(--bloom-glow)' : 'var(--bloom-muted)',
              transform: isActive ? 'rotate(-45deg)' : 'none',
              transition: 'color 0.2s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: isActive ? 'bloom-pulse 3s ease-in-out' : 'none',
            }}
          />
        </button>

        {isActive && (
          <>
            <span
              className="absolute -bottom-3 w-[2px] h-3"
              style={{
                background: 'var(--bloom-glow)',
                opacity: 0.6,
                animation: 'stem-grow 0.4s ease forwards',
              }}
            />
          </>
        )}

        {isHovered && (
          <div
            className="absolute left-full ml-3 z-50 pointer-events-none"
            style={{
              animation: 'bloom-fade-up 0.2s ease forwards',
            }}
          >
            <div
              className="whitespace-nowrap px-3 py-1.5 text-[13px] rounded-full"
              style={{
                background: 'var(--bloom-surface)',
                border: '1px solid var(--bloom-border)',
                color: 'var(--bloom-text)',
                fontFamily: 'var(--font-body)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {item.label}
            </div>
          </div>
        )}
      </div>
    );
  };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'BL';

  return (
    <>
      <button
        className="mobile-nav-bar fixed top-4 left-4 z-50 p-2 rounded-xl"
        style={{
          background: 'var(--bloom-surface)',
          border: '1px solid var(--bloom-border)',
          color: 'var(--bloom-text)',
        }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {sidebarOpen && (
        <>
          <div
            className="mobile-nav-bar fixed inset-0 z-30"
            style={{ background: 'rgba(10, 6, 18, 0.42)' }}
            onClick={() => setSidebarOpen(false)}
          />

          <aside
            className="mobile-nav-bar fixed left-4 right-4 top-20 z-40 overflow-y-auto rounded-2xl p-3"
            style={{
              maxHeight: 'calc(100vh - 160px)',
              background: 'var(--bloom-deep)',
              border: '1px solid var(--bloom-border)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.36)',
            }}
            aria-label="Mobile navigation"
          >
            <div className="mb-3 flex items-center gap-3 px-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))',
                  color: 'white',
                }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" style={{ color: 'var(--bloom-text)' }}>
                  {currentUser?.name || 'Bloom'}
                </p>
                <p className="text-xs" style={{ color: 'var(--bloom-muted)' }}>
                  {isDemoMode ? 'Demo profile' : 'Signed in'}
                </p>
              </div>
            </div>

            <nav className="grid gap-2">
              {navItems.map(item => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all"
                    style={{
                      background: isActive ? 'var(--bloom-lift)' : 'transparent',
                      border: `1px solid ${isActive ? 'var(--bloom-border)' : 'transparent'}`,
                      color: isActive ? 'var(--bloom-text)' : 'var(--bloom-muted)',
                    }}
                    onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
                  >
                    <Icon size={18} style={{ color: isActive ? 'var(--bloom-glow)' : 'var(--bloom-muted)' }} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all"
              style={{
                background: 'rgba(232, 121, 160, 0.08)',
                border: '1px solid rgba(232, 121, 160, 0.18)',
                color: 'var(--bloom-text)',
              }}
              onClick={handleSignOut}
            >
              <LogOut size={18} style={{ color: 'var(--bloom-rose)' }} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside
        className="sidebar-desktop fixed top-0 left-0 h-full z-40 flex flex-col items-center py-4"
        style={{
          width: '72px',
          background: 'var(--bloom-deep)',
          borderRight: '1px solid var(--bloom-border)',
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-10"
          style={{ background: 'linear-gradient(to bottom, var(--bloom-deep), transparent)' }}
          pointer-events="none"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-10"
          style={{ background: 'linear-gradient(to top, var(--bloom-deep), transparent)' }}
          pointer-events="none"
        />

        <button
          className="w-10 h-10 rounded-full flex items-center justify-center mb-6 transition-all duration-300 hover:shadow-lg"
          style={{
            background: 'radial-gradient(circle, var(--bloom-glow), transparent 160%)',
            boxShadow: '0 0 0 0 transparent',
            transition: 'box-shadow 0.3s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.4)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 0 transparent'}
          onClick={() => navigate('/')}
          aria-label="Home"
        >
          <span style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'white' }}>B</span>
        </button>

        <nav className="flex-1 flex flex-col items-center gap-5">
          {navItems.map(renderPetal)}
        </nav>

        <div className="relative mt-auto">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))',
              border: '2px solid var(--bloom-border)',
              color: 'white',
            }}
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut size={14} />
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{ background: 'var(--bloom-teal)', borderColor: 'var(--bloom-deep)' }}
          />
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="mobile-nav-bar fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2"
        style={{
          background: 'var(--bloom-deep)',
          borderTop: '1px solid var(--bloom-border)',
        }}
      >
        {navItems.slice(0, 5).map(item => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300"
              style={{
                background: isActive
                  ? 'radial-gradient(circle, var(--bloom-glow), transparent 160%)'
                  : 'transparent',
                transform: isActive ? 'rotate(45deg)' : 'none',
                transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease',
              }}
              onClick={() => setCurrentView(item.id)}
              aria-label={item.label}
            >
              <Icon
                size={18}
                style={{
                  color: isActive ? 'white' : 'var(--bloom-muted)',
                  transform: isActive ? 'rotate(-45deg)' : 'none',
                }}
              />
            </button>
          );
        })}
      </nav>
    </>
  );
}
