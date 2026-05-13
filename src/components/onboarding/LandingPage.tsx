import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBloomStore } from '../../store/useBloomStore';
import { signIn, signUp } from '../../lib/authService';
import { demoUsers } from '../../data/demoData';
import {
  Heart,
  Brain,
  Stethoscope,
  Shield,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

type AuthTab = 'demo' | 'login' | 'signup';

const accentColors = ['#7c3aed', '#e879a0', '#06d6a0', '#fbbf24'];
const featureIcons = [Heart, Brain, Stethoscope, Shield];
const features = [
  { title: 'Track Symptoms', desc: 'Log daily symptoms with severity, mood, energy and sleep' },
  { title: 'AI Pattern Detection', desc: 'Gemini AI finds patterns across your health data' },
  { title: 'Doctor-Ready Reports', desc: 'Generate summaries for your healthcare visits' },
  { title: 'Privacy First', desc: 'Your data stays yours. No diagnosis \u2014 only pattern insights' },
];

const stageLabel = (stage: string) =>
  stage
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const petalColors = ['#7c3aed', '#e879a0', '#7c3aed', '#e879a0', '#7c3aed', '#e879a0'];

export default function LandingPage() {
  const { loginAsDemo, loginAsReal } = useBloomStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AuthTab>('demo');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!name.trim() || !email || !password || !confirmPassword) { setError('Please complete all account fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    const result = await signUp(email, password, name.trim());
    if ('message' in result) {
      setError(result.message);
    } else {
      if (!result.hasSession) {
        setError('Account created. Please confirm your email, then log in to finish onboarding.');
        setTab('login');
        setPassword('');
        setConfirmPassword('');
        setLoading(false);
        return;
      }
      await loginAsReal(result.userId, email);
      navigate('/onboarding');
    }
    setLoading(false);
  };

  const handleSignIn = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    const result = await signIn(email, password);
    if ('message' in result) {
      setError(result.message);
    } else {
      await loginAsReal(result.userId, email);
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleDemo = (userId: string) => {
    loginAsDemo(userId);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex min-h-screen flex-col items-center px-6 py-8 lg:px-10">
        <div className="flex w-full flex-col items-center">
        {/* Animated Bloom Icon */}
        <div
          className="relative mb-6"
          style={{ width: 112, height: 112 }}
        >
          {petalColors.map((color, i) => (
            <div
              key={i}
              className="absolute bottom-1/2 left-1/2"
              style={{
                width: 42,
                height: 70,
                transformOrigin: 'center bottom',
                transform: `translateX(-50%) rotate(${i * 60}deg)`,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 70,
                  borderRadius: '50%',
                  background: color,
                  opacity: 0.78,
                  transformOrigin: 'center bottom',
                  animation: 'bloom-petal-open 3.6s ease-in-out infinite',
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            </div>
          ))}
          {/* Center circle */}
          <div
            className="absolute"
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#06d6a0',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 24px rgba(6, 214, 160, 0.6)',
              animation: 'bloom-center-glow 3.6s ease-in-out infinite',
              zIndex: 2,
            }}
          />
        </div>

        {/* Wordmark */}
        <h1
          className="text-center mb-3"
          style={{
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(48px, 7vw, 72px)',
            fontWeight: 700,
            color: '#ffffff',
            textShadow: '0 0 40px rgba(124, 58, 237, 0.5)',
            lineHeight: 1,
          }}
        >
          BLOOM
        </h1>

        {/* Tagline */}
        <p
          className="text-center max-w-lg"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 20,
            color: '#8b7daa',
          }}
        >
          Your body tells a story. We help you read it.
        </p>

        {/* ===== FEATURE CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl w-full">
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            const accent = accentColors[i];
            return (
              <div
                key={f.title}
                className="flex items-start gap-4 p-5 rounded-2xl cursor-default"
                style={{
                  background: '#1a1430',
                  border: '1px solid rgba(124, 58, 237, 0.18)',
                  borderLeft: `3px solid ${accent}`,
                  transition: 'all 0.3s ease',
                  animation: 'bloom-fade-up 0.4s ease forwards',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${accent}40`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div className="shrink-0 mt-0.5">
                  <Icon size={32} style={{ color: accent }} />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontSize: 17,
                      fontWeight: 600,
                      color: '#f0ecff',
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: '#8b7daa',
                      marginTop: 4,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== GARDEN PATH — DEMO PROFILES ===== */}
        </div>
        <div className="mt-8 flex w-full max-w-lg flex-col items-center gap-2">
          <p
            className="flex items-center gap-2 mb-1"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: '#8b7daa',
            }}
          >
            <Sparkles size={14} style={{ color: '#7c3aed' }} />
            Choose a demo profile to explore
          </p>
          {demoUsers.map((demo, i) => {
            const accent = accentColors[i % accentColors.length];
            return (
              <button
                key={demo.user.id}
                onClick={() => handleDemo(demo.user.id)}
                className="group flex items-center gap-3 cursor-pointer overflow-hidden"
                style={{
                  height: 54,
                  borderRadius: 99,
                  background: '#1a1430',
                  border: '1px solid rgba(124, 58, 237, 0.18)',
                  paddingLeft: 6,
                  paddingRight: 14,
                  width: 'min(100%, 400px)',
                  transition: 'width 0.3s ease, transform 0.3s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(6px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                }}
              >
                <div
                  className="shrink-0 flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: accent,
                  }}
                >
                  {demo.user.name.charAt(0)}
                </div>
                <div className="flex-1 text-left min-w-0 px-2">
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#f0ecff',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {demo.user.name}, <span style={{ fontWeight: 400 }}>{demo.user.age}</span>
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      color: '#8b7daa',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {stageLabel(demo.user.lifeStage)}
                  </p>
                </div>
                <div
                  className="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ width: 0, overflow: 'hidden' }}
                >
                  <span
                    className="whitespace-nowrap text-sm font-medium"
                    style={{ color: '#7c3aed' }}
                  >
                    &rarr; Select
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ===== CTA BUTTONS ===== */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => { setTab('demo'); setError(''); }}
            className="cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #e879a0)',
              color: '#ffffff',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              height: 48,
              width: 150,
              border: 'none',
              borderRadius: 14,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.4)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            Try Demo
          </button>
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className="cursor-pointer"
            style={{
              background: 'transparent',
              color: '#f0ecff',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              height: 48,
              width: 150,
              border: '1px solid rgba(124, 58, 237, 0.18)',
              borderRadius: 14,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124, 58, 237, 0.18)';
            }}
          >
            Log In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(''); }}
            className="cursor-pointer"
            style={{
              background: 'transparent',
              color: '#f0ecff',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              height: 48,
              width: 150,
              border: '1px solid rgba(124, 58, 237, 0.18)',
              borderRadius: 14,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124, 58, 237, 0.18)';
            }}
          >
            Sign Up
          </button>
        </div>

        {/* ===== AUTH PANEL ===== */}
        <div
          className="mt-6 w-full max-w-md rounded-2xl p-5"
          style={{
            background: '#1a1430',
            border: '1px solid rgba(124, 58, 237, 0.18)',
          }}
        >
          {/* Tabs */}
          <div
            className="flex gap-1 p-1 rounded-xl mb-6"
            style={{ background: '#110d1e' }}
          >
            {(['demo', 'login', 'signup'] as AuthTab[]).map(t => (
              <button
                key={t}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: tab === t ? '#7c3aed' : 'transparent',
                  color: tab === t ? '#ffffff' : '#8b7daa',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onClick={() => { setTab(t); setError(''); }}
              >
                {t === 'demo' ? 'Demo' : t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Demo Pane */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <p
                className="text-xs text-center"
                style={{ color: '#8b7daa', fontFamily: "'DM Sans', sans-serif" }}
              >
                No account needed. Pick a profile and explore.
              </p>
              <div
                className="space-y-2 pr-1"
                style={{ maxHeight: 320, overflowY: 'auto' }}
              >
                {demoUsers.map((demo, index) => {
                  const accent = accentColors[index % accentColors.length];
                  return (
                    <button
                      key={demo.user.id}
                      onClick={() => handleDemo(demo.user.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: '#1a1430',
                        border: '1px solid rgba(124, 58, 237, 0.18)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = accent;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124, 58, 237, 0.18)';
                      }}
                    >
                      <div
                        className="flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: accent,
                        }}
                      >
                        {demo.user.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p
                          className="font-semibold text-sm"
                          style={{ color: '#f0ecff' }}
                        >
                          {demo.user.name}, {demo.user.age}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: '#8b7daa' }}
                        >
                          {stageLabel(demo.user.lifeStage)} &middot; {demo.symptomLogs.length} days
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Login / Sign Up Pane */}
          {(tab === 'login' || tab === 'signup') && (
            <div className="space-y-4">
              {tab === 'signup' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-name"
                    className="block text-xs font-medium"
                    style={{ color: '#8b7daa', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Name
                  </label>
                  <input
                    id="signup-name"
                    className="w-full px-4 py-3 text-sm"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                    style={{
                      background: '#1a1430',
                      border: '1px solid rgba(124, 58, 237, 0.18)',
                      borderRadius: 12,
                      color: '#f0ecff',
                      fontFamily: "'DM Sans', sans-serif",
                      outline: 'none',
                    }}
                    onFocus={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.2)';
                    }}
                    onBlur={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124, 58, 237, 0.18)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-medium"
                  style={{ color: '#8b7daa', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Email
                </label>
                <input
                  id="auth-email"
                  className="w-full px-4 py-3 text-sm"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleSignIn() : handleSignUp())}
                  style={{
                    background: '#1a1430',
                    border: '1px solid rgba(124, 58, 237, 0.18)',
                    borderRadius: 12,
                    color: '#f0ecff',
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none',
                  }}
                  onFocus={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.2)';
                  }}
                  onBlur={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124, 58, 237, 0.18)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-medium"
                  style={{ color: '#8b7daa', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    className="w-full px-4 py-3 pr-10 text-sm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleSignIn() : handleSignUp())}
                    style={{
                      background: '#1a1430',
                      border: '1px solid rgba(124, 58, 237, 0.18)',
                      borderRadius: 12,
                      color: '#f0ecff',
                      fontFamily: "'DM Sans', sans-serif",
                      outline: 'none',
                    }}
                    onFocus={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.2)';
                    }}
                    onBlur={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124, 58, 237, 0.18)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: '#8b7daa' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {tab === 'signup' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="signup-confirm-password"
                    className="block text-xs font-medium"
                    style={{ color: '#8b7daa', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm-password"
                    className="w-full px-4 py-3 text-sm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSignUp()}
                    style={{
                      background: '#1a1430',
                      border: '1px solid rgba(124, 58, 237, 0.18)',
                      borderRadius: 12,
                      color: '#f0ecff',
                      fontFamily: "'DM Sans', sans-serif",
                      outline: 'none',
                    }}
                    onFocus={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.2)';
                    }}
                    onBlur={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124, 58, 237, 0.18)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}

              {error && (
                <p
                  className="text-xs p-3 rounded-xl border"
                  style={{
                    color: '#e879a0',
                    background: 'rgba(232, 121, 160, 0.1)',
                    borderColor: 'rgba(232, 121, 160, 0.25)',
                  }}
                >
                  {error}
                </p>
              )}

              <button
                className="w-full flex items-center justify-center gap-2 cursor-pointer"
                onClick={tab === 'login' ? handleSignIn : handleSignUp}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #e879a0)',
                  color: '#ffffff',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  height: 48,
                  border: 'none',
                  borderRadius: 12,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.4)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {tab === 'login' ? 'Log In to Bloom' : 'Create Account'}
              </button>

              {tab === 'signup' && (
                <p
                  className="text-[11px] text-center"
                  style={{ color: '#8b7daa', fontFamily: "'DM Sans', sans-serif" }}
                >
                  By signing up you agree that Bloom is a health tracking tool, not a medical device.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer disclaimer */}
        <p
          className="mt-4 max-w-sm text-center text-[11px]"
          style={{ color: '#8b7daa', fontFamily: "'DM Sans', sans-serif" }}
        >
          BLOOM is a health tracking tool, not a medical device.
          Always consult healthcare professionals for medical decisions.
        </p>
      </section>
    </div>
  );
}
