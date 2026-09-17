import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import ChatFab from '../components/ChatFab';
import Logo from '../components/Logo';
import { useCurrentTrip } from '../context/CurrentTripContext';
import { useSavedTrips } from '../context/SavedTripsContext';
import { getDestinationTemplate, regenerateDay } from '../logic/matchTrip';
import { useResolvedTrip } from '../logic/useResolvedTrip';
import type { ItineraryActivity, ItineraryDay } from '../types';

export default function Edit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resolved = useResolvedTrip(id);
  const { updateCurrentTripPackage, currentTrip } = useCurrentTrip();
  const { updateSavedTrip } = useSavedTrips();

  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(resolved?.package.itinerary ?? null);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!resolved || !itinerary) {
    return <Navigate to="/questionnaire" replace />;
  }

  const { package: pkg, savedId } = resolved;
  const template = getDestinationTemplate(pkg.id);

  const moveDay = (index: number, direction: -1 | 1) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((day, i) => ({ ...day, day: i + 1 }));
    });
    setSavedNotice(false);
  };

  const regenerate = (index: number) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = regenerateDay(template, next[index].day, next.length);
      return next;
    });
    setSavedNotice(false);
  };

  const updateActivity = (dayIndex: number, activityIndex: number, field: keyof ItineraryActivity, value: string) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      const next = prev.map((day, i) => {
        if (i !== dayIndex) return day;
        const activities = day.activities.map((a, j) =>
          j === activityIndex ? { ...a, [field]: value } : a,
        );
        return { ...day, activities };
      });
      return next;
    });
    setSavedNotice(false);
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      return prev.map((day, i) =>
        i === dayIndex
          ? { ...day, activities: day.activities.filter((_, j) => j !== activityIndex) }
          : day,
      );
    });
    setSavedNotice(false);
  };

  const addActivity = (dayIndex: number) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      return prev.map((day, i) =>
        i === dayIndex ? { ...day, activities: [...day.activities, { name: 'New activity' }] } : day,
      );
    });
    setSavedNotice(false);
  };

  const handleSave = () => {
    const updatedPkg = { ...pkg, itinerary };
    if (currentTrip && currentTrip.package.id === pkg.id) {
      updateCurrentTripPackage(updatedPkg);
    }
    if (savedId) {
      updateSavedTrip(savedId, updatedPkg);
    }
    setSavedNotice(true);
  };

  return (
    <div className="min-h-dvh bg-surface pb-24 text-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-ocean-deepest px-4 py-5 text-white sm:px-12 sm:py-6">
        <Logo />
        <Button
          variant="secondary"
          className="px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
          onClick={() => navigate(`/trip/${pkg.id}`)}
        >
          Back to summary
        </Button>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Edit your itinerary</h1>
        <p className="mt-2 text-sm text-ink/60 sm:text-base">
          {pkg.destination} · {itinerary.length} days
        </p>

        <div className="mt-8 space-y-6">
          {itinerary.map((day, dayIndex) => (
            <div
              key={day.day}
              className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-2xl text-ocean-mid">
                    {String(day.day).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg font-semibold">{day.title}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveDay(dayIndex, -1)}
                    disabled={dayIndex === 0}
                    className="rounded-full border border-ink/15 px-2.5 py-1 text-sm disabled:opacity-30 cursor-pointer"
                    aria-label="Move day earlier"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDay(dayIndex, 1)}
                    disabled={dayIndex === itinerary.length - 1}
                    className="rounded-full border border-ink/15 px-2.5 py-1 text-sm disabled:opacity-30 cursor-pointer"
                    aria-label="Move day later"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => regenerate(dayIndex)}
                    className="rounded-full bg-ocean-mid/10 px-3 py-1 text-xs font-semibold text-ocean-deep hover:bg-ocean-mid/20 cursor-pointer"
                  >
                    Regenerate day
                  </button>
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {day.activities.map((activity, activityIndex) => (
                  <li key={activityIndex} className="flex items-center gap-1.5 sm:gap-2">
                    <input
                      value={activity.time ?? ''}
                      onChange={(e) => updateActivity(dayIndex, activityIndex, 'time', e.target.value)}
                      placeholder="Time"
                      className="w-[4.5rem] shrink-0 rounded-lg border border-ink/10 px-1 py-1.5 text-xs focus:border-ocean-mid focus:outline-none sm:w-20 sm:px-2"
                    />
                    <input
                      value={activity.name}
                      onChange={(e) => updateActivity(dayIndex, activityIndex, 'name', e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-ink/10 px-2 py-1.5 text-sm focus:border-ocean-mid focus:outline-none sm:px-3"
                    />
                    <button
                      type="button"
                      onClick={() => removeActivity(dayIndex, activityIndex)}
                      className="shrink-0 rounded-full px-2 py-1 text-ink/40 hover:text-red-500 cursor-pointer"
                      aria-label="Remove activity"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => addActivity(dayIndex)}
                className="mt-3 text-sm font-semibold text-ocean-mid hover:text-ocean-deep cursor-pointer"
              >
                + Add activity
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-4">
          <Button variant="primary" onClick={handleSave}>
            Save changes
          </Button>
          {savedNotice && <span className="text-sm font-medium text-ocean-mid">Changes saved ✓</span>}
        </div>
      </div>

      <ChatFab />
    </div>
  );
}
