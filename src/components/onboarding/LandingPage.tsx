// ============================================================
// BLOOM — Landing Page
// Shows auth forms (Sign Up / Log In) alongside demo selector
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBloomStore } from '../../store/useBloomStore';
import { signIn, signUp } from '../../lib/authService';
import { Flower2, ArrowRight, Shield, Brain, FileText, Heart, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';

type AuthTab = 'demo' | 'login' | 'signup';

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

  const features = [
    { icon: Heart, title: 'Track Symptoms', desc: 'Log daily symptoms with severity, mood, energy and sleep' },
    { icon: Brain, title: 'AI Pattern Detection', desc: 'Gemini AI finds patterns across your health data' },
    { icon: FileText, title: 'Doctor-Ready Reports', desc: 'Generate summaries for your healthcare visits' },
    { icon: Shield, title: 'Privacy First', desc: 'Your data stays yours. No diagnosis — only pattern insights' },
  ];

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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-bloom-400 to-rose-400 flex items-center justify-center shadow-bloom animate-[float_6s_ease-in-out_infinite]">
            <Flower2 size={48} className="text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-sage-300 animate-[pulse-soft_3s_ease-in-out_infinite]" />
          <div className="absolute -bottom-1 -left-3 w-4 h-4 rounded-full bg-rose-300 animate-[pulse-soft_3s_ease-in-out_infinite_0.5s]" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold font-[var(--font-display)] text-center">
          <span className="gradient-text">BLOOM</span>
        </h1>
        <p className="text-lg md:text-xl text-warm-500 text-center mt-3 max-w-lg font-light">
          Your AI-powered women's health companion.<br />Track symptoms. Detect patterns. Own your health.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 max-w-2xl w-full">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="glass-card p-5 flex gap-4 items-start animate-[slide-up_0.4s_ease-out]">
                <div className="w-10 h-10 rounded-xl bg-bloom-100 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-bloom-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-xs text-warm-400 mt-1">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Auth Panel */}
        <div className="mt-10 w-full max-w-md glass-card p-6 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-warm-100 rounded-xl">
            {(['demo', 'login', 'signup'] as AuthTab[]).map(t => (
              <button
                key={t}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? 'bg-white shadow-sm text-bloom-600'
                    : 'text-warm-500 hover:text-warm-700'
                }`}
                onClick={() => { setTab(t); setError(''); }}
              >
                {t === 'demo' ? '✨ Try Demo' : t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Demo Tab */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-warm-400 text-center flex items-center justify-center gap-1">
                <Sparkles size={12} className="text-bloom-400" />
                Choose a demo profile — no account needed
              </p>
              <button
                className="w-full glass-card p-4 flex items-center gap-4 hover:shadow-bloom transition-all group"
                onClick={() => handleDemo('demo-sarah')}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bloom-400 to-bloom-600 flex items-center justify-center text-white font-bold text-lg">S</div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Sarah Mitchell, 29</p>
                  <p className="text-xs text-warm-400">Reproductive stage · 90 days of data · Endometriosis patterns</p>
                </div>
                <ArrowRight size={18} className="text-warm-300 group-hover:text-bloom-500 transition-colors" />
              </button>
              <button
                className="w-full glass-card p-4 flex items-center gap-4 hover:shadow-bloom transition-all group"
                onClick={() => handleDemo('demo-priya')}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold text-lg">P</div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Priya Sharma, 47</p>
                  <p className="text-xs text-warm-400">Perimenopause · 90 days of data · Hot flash patterns</p>
                </div>
                <ArrowRight size={18} className="text-warm-300 group-hover:text-bloom-500 transition-colors" />
              </button>
            </div>
          )}

          {/* Login / Sign Up Tab */}
          {(tab === 'login' || tab === 'signup') && (
            <div className="space-y-4">
              {tab === 'signup' && (
                <div className="space-y-1.5">
                  <label htmlFor="signup-name" className="block text-xs font-medium leading-none text-warm-500">Name</label>
                  <input
                    id="signup-name"
                    className="bloom-input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="auth-email" className="block text-xs font-medium leading-none text-warm-500">Email</label>
                <input
                  id="auth-email"
                  className="bloom-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleSignIn() : handleSignUp())}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="auth-password" className="block text-xs font-medium leading-none text-warm-500">Password</label>
                <div className="relative">
                  <input
                    id="auth-password"
                    className="bloom-input pr-10"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleSignIn() : handleSignUp())}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {tab === 'signup' && (
                <div className="space-y-1.5">
                  <label htmlFor="signup-confirm-password" className="block text-xs font-medium leading-none text-warm-500">Confirm Password</label>
                  <input
                    id="signup-confirm-password"
                    className="bloom-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSignUp()}
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-200">{error}</p>
              )}

              <button
                className="btn-bloom w-full flex items-center justify-center gap-2"
                onClick={tab === 'login' ? handleSignIn : handleSignUp}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {tab === 'login' ? 'Log In to Bloom' : 'Create Account'}
              </button>

              {tab === 'signup' && (
                <p className="text-[11px] text-warm-400 text-center">
                  By signing up you agree that Bloom is a health tracking tool, not a medical device.
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-[11px] text-warm-300 text-center mt-6 max-w-sm">
          BLOOM is a health tracking tool, not a medical device.
          Always consult healthcare professionals for medical decisions.
        </p>
      </div>
    </div>
  );
}
