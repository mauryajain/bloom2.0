import { useState, useEffect } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import { User, Palette, Info, Bell, Stethoscope, Shield, Key, Eye, EyeOff, Check, X, Sparkles } from 'lucide-react';
import { getGeminiKey, setGeminiKey, clearGeminiKey, hasCustomGeminiKey } from '../../lib/geminiKeyManager';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Palette },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'about', label: 'About', icon: Info },
] as const;

const stageLabel = (stage: string) =>
  stage.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const petalColors = ['var(--bloom-glow)', 'var(--bloom-rose)', 'var(--bloom-glow)', 'var(--bloom-rose)', 'var(--bloom-glow)', 'var(--bloom-rose)'];

function BloomFlower() {
  return (
    <div className="relative" style={{ width: 60, height: 60 }}>
      {petalColors.map((color, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            bottom: '50%',
            left: '50%',
            width: 20,
            height: 35,
            transformOrigin: 'center bottom',
            transform: `translateX(-50%) rotate(${i * 60}deg)`,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: color,
              opacity: 0.7,
            }}
          />
        </div>
      ))}
      <div
        className="absolute"
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'var(--bloom-teal)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 12px rgba(6, 214, 160, 0.5)',
          zIndex: 2,
        }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser, userProfile } = useBloomStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [lifeStageAdaptive, setLifeStageAdaptive] = useState(true);

  // API Key state
  const [geminiInput, setGeminiInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [hasKey, setHasKey] = useState(hasCustomGeminiKey());
  const envKeyExists = !!(import.meta.env.VITE_GEMINI_API_KEY as string);

  // Load existing key into input on mount
  useEffect(() => {
    const existing = getGeminiKey();
    if (existing) setGeminiInput(existing);
  }, []);

  const handleSaveKey = () => {
    setGeminiKey(geminiInput);
    setHasKey(true);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleClearKey = () => {
    clearGeminiKey();
    setGeminiInput((import.meta.env.VITE_GEMINI_API_KEY as string) || '');
    setHasKey(false);
  };

  if (!currentUser) return null;

  const initials = (currentUser.name || '?').charAt(0).toUpperCase();

  const profile = {
    name: currentUser.name || userProfile?.nickname || '',
    email: currentUser.email,
    age: currentUser.age || userProfile?.age || '',
    lifeStage: currentUser.lifeStage || userProfile?.lifeStage,
    cycleLength: currentUser.cycleLength || userProfile?.cycleLength || 28,
    communicationStyle: userProfile?.communicationStyle || 'balanced',
    reminderPreferences: userProfile?.reminderPreferences || [],
    hasDoctor: userProfile?.hasDoctor ?? false,
  };

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Left Navigation Rail */}
      <nav
        className="w-[30%] shrink-0 sticky top-0 self-start flex flex-col gap-1"
        style={{ padding: '40px 16px 0 24px' }}
      >
        {sections.map(s => {
          const Icon = s.icon;
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className="flex items-center gap-3 w-full cursor-pointer"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                height: 44,
                borderRadius: 12,
                padding: '0 16px',
                border: 'none',
                background: isActive
                  ? 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))'
                  : 'transparent',
                color: isActive ? '#ffffff' : 'var(--bloom-muted)',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bloom-lift)';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Icon size={18} />
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* Right Content Area */}
      <div
        className="flex-1 min-w-0 overflow-y-auto"
        style={{
          padding: '40px 40px 64px 0',
          maxHeight: 'calc(100vh - 64px)',
        }}
      >
        {/* ====== PROFILE SECTION ====== */}
        {activeSection === 'profile' && (
          <div className="flex flex-col gap-6">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center gap-3" style={{ paddingBottom: 24, paddingTop: 8 }}>
              <div
                className="flex items-center justify-center text-white font-bold"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))',
                  border: '3px solid var(--bloom-border)',
                  fontSize: 28,
                  fontFamily: "'Fraunces', serif",
                }}
              >
                {initials}
              </div>
              <h1
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--bloom-text)',
                  margin: 0,
                }}
              >
                {profile.name}
              </h1>
              {profile.lifeStage && (
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '4px 14px',
                    borderRadius: 99,
                    border: '1px solid var(--bloom-border)',
                    background: 'var(--bloom-surface)',
                    color: 'var(--bloom-muted)',
                  }}
                >
                  {stageLabel(profile.lifeStage)}
                </span>
              )}
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-5">
              {[
                { label: 'Name', value: profile.name },
                { label: 'Email', value: profile.email },
                { label: 'Age', value: String(profile.age) },
                { label: 'Life Stage', value: profile.lifeStage ? stageLabel(profile.lifeStage) : '-' },
                { label: 'Avg Cycle Length', value: `${profile.cycleLength} days` },
                { label: 'Communication Style', value: profile.communicationStyle.charAt(0).toUpperCase() + profile.communicationStyle.slice(1) },
              ].map(field => (
                <div key={field.label} className="flex flex-col gap-1.5">
                  <label
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--bloom-muted)',
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    readOnly
                    value={field.value}
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 16px',
                      background: 'var(--bloom-surface)',
                      border: '1px solid var(--bloom-border)',
                      borderRadius: 12,
                      color: 'var(--bloom-text)',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'default',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--bloom-glow)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.2)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--bloom-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              ))}
            </div>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontStyle: 'italic',
                color: 'var(--bloom-muted)',
                marginTop: 8,
              }}
            >
              Profile editing is disabled in demo mode.
            </p>
          </div>
        )}

        {/* ====== PREFERENCES SECTION ====== */}
        {activeSection === 'preferences' && (
          <div className="flex flex-col">
            {/* Reminder Preferences */}
            <div>
              <div className="flex items-center gap-4" style={{ padding: '16px 0' }}>
                <Bell size={20} style={{ color: 'var(--bloom-glow)' }} />
                <span
                  className="flex-1"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    color: 'var(--bloom-text)',
                  }}
                >
                  Reminder Preferences
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    color: 'var(--bloom-muted)',
                    textAlign: 'right',
                    maxWidth: 200,
                  }}
                >
                  {profile.reminderPreferences.length > 0
                    ? profile.reminderPreferences.join(', ')
                    : 'None selected'}
                </span>
              </div>
              <hr style={{ margin: 0, border: 'none', height: 0.5, background: 'var(--bloom-border)' }} />
            </div>

            {/* Regular Doctor */}
            <div>
              <div className="flex items-center gap-4" style={{ padding: '16px 0' }}>
                <Stethoscope size={20} style={{ color: 'var(--bloom-glow)' }} />
                <span
                  className="flex-1"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    color: 'var(--bloom-text)',
                  }}
                >
                  Regular Doctor
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    color: 'var(--bloom-muted)',
                  }}
                >
                  {profile.hasDoctor ? 'Yes' : 'Not currently'}
                </span>
              </div>
              <hr style={{ margin: 0, border: 'none', height: 0.5, background: 'var(--bloom-border)' }} />
            </div>

            {/* Life-Stage Adaptive UI */}
            <div>
              <div className="flex items-center gap-4" style={{ padding: '16px 0' }}>
                <Shield size={20} style={{ color: 'var(--bloom-glow)' }} />
                <span
                  className="flex-1"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    color: 'var(--bloom-text)',
                  }}
                >
                  Life-Stage Adaptive UI
                </span>
                <button
                  onClick={() => setLifeStageAdaptive(!lifeStageAdaptive)}
                  className="cursor-pointer"
                  style={{
                    width: 48,
                    height: 26,
                    borderRadius: 99,
                    border: 'none',
                    padding: 0,
                    position: 'relative',
                    background: lifeStageAdaptive
                      ? 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-teal))'
                      : 'var(--bloom-lift)',
                    transition: 'background 0.25s ease',
                  }}
                  aria-label="Toggle Life-Stage Adaptive UI"
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      position: 'absolute',
                      top: 3,
                      left: lifeStageAdaptive ? 25 : 3,
                      transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== API KEYS SECTION ====== */}
        {activeSection === 'api-keys' && (
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--bloom-text)',
                  margin: 0,
                }}
              >
                Gemini API Key
              </h2>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--bloom-muted)',
                  marginTop: 6,
                  lineHeight: 1.6,
                }}
              >
                Enter your own Google Gemini API key to power Ask Bloom, Body Forecast,
                Voice Extractor, and the monthly Bloom Letter — with no rate limits.
              </p>
            </div>

            {/* Status indicator */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: (hasKey || envKeyExists)
                  ? 'rgba(34, 197, 94, 0.08)'
                  : 'rgba(251, 191, 36, 0.08)',
                border: (hasKey || envKeyExists)
                  ? '1px solid rgba(34, 197, 94, 0.25)'
                  : '1px solid rgba(251, 191, 36, 0.25)',
              }}
            >
              <Sparkles size={16} style={{ color: (hasKey || envKeyExists) ? 'var(--bloom-teal)' : 'var(--bloom-amber)' }} />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--bloom-text)',
                }}
              >
                {hasKey
                  ? '✅ Using your custom Gemini key — unlimited AI access'
                  : envKeyExists
                    ? '✅ Using environment key — add your own for unlimited access'
                    : '⚠️ No Gemini key configured — AI features run in demo mode'}
              </span>
            </div>

            {/* Key input */}
            <div className="flex flex-col gap-2">
              <label
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--bloom-muted)',
                }}
              >
                API Key
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 flex items-center gap-2"
                  style={{
                    background: 'var(--bloom-surface)',
                    border: '1px solid var(--bloom-border)',
                    borderRadius: 12,
                    padding: '0 12px',
                    height: 48,
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <Key size={16} style={{ color: 'var(--bloom-muted)', flexShrink: 0 }} />
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={geminiInput}
                    onChange={e => setGeminiInput(e.target.value)}
                    placeholder="AIzaSy... (paste your Gemini API key)"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--bloom-text)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                    }}
                    onFocus={e => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.style.borderColor = 'var(--bloom-glow)';
                        parent.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.2)';
                      }
                    }}
                    onBlur={e => {
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.style.borderColor = 'var(--bloom-border)';
                        parent.style.boxShadow = 'none';
                      }
                    }}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--bloom-muted)',
                      padding: 4,
                      flexShrink: 0,
                    }}
                    title={showKey ? 'Hide key' : 'Show key'}
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveKey}
                disabled={!geminiInput.trim()}
                className="flex items-center gap-2 px-5 py-2.5 font-medium transition-all"
                style={{
                  background: geminiInput.trim()
                    ? 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))'
                    : 'var(--bloom-lift)',
                  color: geminiInput.trim() ? 'white' : 'var(--bloom-muted)',
                  borderRadius: 14,
                  border: 'none',
                  cursor: geminiInput.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  opacity: geminiInput.trim() ? 1 : 0.5,
                }}
              >
                {keySaved ? <Check size={16} /> : <Key size={16} />}
                {keySaved ? 'Saved!' : 'Save Key'}
              </button>

              {hasKey && (
                <button
                  onClick={handleClearKey}
                  className="flex items-center gap-2 px-4 py-2.5 font-medium transition-all"
                  style={{
                    background: 'rgba(232, 121, 160, 0.08)',
                    border: '1px solid rgba(232, 121, 160, 0.18)',
                    color: 'var(--bloom-rose)',
                    borderRadius: 14,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                  }}
                >
                  <X size={16} />
                  Clear Custom Key
                </button>
              )}
            </div>

            {/* Help text */}
            <div
              className="flex flex-col gap-3 p-4 rounded-xl"
              style={{
                background: 'var(--bloom-surface)',
                border: '1px solid var(--bloom-border)',
              }}
            >
              <h3
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--bloom-text)',
                  margin: 0,
                }}
              >
                How to get a key
              </h3>
              <ol
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: 'var(--bloom-muted)',
                  lineHeight: 1.8,
                  paddingLeft: 18,
                  margin: 0,
                }}
              >
                <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bloom-glow)', textDecoration: 'underline' }}>Google AI Studio</a></li>
                <li>Click <strong style={{ color: 'var(--bloom-text)' }}>"Create API Key"</strong></li>
                <li>Copy the key and paste it above</li>
              </ol>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontStyle: 'italic',
                  color: 'var(--bloom-muted)',
                  margin: 0,
                }}
              >
                🔒 Your key is stored only in your browser's local storage and never sent to our servers.
              </p>
            </div>
          </div>
        )}

        {/* ====== ABOUT SECTION ====== */}
        {activeSection === 'about' && (
          <div
            className="flex flex-col items-center gap-6"
            style={{
              padding: '48px 32px',
              borderRadius: 16,
              background: 'var(--bloom-void)',
              border: '1px solid var(--bloom-border)',
            }}
          >
            <BloomFlower />
            <p
              className="text-center max-w-md"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: 'var(--bloom-muted)',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              BLOOM is an AI-powered women's health companion that helps you track symptoms,
              detect patterns, and prepare for doctor visits. Our AI analyzes your data to find
              meaningful patterns — never to diagnose. Always consult a healthcare professional
              for medical decisions.
            </p>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: 'var(--bloom-muted)',
                margin: 0,
              }}
            >
              Version 1.0.0 · Hackathon MVP
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
