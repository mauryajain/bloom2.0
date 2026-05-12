import { supabase } from './supabase';
import type { QuestionnaireData } from '../types';

const BASE = import.meta.env.VITE_API_URL;

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`
  };
}

export const api = {
  // ---- Logs ----
  getLogs: async () => {
    const res = await fetch(`${BASE}/api/logs`, { headers: await getHeaders() });
    return res.json();
  },
  addLog: async (log: object) => {
    const res = await fetch(`${BASE}/api/logs`, {
      method: 'POST', headers: await getHeaders(), body: JSON.stringify(log)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add log');
    return data;
  },

  // ---- Ask Bloom AI ----
  askBloom: async (message: string, conversationId?: string) => {
    const res = await fetch(`${BASE}/api/askbloom`, {
      method: 'POST', headers: await getHeaders(),
      body: JSON.stringify({ message, conversationId })
    });
    return res.json();
  },

  // ---- Auth & Registration ----
  register: async (email: string, password: string, name: string) => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  // ---- Questionnaire ----
  saveQuestionnaire: async (questionnaire: QuestionnaireData) => {
    const res = await fetch(`${BASE}/api/auth/questionnaire`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(questionnaire)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save questionnaire');
    return data;
  },

  // ---- Profile ----
  getProfile: async () => {
    const res = await fetch(`${BASE}/api/auth/profile`, {
      headers: await getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
    return data;
  }
};
