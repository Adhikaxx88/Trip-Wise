import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { SavedTrip, TripPackage, TripPreferences } from '../types';

const STORAGE_KEY = 'tripwise.savedTrips';

function loadSavedTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedTrip[];
  } catch {
    return [];
  }
}

function persist(trips: SavedTrip[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch {
    // ignore — trips still available for this session
  }
}

interface SavedTripsContextValue {
  savedTrips: SavedTrip[];
  saveTrip: (pkg: TripPackage, preferences: TripPreferences) => SavedTrip;
  updateSavedTrip: (savedId: string, pkg: TripPackage) => void;
  removeSavedTrip: (savedId: string) => void;
  isSaved: (packageId: string) => boolean;
  getSavedTrip: (savedId: string) => SavedTrip | undefined;
}

const SavedTripsContext = createContext<SavedTripsContextValue | null>(null);

export function SavedTripsProvider({ children }: { children: ReactNode }) {
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>(loadSavedTrips);

  const saveTrip = (pkg: TripPackage, preferences: TripPreferences) => {
    const existing = savedTrips.find((t) => t.package.id === pkg.id);
    if (existing) {
      const updated: SavedTrip = { ...existing, package: pkg, preferences };
      const next = savedTrips.map((t) => (t.savedId === existing.savedId ? updated : t));
      setSavedTrips(next);
      persist(next);
      return updated;
    }
    const newTrip: SavedTrip = {
      savedId: `${pkg.id}-${Date.now()}`,
      package: pkg,
      preferences,
      savedAt: new Date().toISOString(),
    };
    const next = [newTrip, ...savedTrips];
    setSavedTrips(next);
    persist(next);
    return newTrip;
  };

  const updateSavedTrip = (savedId: string, pkg: TripPackage) => {
    const next = savedTrips.map((t) => (t.savedId === savedId ? { ...t, package: pkg } : t));
    setSavedTrips(next);
    persist(next);
  };

  const removeSavedTrip = (savedId: string) => {
    const next = savedTrips.filter((t) => t.savedId !== savedId);
    setSavedTrips(next);
    persist(next);
  };

  const isSaved = (packageId: string) => savedTrips.some((t) => t.package.id === packageId);

  const getSavedTrip = (savedId: string) => savedTrips.find((t) => t.savedId === savedId);

  const value = useMemo(
    () => ({ savedTrips, saveTrip, updateSavedTrip, removeSavedTrip, isSaved, getSavedTrip }),
    [savedTrips],
  );

  return <SavedTripsContext.Provider value={value}>{children}</SavedTripsContext.Provider>;
}

export function useSavedTrips() {
  const ctx = useContext(SavedTripsContext);
  if (!ctx) throw new Error('useSavedTrips must be used within SavedTripsProvider');
  return ctx;
}
