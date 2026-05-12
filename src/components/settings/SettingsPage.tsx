// ============================================================
// BLOOM — Settings Page
// Agent 1 (Full-Stack Lead)
// ============================================================

import { useBloomStore } from '../../store/useBloomStore';
import { lifeStages } from '../../data/lifeStages';
import { Settings, User, Bell, Shield, Palette, Stethoscope } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, userProfile } = useBloomStore();

  if (!currentUser) return null;

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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-display)] flex items-center gap-2">
          <Settings className="text-bloom-500" size={24} /> Settings
        </h1>
        <p className="text-warm-400 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><User size={16} className="text-bloom-500" /> Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-warm-500 mb-1 block">Name</label>
            <input className="bloom-input" value={profile.name} readOnly />
          </div>
          <div>
            <label className="text-xs font-medium text-warm-500 mb-1 block">Email</label>
            <input className="bloom-input" value={profile.email} readOnly />
          </div>
          <div>
            <label className="text-xs font-medium text-warm-500 mb-1 block">Age</label>
            <input className="bloom-input" value={profile.age} readOnly />
          </div>
          <div>
            <label className="text-xs font-medium text-warm-500 mb-1 block">Life Stage</label>
            <select className="bloom-input" value={profile.lifeStage} disabled>
              {lifeStages.map(ls => (
                <option key={ls.stage} value={ls.stage}>
                  {ls.stage.charAt(0).toUpperCase() + ls.stage.slice(1).replace('-', ' ')} ({ls.ageRange})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-warm-500 mb-1 block">Avg Cycle Length</label>
            <input className="bloom-input" value={`${profile.cycleLength} days`} readOnly />
          </div>
          <div>
            <label className="text-xs font-medium text-warm-500 mb-1 block">Communication Style</label>
            <input className="bloom-input capitalize" value={profile.communicationStyle} readOnly />
          </div>
        </div>
        <p className="text-xs text-warm-400 italic">Profile editing is disabled in demo mode.</p>
      </div>

      {/* Preferences */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Palette size={16} className="text-bloom-500" /> Preferences</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-warm-50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-bloom-500" />
              <span className="text-sm">Reminder Preferences</span>
            </div>
            <span className="text-xs text-warm-500 text-right max-w-xs">
              {profile.reminderPreferences.length > 0 ? profile.reminderPreferences.join(', ') : 'None selected'}
            </span>
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-warm-50">
            <div className="flex items-center gap-2">
              <Stethoscope size={16} className="text-bloom-500" />
              <span className="text-sm">Regular Doctor</span>
            </div>
            <span className="text-xs text-warm-500">{profile.hasDoctor ? 'Yes' : 'Not currently'}</span>
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-warm-50">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-bloom-500" />
              <span className="text-sm">Life-Stage Adaptive UI</span>
            </div>
            <div className="w-10 h-6 bg-bloom-500 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
            </div>
          </label>
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-2">About BLOOM</h2>
        <p className="text-sm text-warm-500 leading-relaxed">
          BLOOM is an AI-powered women's health companion that helps you track symptoms, detect patterns, and prepare for doctor visits.
          Our AI analyzes your data to find meaningful patterns — never to diagnose. Always consult a healthcare professional for medical decisions.
        </p>
        <p className="text-xs text-warm-400 mt-3">Version 1.0.0 · Hackathon MVP · Built with ❤️</p>
      </div>
    </div>
  );
}
