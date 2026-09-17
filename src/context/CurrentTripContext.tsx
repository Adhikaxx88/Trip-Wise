import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { TripPackage, TripPreferences } from '../types';

const STORAGE_KEY = 'tripwise.currentTrip';

interface CurrentTripState {
  package: TripPackage;
  preferences: TripPreferences;
}

function loadCurrentTrip(): CurrentTripState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CurrentTripState;
  } catch {
    return null;
  }
}

interface CurrentTripContextValue {
  currentTrip: CurrentTripState | null;
  setCurrentTrip: (pkg: TripPackage, preferences: TripPreferences) => void;
  updateCurrentTripPackage: (pkg: TripPackage) => void;
}

const CurrentTripContext = createContext<CurrentTripContextValue | null>(null);

export function CurrentTripProvider({ children }: { children: ReactNode }) {
  const [currentTrip, setCurrentTripState] = useState<CurrentTripState | null>(loadCurrentTrip);

  const persist = (state: CurrentTripState | null) => {
    try {
      if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const setCurrentTrip = (pkg: TripPackage, preferences: TripPreferences) => {
    const next = { package: pkg, preferences };
    setCurrentTripState(next);
    persist(next);
  };

  const updateCurrentTripPackage = (pkg: TripPackage) => {
    setCurrentTripState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, package: pkg };
      persist(next);
      return next;
    });
  };

  const value = useMemo(
    () => ({ currentTrip, setCurrentTrip, updateCurrentTripPackage }),
    [currentTrip],
  );

  return <CurrentTripContext.Provider value={value}>{children}</CurrentTripContext.Provider>;
}

export function useCurrentTrip() {
  const ctx = useContext(CurrentTripContext);
  if (!ctx) throw new Error('useCurrentTrip must be used within CurrentTripProvider');
  return ctx;
}
