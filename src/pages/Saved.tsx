import { Link } from 'react-router-dom';
import Button from '../components/Button';
import ChatFab from '../components/ChatFab';
import GradientBackdrop from '../components/GradientBackdrop';
import Logo from '../components/Logo';
import ProfileAvatarLink from '../components/ProfileAvatarLink';
import { useSavedTrips } from '../context/SavedTripsContext';

export default function Saved() {
  const { savedTrips, removeSavedTrip } = useSavedTrips();

  return (
    <div className="min-h-dvh bg-ocean-deepest text-white">
      <header
        className="flex items-center justify-between px-4 py-5 sm:px-12 sm:py-6"
        style={{ paddingTop: 'max(1.25rem, calc(0.75rem + env(safe-area-inset-top)))' }}
      >
        <Logo />
        <div className="flex items-center gap-4">
          <ProfileAvatarLink />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-12 sm:py-12">
        <h1 className="font-display text-2xl sm:text-3xl">Saved trips</h1>
        <p className="mt-2 text-sm text-white/60 sm:text-base">
          Revisit or keep editing any trip you've saved.
        </p>

        {savedTrips.length === 0 ? (
          <div className="glass-panel mt-10 rounded-3xl p-8 text-center sm:p-10">
            <p className="text-white/80">No saved trips yet.</p>
            <Link to="/questionnaire" className="mt-4 inline-block">
              <Button variant="primary">Start planning</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedTrips.map((trip) => {
              const heroImage =
                trip.package.coverImageUrl || 'https://picsum.photos/seed/travel-default/800/500';
              const title = trip.package.destination || 'My Trip';
              const dayCount = trip.package.itinerary?.length ?? 0;
              const durationLabel = dayCount > 0 ? `${dayCount} days` : 'Dates TBD';
              const costLabel =
                typeof trip.package.estimatedCost === 'number'
                  ? `$${trip.package.estimatedCost.toLocaleString()}`
                  : null;
              const savedAtLabel = (() => {
                const date = new Date(trip.savedAt);
                return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
              })();

              return (
                <div key={trip.savedId} className="glass-panel overflow-hidden rounded-3xl">
                  <div className="relative h-36 overflow-hidden">
                    <GradientBackdrop vibe={trip.package.vibe ?? 'relaxing'} />
                    <img
                      src={heroImage}
                      alt={title}
                      className="absolute inset-0 h-full w-full object-cover opacity-60"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://picsum.photos/seed/travel-default/800/500';
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <h2 className="font-display text-xl">{title}</h2>
                    <p className="mt-1 text-sm text-white/60">
                      {durationLabel}
                      {costLabel ? ` · ${costLabel}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {savedAtLabel ? `Saved ${savedAtLabel}` : 'Saved recently'}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Link to={`/trip/${trip.savedId}`}>
                        <Button variant="primary" className="px-4 py-2 text-sm">
                          View trip
                        </Button>
                      </Link>
                      <Link to={`/trip/${trip.savedId}/edit`}>
                        <Button variant="secondary" className="px-4 py-2 text-sm">
                          Edit
                        </Button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeSavedTrip(trip.savedId)}
                        className="px-2 py-2 text-sm text-white/50 hover:text-red-300 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <Link
              to="/questionnaire"
              className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-white/25 text-white/60 transition-colors hover:border-gold-accent/60 hover:text-white"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl leading-none">
                +
              </span>
              <span className="text-sm font-medium">New Trip</span>
            </Link>
          </div>
        )}
      </div>

      <ChatFab />
    </div>
  );
}
