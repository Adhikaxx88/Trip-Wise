import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import ChatFab from '../components/ChatFab';
import CostIcon from '../components/CostIcon';
import GradientBackdrop from '../components/GradientBackdrop';
import ItineraryDayCard from '../components/ItineraryDayCard';
import Logo from '../components/Logo';
import { useSavedTrips } from '../context/SavedTripsContext';
import { formatDateRange } from '../logic/dates';
import { useResolvedTrip } from '../logic/useResolvedTrip';
import type { BookableItem } from '../types';

export default function Summary() {
  const { id } = useParams<{ id: string }>();
  const resolved = useResolvedTrip(id);
  const { saveTrip, isSaved } = useSavedTrips();
  const [justSaved, setJustSaved] = useState(false);

  if (!resolved) {
    return <Navigate to="/questionnaire" replace />;
  }

  const { package: pkg, preferences } = resolved;
  const alreadySaved = isSaved(pkg.id) || justSaved;

  const handleSave = () => {
    saveTrip(pkg, preferences);
    setJustSaved(true);
  };

  const dateRangeLabel = formatDateRange(preferences.startDate, preferences.endDate);
  const groupSize = preferences.groupSize ?? 1;

  const costRows: { label: string; icon: 'hotel' | 'flight' | 'food' | 'ticket'; item: BookableItem }[] = [
    { label: 'Hotel', icon: 'hotel', item: pkg.costBreakdown.hotel },
    { label: 'Flights', icon: 'flight', item: pkg.costBreakdown.flight },
    { label: 'Food', icon: 'food', item: pkg.costBreakdown.food },
    { label: 'Attractions', icon: 'ticket', item: pkg.costBreakdown.attractions },
  ];

  return (
    <div className="min-h-dvh bg-ocean-deepest text-white">
      <div className="relative overflow-hidden pb-16 pt-6">
        <GradientBackdrop vibe={pkg.vibe} />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${pkg.coverImageUrl})` }}
        />
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
          <Link to="/saved" className="text-xs font-medium text-white/80 hover:text-white sm:text-sm">
            Saved trips
          </Link>
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
          {justSaved && (
            <p className="mt-4 text-sm text-gold-accent animate-fade-in">
              Saved. Find it anytime on your Saved trips page.
            </p>
          )}
        </div>
      </div>

      <div className="bg-surface px-4 py-12 text-ink sm:px-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-xl text-ink sm:text-2xl">Cost breakdown</h2>
          <div className="mt-6 space-y-3">
            {costRows.map((row) => (
              <div
                key={row.label}
                className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean-mid/10 text-ocean-mid">
                      <CostIcon type={row.icon} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{row.label}</p>
                      <p className="truncate text-xs text-ink/60">{row.item.name}</p>
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="font-display text-lg text-ocean-mid">
                        ${row.item.cost.toLocaleString()}
                      </p>
                      <p className="text-xs text-ink/50">
                        ${Math.round(row.item.cost / groupSize).toLocaleString()} / person
                      </p>
                    </div>
                    <a href={row.item.bookingUrl} target="_blank" rel="noreferrer">
                      <Button variant="accent" className="px-4 py-2 text-sm">
                        Book ↗
                      </Button>
                    </a>
                  </div>
                </div>

                {row.item.details && row.item.details.length > 0 && (
                  <ul className="mt-3 grid grid-cols-1 gap-1.5 border-t border-ink/10 pt-3 sm:grid-cols-2">
                    {row.item.details.map((detail) => (
                      <li key={detail.label} className="flex justify-between gap-2 text-xs text-ink/70">
                        <span className="font-medium text-ink/50">{detail.label}</span>
                        <span className="truncate text-right">{detail.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <h2 className="font-display mt-10 text-xl text-ink sm:text-2xl">Day-by-day itinerary</h2>
          <div className="mt-6 space-y-4">
            {pkg.itinerary.map((day) => (
              <ItineraryDayCard key={day.day} day={day} />
            ))}
          </div>
        </div>
      </div>

      <ChatFab />
    </div>
  );
}
