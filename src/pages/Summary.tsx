import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Hotel, MapPin, Pencil, Plane } from 'lucide-react';
import Button from '../components/Button';
import ChatFab from '../components/ChatFab';
import CityStayStrip from '../components/CityStayStrip';
import DayCard from '../components/DayCard';
import FlightPicker from '../components/FlightPicker';
import GradientBackdrop from '../components/GradientBackdrop';
import HotelPicker from '../components/HotelPicker';
import Logo from '../components/Logo';
import ProfileAvatarLink from '../components/ProfileAvatarLink';
import Toast from '../components/Toast';
import {
  getCityImage,
  getHotelImage,
  getTransportImage,
  handleImageError,
  isFallbackImage,
  trustedImage,
} from '../data/getImage';
import { getFlightOption, getHotelOption } from '../data/hotelFlightOptions';
import { useCurrentTrip } from '../context/CurrentTripContext';
import { useSavedTrips } from '../context/SavedTripsContext';
import { formatDateRange } from '../logic/dates';
import { airportMapsLink, hotelAreaMapsLink } from '../logic/tripMedia';
import { useResolvedTrip } from '../logic/useResolvedTrip';
import type { BookableItem, HotelTier, TripPackage } from '../types';

export default function Summary() {
  const { id } = useParams<{ id: string }>();
  const resolved = useResolvedTrip(id);
  const { saveTrip, isSaved, updateSavedTrip } = useSavedTrips();
  const { currentTrip, updateCurrentTripPackage } = useCurrentTrip();
  const [justSaved, setJustSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [editingHotel, setEditingHotel] = useState(false);
  const [editingFlight, setEditingFlight] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showToast]);

  if (!resolved) {
    return <Navigate to="/questionnaire" replace />;
  }

  const { package: pkg, preferences, savedId } = resolved;
  const alreadySaved = isSaved(pkg.id) || justSaved;

  const persistPackage = (updatedPkg: TripPackage) => {
    if (currentTrip && currentTrip.package.id === pkg.id) {
      updateCurrentTripPackage(updatedPkg);
    }
    if (savedId) {
      updateSavedTrip(savedId, updatedPkg);
    }
  };

  const handleSave = () => {
    saveTrip(pkg, preferences);
    setJustSaved(true);
    setShowToast(true);
  };

  const handleChangeTransport = (dayIndex: number, optionIndex: number) => {
    persistPackage({
      ...pkg,
      itinerary: pkg.itinerary.map((day, i) => {
        if (i !== dayIndex || day.type !== 'transition') return day;
        const option = day.transportOptions?.[optionIndex];
        return {
          ...day,
          selectedTransportIndex: optionIndex,
          activities: option
            ? [{ time: 'All day', name: `${option.name} to ${day.toCity}`, price: option.costPerPerson }]
            : day.activities,
        };
      }),
    });
  };

  const nights = Math.max(1, pkg.itinerary.length - 1);
  const rooms = Math.max(1, Math.ceil(groupSizeOf(preferences) / 2));

  const handleSelectHotel = (tier: HotelTier) => {
    if (!pkg.hotelOptions) return;
    const option = getHotelOption(pkg.hotelOptions, tier);
    const hotelDiscount = pkg.hotelDiscountPercent / 100;
    const hotel: BookableItem = {
      name: option.name,
      cost: Math.round(option.pricePerNight * nights * rooms * (1 - hotelDiscount)),
      bookingUrl: pkg.costBreakdown.hotel.bookingUrl,
    };
    persistPackage({
      ...pkg,
      selectedHotelTier: tier,
      costBreakdown: { ...pkg.costBreakdown, hotel },
      estimatedCost: pkg.estimatedCost - pkg.costBreakdown.hotel.cost + hotel.cost,
    });
  };

  const handleSelectFlight = (flightId: string) => {
    if (!pkg.flightOptions) return;
    const option = getFlightOption(pkg.flightOptions, flightId);
    const groupSize = groupSizeOf(preferences);
    const flight: BookableItem = {
      name: `${option.airline} round-trip to ${pkg.cities?.[0] ?? pkg.destination}`,
      cost: Math.round(option.pricePerPerson * groupSize),
      bookingUrl: option.bookingUrl,
    };
    persistPackage({
      ...pkg,
      selectedFlightId: flightId,
      costBreakdown: { ...pkg.costBreakdown, flight },
      estimatedCost: pkg.estimatedCost - pkg.costBreakdown.flight.cost + flight.cost,
    });
  };

  const dateRangeLabel = formatDateRange(preferences.startDate, preferences.endDate);
  const groupSize = groupSizeOf(preferences);

  const costRows: { label: string; icon: 'hotel' | 'flight'; item: BookableItem }[] = [
    { label: 'Hotel', icon: 'hotel', item: pkg.costBreakdown.hotel },
    { label: 'Flights', icon: 'flight', item: pkg.costBreakdown.flight },
  ];
  const primaryCity = pkg.cities?.[0] ?? pkg.destination.split(',')[0].trim();
  const primaryCountry = pkg.cities?.[0] ? preferences.selectedCities?.[0]?.country : undefined;
  const tripCities = pkg.cities ?? [];
  const isMultiCity = tripCities.length > 1;
  const selectedHotelTier = pkg.selectedHotelTier ?? 'standard';
  const coverImage = trustedImage(pkg.coverImageUrl);
  const hotelThumb = pkg.hotelOptions?.length
    ? getHotelImage(getHotelOption(pkg.hotelOptions, selectedHotelTier).tier)
    : pkg.cities?.[0]
      ? getCityImage(pkg.cities[0], 'hotel')
      : getHotelImage(selectedHotelTier);

  return (
    <div className="min-h-dvh bg-ocean-deepest text-white">
      <div className="relative overflow-hidden pb-16 pt-6">
        <GradientBackdrop vibe={pkg.vibe} />
        {/* GradientBackdrop above stays visible if the cover is missing or fails to load. */}
        {!isFallbackImage(coverImage) && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${coverImage})` }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,23,42,0.35) 0%, rgba(0,23,42,0.85) 75%, #00172A 100%)',
          }}
        />

        <header
          className="relative flex items-center justify-between px-4 sm:px-12"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <Logo />
          <div className="flex items-center gap-4">
            <Link to="/saved" className="text-xs font-medium text-white/80 hover:text-white sm:text-sm">
              Saved trips
            </Link>
            <ProfileAvatarLink />
          </div>
        </header>

        <div className="relative mx-auto mt-16 max-w-3xl px-4 text-center animate-fade-in sm:mt-24 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-wide text-gold-accent sm:text-sm">
            Your matched trip
          </p>
          <h1 className="font-display mt-3 text-3xl font-medium sm:text-4xl md:text-5xl">
            {pkg.destination}
          </h1>
          <p className="mt-5 text-sm text-white/85 sm:text-base">{pkg.summary}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {pkg.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
            {dateRangeLabel && (
              <div>
                <p className="text-white/50">Dates</p>
                <p className="font-display text-xl">{dateRangeLabel}</p>
              </div>
            )}
            <div>
              <p className="text-white/50">Estimated cost</p>
              <p className="font-display text-xl text-gold-accent">
                ${pkg.estimatedCost.toLocaleString()}
              </p>
              <p className="text-xs text-white/50">
                ${Math.round(pkg.estimatedCost / groupSize).toLocaleString()} / person
              </p>
            </div>
            <div>
              <p className="text-white/50">Duration</p>
              <p className="font-display text-xl">{pkg.itinerary.length} days</p>
            </div>
            <div>
              <p className="text-white/50">Group size</p>
              <p className="font-display text-xl">{preferences.groupSize ?? 1}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to={`/trip/${pkg.id}/edit`}>
              <Button variant="secondary">Edit itinerary</Button>
            </Link>
            <Button variant="primary" onClick={handleSave} disabled={alreadySaved}>
              {alreadySaved ? 'Saved ✓' : 'Save this trip'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-surface px-4 py-12 text-ink sm:px-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-xl text-ink sm:text-2xl">Cost breakdown</h2>
          <div className="mt-6 space-y-3">
            {costRows.map((row) => (
              <div key={row.label} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={row.icon === 'hotel' ? hotelThumb : getTransportImage('flight')}
                      alt={row.icon === 'hotel' ? 'Hotel' : 'Flight'}
                      loading="lazy"
                      onError={handleImageError}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16"
                    />
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                        {row.icon === 'hotel' ? (
                          <Hotel className="h-4 w-4 text-ocean-mid" aria-hidden />
                        ) : (
                          <Plane className="h-4 w-4 text-ocean-mid" aria-hidden />
                        )}
                        {row.label}
                      </p>
                      <p className="truncate text-xs text-ink/60">{row.item.name}</p>
                      <a
                        href={
                          row.icon === 'hotel'
                            ? hotelAreaMapsLink(row.item.name, primaryCity)
                            : airportMapsLink(primaryCity)
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-ocean-mid hover:text-ocean-deep"
                      >
                        <MapPin className="h-3 w-3" aria-hidden />
                        {row.icon === 'hotel' ? 'View area on Maps' : 'Airport'}
                      </a>
                      {row.icon === 'hotel' && pkg.hotelDiscountPercent > 0 && (
                        <span className="mt-1 block w-fit rounded-full border border-[rgba(255,210,51,0.3)] bg-[rgba(255,210,51,0.15)] px-2 py-0.5 text-[11px] font-medium text-[#B8860B]">
                          Member discount applied · {pkg.hotelDiscountPercent}% off
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="font-display text-lg text-ocean-mid">${row.item.cost.toLocaleString()}</p>
                      <p className="text-xs text-ink/50">
                        ${Math.round(row.item.cost / groupSize).toLocaleString()} / person
                      </p>
                    </div>
                    {row.icon === 'hotel' && pkg.hotelOptions ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingHotel((v) => !v);
                          setEditingFlight(false);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ocean-mid/30 px-3 py-2 text-xs font-semibold text-ocean-mid hover:bg-ocean-mid/10"
                      >
                        Edit hotel
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    ) : row.icon === 'flight' && pkg.flightOptions ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFlight((v) => !v);
                          setEditingHotel(false);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ocean-mid/30 px-3 py-2 text-xs font-semibold text-ocean-mid hover:bg-ocean-mid/10"
                      >
                        Edit flight
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    ) : (
                      <a href={row.item.bookingUrl} target="_blank" rel="noreferrer">
                        <Button variant="accent" className="px-4 py-2 text-sm">
                          Book ↗
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {row.icon === 'hotel' && isMultiCity && <CityStayStrip cities={tripCities} className="mt-4" />}

                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight:
                      (row.icon === 'hotel' && editingHotel) || (row.icon === 'flight' && editingFlight)
                        ? 400
                        : 0,
                    opacity:
                      (row.icon === 'hotel' && editingHotel) || (row.icon === 'flight' && editingFlight)
                        ? 1
                        : 0,
                  }}
                >
                  {row.icon === 'hotel' && pkg.hotelOptions && (
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
                  {row.icon === 'flight' && pkg.flightOptions && (
                    <div className="mt-4 border-t border-ink/10 pt-4">
                      <FlightPicker
                        options={pkg.flightOptions}
                        selectedId={pkg.selectedFlightId ?? pkg.flightOptions[0].id}
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
            ))}
          </div>

          <h2 className="font-display mt-10 text-xl text-ink sm:text-2xl">Day-by-day itinerary</h2>
          <p className="mt-1 text-sm text-ink/50">
            Meals, tickets, and transport are priced right where they happen.
          </p>
          <div className="mt-6 space-y-4">
            {pkg.itinerary.map((day, dayIndex) => (
              <DayCard
                key={day.day}
                day={day}
                packageId={pkg.id}
                destination={primaryCity}
                country={primaryCountry}
                groupSize={groupSize}
                isEditing={false}
                onChangeTransport={(optionIndex) => handleChangeTransport(dayIndex, optionIndex)}
              />
            ))}
          </div>
        </div>
      </div>

      <ChatFab />
      <Toast message="Saved. Find it anytime on your Saved trips page." show={showToast} />
    </div>
  );
}

function groupSizeOf(preferences: { groupSize: number | null }): number {
  return preferences.groupSize ?? 1;
}
