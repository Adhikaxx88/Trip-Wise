import { useState, type DragEvent } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import Button from '../components/Button';
import CityStayStrip from '../components/CityStayStrip';
import DayCard from '../components/DayCard';
import FlightPicker from '../components/FlightPicker';
import GradientBackdrop from '../components/GradientBackdrop';
import HotelPicker from '../components/HotelPicker';
import ItineraryAssistant from '../components/ItineraryAssistant';
import Logo from '../components/Logo';
import { getCityImage, getHotelImage, getTransportImage, handleImageError, trustedImage } from '../data/getImage';
import { getFlightOption, getHotelOption } from '../data/hotelFlightOptions';
import { useCurrentTrip } from '../context/CurrentTripContext';
import { useSavedTrips } from '../context/SavedTripsContext';
import { exportItineraryToPdf } from '../logic/exportItineraryPdf';
import { dayCostPerPerson } from '../logic/matchTrip';
import { useResolvedTrip } from '../logic/useResolvedTrip';
import type { BookableItem, CostBreakdown, HotelTier, ItineraryActivity, ItineraryDay } from '../types';

export default function Edit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resolved = useResolvedTrip(id);
  const { updateCurrentTripPackage, currentTrip } = useCurrentTrip();
  const { updateSavedTrip } = useSavedTrips();

  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(resolved?.package.itinerary ?? null);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(resolved?.package.costBreakdown ?? null);
  const [selectedHotelTier, setSelectedHotelTier] = useState<HotelTier>(
    resolved?.package.selectedHotelTier ?? 'standard',
  );
  const [selectedFlightId, setSelectedFlightId] = useState<string>(
    resolved?.package.selectedFlightId ?? resolved?.package.flightOptions?.[0]?.id ?? '',
  );
  const [savedNotice, setSavedNotice] = useState(false);
  const [editingHotel, setEditingHotel] = useState(false);
  const [editingFlight, setEditingFlight] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!resolved || !itinerary || !costBreakdown) {
    return <Navigate to="/questionnaire" replace />;
  }

  const { package: pkg, preferences, savedId } = resolved;
  const groupSize = preferences.groupSize ?? 1;
  const tripCities = pkg.cities ?? [];
  const isMultiCity = tripCities.length > 1;
  const destinationLabel = tripCities.length > 0 ? tripCities.join(' · ') : pkg.destination;
  const heroImage = tripCities[0] ? getCityImage(tripCities[0], 'hero') : trustedImage(pkg.coverImageUrl);
  const selectedHotel = pkg.hotelOptions?.length ? getHotelOption(pkg.hotelOptions, selectedHotelTier) : undefined;
  const hotelThumb = getHotelImage(selectedHotel?.tier ?? selectedHotelTier);
  const primaryCity = pkg.cities?.[0] ?? pkg.destination.split(',')[0].trim();
  const primaryCountry = pkg.cities?.[0] ? preferences.selectedCities?.[0]?.country : undefined;
  const nights = Math.max(1, itinerary.length - 1);
  const rooms = Math.max(1, Math.ceil(groupSize / 2));

  const updateActivityField = (dayIndex: number, activityIndex: number, field: 'name' | 'time', value: string) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      return prev.map((day, i) => {
        if (i !== dayIndex) return day;
        const activities = day.activities.map((a, j) => (j === activityIndex ? { ...a, [field]: value } : a));
        return { ...day, activities };
      });
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
        i === dayIndex ? { ...day, activities: day.activities.filter((_, j) => j !== activityIndex) } : day,
      );
    });
    setSavedNotice(false);
  };

  const addActivity = (dayIndex: number, activity: ItineraryActivity) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      return prev.map((day, i) => (i === dayIndex ? { ...day, activities: [...day.activities, activity] } : day));
    });
    setSavedNotice(false);
  };

  const changeTransport = (dayIndex: number, optionIndex: number) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      return prev.map((day, i) => {
        if (i !== dayIndex || day.type !== 'transition') return day;
        const option = day.transportOptions?.[optionIndex];
        return {
          ...day,
          selectedTransportIndex: optionIndex,
          activities: option
            ? [{ time: 'All day', name: `${option.name} to ${day.toCity}`, price: option.costPerPerson }]
            : day.activities,
        };
      });
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

  const handleDragStart = (index: number) => (e: DragEvent<HTMLSpanElement>) => {
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

  const handleSelectHotel = (tier: HotelTier) => {
    if (!pkg.hotelOptions) return;
    setSelectedHotelTier(tier);
    const option = getHotelOption(pkg.hotelOptions, tier);
    const hotelDiscount = pkg.hotelDiscountPercent / 100;
    const hotel: BookableItem = {
      name: option.name,
      cost: Math.round(option.pricePerNight * nights * rooms * (1 - hotelDiscount)),
      bookingUrl: costBreakdown.hotel.bookingUrl,
    };
    setCostBreakdown((prev) => (prev ? { ...prev, hotel } : prev));
    setSavedNotice(false);
  };

  const handleSelectFlight = (flightId: string) => {
    if (!pkg.flightOptions) return;
    setSelectedFlightId(flightId);
    const option = getFlightOption(pkg.flightOptions, flightId);
    const flight: BookableItem = {
      name: `${option.airline} round-trip to ${primaryCity}`,
      cost: Math.round(option.pricePerPerson * groupSize),
      bookingUrl: option.bookingUrl,
    };
    setCostBreakdown((prev) => (prev ? { ...prev, flight } : prev));
    setSavedNotice(false);
  };

  const buildUpdatedPackage = () => ({
    ...pkg,
    itinerary,
    costBreakdown,
    selectedHotelTier,
    selectedFlightId,
  });

  const handleSave = () => {
    const updatedPkg = buildUpdatedPackage();
    if (currentTrip && currentTrip.package.id === pkg.id) {
      updateCurrentTripPackage(updatedPkg);
    }
    if (savedId) {
      updateSavedTrip(savedId, updatedPkg);
    }
    setSavedNotice(true);
    setTimeout(() => {
      navigate(`/trip/${pkg.id}`);
    }, 1500);
  };

  const handleExportPdf = () => {
    exportItineraryToPdf(buildUpdatedPackage(), preferences);
  };

  const makeHotelCheaper = () => handleSelectHotel('budget');

  const addGenericActivity = () => {
    if (itinerary.length === 0) return;
    addActivity(0, { time: '9:00 AM', name: 'New activity', price: 0 });
  };

  const activitiesTotalPerPerson = itinerary.reduce((sum, day) => sum + dayCostPerPerson(day), 0);
  const grandTotal = activitiesTotalPerPerson * groupSize + costBreakdown.hotel.cost + costBreakdown.flight.cost;

  return (
    <div className="min-h-dvh bg-surface pb-24 text-ink">
      <div className="relative overflow-hidden bg-ocean-deepest pb-10 pt-6 text-white sm:pb-14">
        <GradientBackdrop vibe={pkg.vibe} />
        <img
          src={heroImage}
          alt=""
          aria-hidden
          onError={handleImageError}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,23,42,0.35) 0%, rgba(0,23,42,0.85) 75%, #00172A 100%)',
          }}
        />

        <header
          className="relative flex flex-wrap items-center justify-between gap-3 px-4 sm:px-12"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <Logo />
          <Button
            variant="secondary"
            className="px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
            onClick={() => navigate(`/trip/${pkg.id}`)}
          >
            Back to summary
          </Button>
        </header>

        <div className="relative mx-auto mt-10 max-w-3xl px-4 text-center animate-fade-in sm:mt-16 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-gold-accent sm:text-sm">
            Edit your itinerary
          </p>
          <h1 className="font-display mt-3 text-3xl font-medium sm:text-4xl md:text-5xl">{destinationLabel}</h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div>
              <p className="text-white/50">Duration</p>
              <p className="font-display text-xl">{itinerary.length} days</p>
            </div>
            <div>
              <p className="text-white/50">Estimated total</p>
              <p className="font-display text-xl text-gold-accent">${grandTotal.toLocaleString()}</p>
              <p className="text-xs text-white/50">
                ${Math.round(grandTotal / groupSize).toLocaleString()} / person
              </p>
            </div>
          </div>

          {isMultiCity && (
            <ul className="mt-8 flex flex-wrap justify-center gap-3" aria-label="Cities on this trip">
              {tripCities.map((city) => (
                <li
                  key={city}
                  className="relative h-20 w-28 overflow-hidden rounded-xl ring-1 ring-white/20 sm:h-24 sm:w-36"
                >
                  <img
                    src={getCityImage(city, 'card')}
                    alt={city}
                    loading="lazy"
                    onError={handleImageError}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute inset-x-2 bottom-1.5 truncate text-left text-xs font-semibold text-white">
                    {city}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs text-ink/40">Drag a day by its handle to reorder your trip.</p>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-ink/10 bg-white p-4 text-sm sm:grid-cols-4 sm:p-6">
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

        <div className="mt-8 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <img
                src={hotelThumb}
                alt="Hotel"
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                loading="lazy"
                onError={handleImageError}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{costBreakdown.hotel.name}</p>
                <p className="text-xs text-ink/50">
                  {selectedHotel && <>★{selectedHotel.rating.toFixed(1)} · </>}
                  {selectedHotelTier}
                </p>
                <p className="font-display text-sm text-ocean-mid">
                  ${Math.round(costBreakdown.hotel.cost / groupSize).toLocaleString()}/person
                </p>
              </div>
              {pkg.hotelOptions && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingHotel((v) => !v);
                    setEditingFlight(false);
                  }}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-ocean-mid/30 px-3 py-2 text-xs font-semibold text-ocean-mid hover:bg-ocean-mid/10"
                >
                  Edit hotel
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </div>
            {isMultiCity && <CityStayStrip cities={tripCities} className="mt-4" />}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: editingHotel ? 400 : 0, opacity: editingHotel ? 1 : 0 }}
            >
              {pkg.hotelOptions && (
                <div className="mt-4 border-t border-ink/10 pt-4">
                  <HotelPicker
                    options={pkg.hotelOptions}
                    selectedTier={selectedHotelTier}
                    onSelect={handleSelectHotel}
                  />
                  <button
                    type="button"
                    onClick={() => setEditingHotel(false)}
                    className="mt-3 cursor-pointer rounded-full bg-gold-accent px-4 py-2 text-xs font-semibold text-ink hover:opacity-90"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <img
                src={getTransportImage('flight')}
                alt="Flight"
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                loading="lazy"
                onError={handleImageError}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{costBreakdown.flight.name}</p>
                <p className="text-xs text-ink/50">
                  ${Math.round(costBreakdown.flight.cost / groupSize).toLocaleString()}/person ·{' '}
                  {getFlightOption(pkg.flightOptions ?? [], selectedFlightId).duration}
                </p>
              </div>
              {pkg.flightOptions && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingFlight((v) => !v);
                    setEditingHotel(false);
                  }}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-ocean-mid/30 px-3 py-2 text-xs font-semibold text-ocean-mid hover:bg-ocean-mid/10"
                >
                  Edit flight
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </div>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: editingFlight ? 400 : 0, opacity: editingFlight ? 1 : 0 }}
            >
              {pkg.flightOptions && (
                <div className="mt-4 border-t border-ink/10 pt-4">
                  <FlightPicker
                    options={pkg.flightOptions}
                    selectedId={selectedFlightId}
                    onSelect={handleSelectFlight}
                  />
                  <button
                    type="button"
                    onClick={() => setEditingFlight(false)}
                    className="mt-3 cursor-pointer rounded-full bg-gold-accent px-4 py-2 text-xs font-semibold text-ink hover:opacity-90"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {itinerary.map((day, dayIndex) => (
            <DayCard
              key={day.day}
              day={day}
              packageId={pkg.id}
              destination={primaryCity}
              country={primaryCountry}
              groupSize={groupSize}
              isEditing
              onChangeTransport={(optionIndex) => changeTransport(dayIndex, optionIndex)}
              onChangeActivity={(activityIndex, field, value) =>
                updateActivityField(dayIndex, activityIndex, field, value)
              }
              onChangeActivityPrice={(activityIndex, value) => updateActivityPrice(dayIndex, activityIndex, value)}
              onRemoveActivity={(activityIndex) => removeActivity(dayIndex, activityIndex)}
              onAddActivity={(activity) => addActivity(dayIndex, activity)}
              dragHandleProps={{
                onDragStart: handleDragStart(dayIndex),
                onDragOver: handleDragOver(dayIndex),
                onDrop: handleDrop(dayIndex),
                onDragEnd: handleDragEnd,
                isDragging: draggedIndex === dayIndex,
                isDragOver: dragOverIndex === dayIndex,
              }}
            />
          ))}
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
