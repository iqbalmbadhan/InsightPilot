import type { StoredSession, AnalysisResult, DataSummary } from "@/types";

const STORAGE_KEY = "insightpilot_session";

export function saveSession(
  result: AnalysisResult,
  summary?: DataSummary,
  fileName?: string
): void {
  try {
    const session: StoredSession = {
      result,
      summary,
      fileName,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage may be unavailable in some environments
  }
}

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as StoredSession;

    // Expire sessions older than 24 hours
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (Date.now() - session.timestamp > oneDayMs) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
