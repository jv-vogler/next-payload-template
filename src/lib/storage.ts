function isClient(): boolean {
  return typeof window !== "undefined";
}

export const storage = {
  get<T>(key: string): T | null {
    if (!isClient()) return null;

    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (!isClient()) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or access denied — silently ignore
    }
  },
};
