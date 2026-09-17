import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { createEmptyPreferences } from '../types';
import type { TripPreferences } from '../types';

const STORAGE_KEY = 'tripwise.preferences';

function loadPreferences(): TripPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyPreferences();
    return { ...createEmptyPreferences(), ...JSON.parse(raw) };
  } catch {
    return createEmptyPreferences();
  }
}

interface TripPreferencesContextValue {
  preferences: TripPreferences;
  updatePreferences: (patch: Partial<TripPreferences>) => void;
  resetPreferences: () => void;
}

const TripPreferencesContext = createContext<TripPreferencesContextValue | null>(null);

export function TripPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<TripPreferences>(loadPreferences);

  const updatePreferences = (patch: Partial<TripPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable — preferences still work for this session
      }
      return next;
    });
  };

  const resetPreferences = () => {
    const empty = createEmptyPreferences();
    setPreferences(empty);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const value = useMemo(
    () => ({ preferences, updatePreferences, resetPreferences }),
    [preferences],
  );

  return <TripPreferencesContext.Provider value={value}>{children}</TripPreferencesContext.Provider>;
}

export function useTripPreferences() {
  const ctx = useContext(TripPreferencesContext);
  if (!ctx) throw new Error('useTripPreferences must be used within TripPreferencesProvider');
  return ctx;
}
