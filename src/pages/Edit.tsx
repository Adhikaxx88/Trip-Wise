import { useState, type DragEvent } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import ItineraryAssistant from '../components/ItineraryAssistant';
import Logo from '../components/Logo';
import PlaceCard from '../components/PlaceCard';
import { useCurrentTrip } from '../context/CurrentTripContext';
import { useSavedTrips } from '../context/SavedTripsContext';
import { exportItineraryToPdf } from '../logic/exportItineraryPdf';
import { dayCostPerPerson, getSuggestedActivities } from '../logic/matchTrip';
import {
  airportMapsLink,
  dailyTransportCostIDR,
  FLIGHT_PLACEHOLDER_IMAGE,
  formatIDR,
  getHeroImages,
  hotelAreaMapsLink,
  hotelRating,
  HOTEL_PLACEHOLDER_IMAGE,
} from '../logic/tripMedia';
import { useResolvedTrip } from '../logic/useResolvedTrip';
import type { ItineraryActivity, ItineraryDay, TripPackage } from '../types';

export default function Edit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resolved = useResolvedTrip(id);
  const { updateCurrentTripPackage, currentTrip } = useCurrentTrip();
  const { updateSavedTrip } = useSavedTrips();

  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(resolved?.package.itinerary ?? null);
  const [costBreakdown, setCostBreakdown] = useState(resolved?.package.costBreakdown ?? null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!resolved || !itinerary || !costBreakdown) {
    return <Navigate to="/questionnaire" replace />;
  }

  const { package: pkg, preferences, savedId } = resolved;
  const groupSize = preferences.groupSize ?? 1;
  const heroImages = getHeroImages(pkg);
  const primaryCity = pkg.cities?.[0] ?? pkg.destination.split(',')[0].trim();

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

  const buildUpdatedPackage = (): TripPackage => ({ ...pkg, itinerary, costBreakdown });

  const handleSave = () => {
    const updatedPkg = buildUpdatedPackage();
    if (currentTrip && currentTrip.package.id === pkg.id) {
      updateCurrentTripPackage(updatedPkg);
    }
    if (savedId) {
      updateSavedTrip(savedId, updatedPkg);
    }
    setSavedNotice(true);
    setShowSummary(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportPdf = () => {
    exportItineraryToPdf(buildUpdatedPackage(), preferences);
  };

  const makeHotelCheaper = () => {
    setCostBreakdown((prev) => {
      if (!prev) return prev;
      return { ...prev, hotel: { ...prev.hotel, cost: Math.round(prev.hotel.cost * 0.8) } };
    });
    setSavedNotice(false);
  };

  const addGenericActivity = () => {
    if (itinerary.length === 0) return;
    addActivity(0);
  };

  const activitiesTotalPerPerson = itinerary.reduce((sum, day) => sum + dayCostPerPerson(day), 0);
  const grandTotal = activitiesTotalPerPerson * groupSize + costBreakdown.hotel.cost + costBreakdown.flight.cost;

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

      {/* Hero preview strip */}
      <div className="flex gap-3 overflow-x-auto px-4 py-4 sm:px-12" style={{ scrollbarWidth: 'thin' }}>
        {heroImages.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`${pkg.destination} preview ${i + 1}`}
            className="h-32 w-48 shrink-0 rounded-xl object-cover shadow-sm sm:h-40 sm:w-64"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://source.unsplash.com/800x500/?travel+destination+beautiful';
            }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Edit your itinerary</h1>
        <p className="mt-2 text-sm text-ink/60 sm:text-base">
          {pkg.destination} · {itinerary.length} days
        </p>
        <p className="mt-1 text-xs text-ink/40">Drag a day by its handle to reorder your trip.</p>

        {showSummary && (
          <div className="mt-6 rounded-2xl border border-gold-accent/40 bg-gold-accent/10 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Trip summary</p>
                <p className="text-xs text-ink/60">
                  {pkg.destination} · {itinerary.length} days · {groupSize} traveler{groupSize > 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSummary(false)}
                className="cursor-pointer rounded-full px-2 py-1 text-ink/40 hover:text-ink"
                aria-label="Dismiss summary"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-ink/50">Hotel</p>
                <p className="font-display text-ocean-mid">${costBreakdown.hotel.cost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-ink/50">Flight</p>
                <p className="font-display text-ocean-mid">${costBreakdown.flight.cost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-ink/50">Activities / person</p>
                <p className="font-display text-ocean-mid">${activitiesTotalPerPerson.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-ink/50">Grand total</p>
                <p className="font-display text-ocean-mid">${grandTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hotel & flight booking sections */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
            <img
              src={HOTEL_PLACEHOLDER_IMAGE}
              alt="Hotel"
              className="h-32 w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://source.unsplash.com/800x500/?travel+destination+beautiful';
              }}
            />
            <div className="p-4">
              <p className="text-sm font-semibold text-ink">{costBreakdown.hotel.name}</p>
              <p className="mt-1 text-xs text-ink/50">{hotelRating(costBreakdown.hotel.name)}★ · Hotel</p>
              <a
                href={hotelAreaMapsLink(costBreakdown.hotel.name, primaryCity)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-medium text-ocean-mid hover:text-ocean-deep"
              >
                📍 View area on Maps
              </a>
              <p className="mt-2 font-display text-lg text-ocean-mid">
                ${costBreakdown.hotel.cost.toLocaleString()}
              </p>
              <a href={costBreakdown.hotel.bookingUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="accent" className="mt-3 w-full px-4 py-2 text-sm">
                  Book on Traveloka
                </Button>
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
            <img
              src={FLIGHT_PLACEHOLDER_IMAGE}
              alt="Flight"
              className="h-32 w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://source.unsplash.com/800x500/?travel+destination+beautiful';
              }}
            />
            <div className="p-4">
              <p className="text-sm font-semibold text-ink">✈️ {costBreakdown.flight.name}</p>
              <p className="mt-1 text-xs text-ink/50">Your city → {pkg.destination}</p>
              <a
                href={airportMapsLink(primaryCity)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-medium text-ocean-mid hover:text-ocean-deep"
              >
                📍 Airport
              </a>
              <p className="mt-2 font-display text-lg text-ocean-mid">
                ${costBreakdown.flight.cost.toLocaleString()}
              </p>
              <a href={costBreakdown.flight.bookingUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="accent" className="mt-3 w-full px-4 py-2 text-sm">
                  Book on Traveloka
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {itinerary.map((day, dayIndex) => {
            const suggestions = getSuggestedActivities(
              pkg.id,
              day.activities.map((a) => a.name),
              day.day,
            );
            const dayTotalPerPerson = dayCostPerPerson(day);
            const dayTotal = dayTotalPerPerson * groupSize;
            const transportCost = dailyTransportCostIDR(pkg.id, day.day);
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

                <div className="mt-3 flex items-center gap-2 rounded-lg bg-ocean-mid/5 px-3 py-2 text-xs text-ocean-deep">
                  <span>🚌</span>
                  <span>Estimated local transport (car/bus/MRT): {formatIDR(transportCost)}</span>
                </div>

                <ul className="mt-4 space-y-2">
                  {day.activities.map((activity, activityIndex) => (
                    <PlaceCard
                      key={activityIndex}
                      activity={activity}
                      destination={pkg.destination}
                      onChangeName={(v) => updateActivity(dayIndex, activityIndex, 'name', v)}
                      onChangeTime={(v) => updateActivity(dayIndex, activityIndex, 'time', v)}
                      onChangePrice={(v) => updateActivityPrice(dayIndex, activityIndex, v)}
                      onRemove={() => removeActivity(dayIndex, activityIndex)}
                    />
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

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button variant="primary" onClick={handleSave}>
            Save changes
          </Button>
          <Button variant="ghost" onClick={handleExportPdf}>
            Export to PDF ↓
          </Button>
          {savedNotice && <span className="text-sm font-medium text-ocean-mid">Changes saved ✓</span>}
        </div>
      </div>

      <ItineraryAssistant onCheaperHotel={makeHotelCheaper} onAddActivity={addGenericActivity} />
    </div>
  );
}
