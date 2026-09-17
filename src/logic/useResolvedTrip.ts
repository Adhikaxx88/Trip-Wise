import { useCurrentTrip } from '../context/CurrentTripContext';
import { useSavedTrips } from '../context/SavedTripsContext';
import type { TripPackage, TripPreferences } from '../types';

export interface ResolvedTrip {
  package: TripPackage;
  preferences: TripPreferences;
  savedId: string | null;
}

export function useResolvedTrip(id: string | undefined): ResolvedTrip | null {
  const { currentTrip } = useCurrentTrip();
  const { getSavedTrip, savedTrips } = useSavedTrips();

  if (!id) return null;

  const saved = getSavedTrip(id);
  if (saved) {
    return { package: saved.package, preferences: saved.preferences, savedId: saved.savedId };
  }

  const bySavedPackageId = savedTrips.find((t) => t.package.id === id);
  if (currentTrip && currentTrip.package.id === id) {
    return {
      package: currentTrip.package,
      preferences: currentTrip.preferences,
      savedId: bySavedPackageId?.savedId ?? null,
    };
  }

  if (bySavedPackageId) {
    return {
      package: bySavedPackageId.package,
      preferences: bySavedPackageId.preferences,
      savedId: bySavedPackageId.savedId,
    };
  }

  return null;
}
