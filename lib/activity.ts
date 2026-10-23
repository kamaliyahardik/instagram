"use client";

// Guest-first activity log (localStorage). Logged-in users additionally get
// server history via /api/history — this keeps the dashboard alive for
// everyone with zero signup.
export type ActivityEntry = {
  id: string;
  date: string;
  kind: "resolve" | "download";
  url: string;
  platform: string;
  title?: string;
};

const KEY = "umd-activity-v1";
const MAX = 100;

export function logActivity(e: Omit<ActivityEntry, "id" | "date">): void {
  try {
    const entry: ActivityEntry = {
      ...e,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
    };
    const prev = getActivity();
    localStorage.setItem(KEY, JSON.stringify([entry, ...prev].slice(0, MAX)));
    window.dispatchEvent(new Event("umd-activity"));
  } catch {
    /* private mode etc. */
  }
}

export function getActivity(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : [];
  } catch {
    return [];
  }
}

export function clearActivity(): void {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("umd-activity"));
  } catch {
    /* noop */
  }
}
