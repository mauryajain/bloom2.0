// ============================================================
// BLOOM — Gemini API Key Manager
// Reads from localStorage first, falls back to env variable.
// This lets judges / evaluators paste their own paid key in the
// Settings page so they can test without limits.
// ============================================================

const STORAGE_KEY = 'bloom_gemini_api_key';

/**
 * Returns the active Gemini API key.
 * Priority: localStorage (user-provided) → VITE_GEMINI_API_KEY env var
 */
export function getGeminiKey(): string {
  const userKey = localStorage.getItem(STORAGE_KEY);
  if (userKey && userKey.trim()) return userKey.trim();
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
}

/** Persist a user-provided Gemini key to localStorage. */
export function setGeminiKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Remove the user-provided key (reverts to env fallback). */
export function clearGeminiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Check whether a user has stored a custom key. */
export function hasCustomGeminiKey(): boolean {
  const userKey = localStorage.getItem(STORAGE_KEY);
  return !!userKey && userKey.trim().length > 0;
}
