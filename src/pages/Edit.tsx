import { useState, type DragEvent } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import ChatFab from '../components/ChatFab';
import Logo from '../components/Logo';
import TimePicker from '../components/TimePicker';
import { useCurrentTrip } from '../context/CurrentTripContext';
import { useSavedTrips } from '../context/SavedTripsContext';
import { dayCostPerPerson, getSuggestedActivities } from '../logic/matchTrip';
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!resolved || !itinerary) {
    return <Navigate to="/questionnaire" replace />;
  }

  const { package: pkg, preferences, savedId } = resolved;
  const groupSize = preferences.groupSize ?? 1;

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

  const updateActivityPrice = (dayIndex: number, activityIndex: number, value: string) => {
    const parsed = parseFloat(value);
    const price = value.trim() === '' ? undefined : Number.isFinite(parsed) ? parsed : undefined;
    setItinerary((prev) => {
      if (!prev) return prev;
      return prev.map((day, i) => {
        if (i !== dayIndex) return day;
        const activities = day.activities.map((a, j) => (j === activityIndex ? { ...a, price } : a));
        return { ...day, activities };
      });
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
        i === dayIndex
          ? { ...day, activities: [...day.activities, { time: '9:00 AM', name: 'New activity', price: 0 }] }
          : day,
      );
    });
    setSavedNotice(false);
  };

  const addSuggestedActivity = (dayIndex: number, activity: ItineraryActivity) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      return prev.map((day, i) =>
        i === dayIndex ? { ...day, activities: [...day.activities, activity] } : day,
      );
    });
    setSavedNotice(false);
  };

  const reorderDays = (fromIndex: number, toIndex: number) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((day, i) => ({ ...day, day: i + 1 }));
    });
    setSavedNotice(false);
  };

  const handleDragStart = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderDays(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
        <p className="mt-1 text-xs text-ink/40">Drag a day by its handle to reorder your trip.</p>

        <div className="mt-8 space-y-6">
          {itinerary.map((day, dayIndex) => {
            const suggestions = getSuggestedActivities(
              pkg.id,
              day.activities.map((a) => a.name),
              day.day,
            );
            const dayTotalPerPerson = dayCostPerPerson(day);
            const dayTotal = dayTotalPerPerson * groupSize;
            return (
              <div
                key={day.day}
                onDragOver={handleDragOver(dayIndex)}
                onDrop={handleDrop(dayIndex)}
                className={`rounded-2xl border bg-white p-4 shadow-sm transition-shadow sm:p-6 ${
                  dragOverIndex === dayIndex ? 'border-ocean-mid ring-2 ring-ocean-mid/30' : 'border-ink/10'
                } ${draggedIndex === dayIndex ? 'opacity-40' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      draggable
                      onDragStart={handleDragStart(dayIndex)}
                      onDragEnd={handleDragEnd}
                      className="cursor-grab select-none text-ink/30 hover:text-ink/60 active:cursor-grabbing"
                      aria-label="Drag to reorder this day"
                      title="Drag to reorder"
                    >
                      ⠿
                    </span>
                    <span className="font-display text-2xl text-ocean-mid">
                      {String(day.day).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg font-semibold">{day.title}</h3>
                  </div>
                  {dayTotal > 0 && (
                    <div className="text-right text-xs text-ink/50">
                      <p className="font-display text-base text-ocean-mid">${dayTotal.toLocaleString()}</p>
                      <p>${dayTotalPerPerson.toLocaleString()} / person</p>
                    </div>
                  )}
                </div>

                <ul className="mt-4 space-y-2">
                  {day.activities.map((activity, activityIndex) => (
                    <li key={activityIndex} className="flex items-center gap-1.5 sm:gap-2">
                      <TimePicker
                        value={activity.time ?? '9:00 AM'}
                        onChange={(v) => updateActivity(dayIndex, activityIndex, 'time', v)}
                      />
                      <input
                        value={activity.name}
                        onChange={(e) => updateActivity(dayIndex, activityIndex, 'name', e.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-ink/10 px-2 py-1.5 text-sm focus:border-ocean-mid focus:outline-none sm:px-3"
                      />
                      <div className="flex shrink-0 items-center gap-0.5">
                        <span className="text-xs text-ink/40">$</span>
                        <input
                          type="number"
                          min={0}
                          value={activity.price ?? ''}
                          onChange={(e) => updateActivityPrice(dayIndex, activityIndex, e.target.value)}
                          placeholder="0"
                          className="w-14 rounded-lg border border-ink/10 px-1.5 py-1.5 text-xs focus:border-ocean-mid focus:outline-none"
                        />
                      </div>
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

                {suggestions.length > 0 && (
                  <div className="mt-3 border-t border-ink/10 pt-3">
                    <p className="text-xs font-medium text-ink/40">You could also add:</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {suggestions.map((activity) => (
                        <button
                          key={activity.name}
                          type="button"
                          onClick={() => addSuggestedActivity(dayIndex, activity)}
                          className="rounded-full border border-ocean-light/40 bg-ocean-light/5 px-3 py-1 text-xs font-medium text-ocean-deep hover:bg-ocean-light/15 cursor-pointer"
                        >
                          + {activity.name}
                          {typeof activity.price === 'number' && activity.price > 0 && ` ($${activity.price})`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
