import { Link } from 'react-router-dom';
import Button from '../components/Button';
import ChatFab from '../components/ChatFab';
import GradientBackdrop from '../components/GradientBackdrop';
import Logo from '../components/Logo';
import { useSavedTrips } from '../context/SavedTripsContext';

export default function Saved() {
  const { savedTrips, removeSavedTrip } = useSavedTrips();

  return (
    <div className="min-h-screen bg-ocean-deepest text-white">
      <header className="flex items-center justify-between px-6 py-6 sm:px-12">
        <Logo />
        <Link to="/questionnaire">
          <Button variant="secondary">Plan another trip</Button>
        </Link>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-12">
        <h1 className="font-display text-3xl">Saved trips</h1>
        <p className="mt-2 text-white/60">Revisit or keep editing any trip you've saved.</p>

        {savedTrips.length === 0 ? (
          <div className="glass-panel mt-10 rounded-3xl p-10 text-center">
            <p className="text-white/80">No saved trips yet.</p>
            <Link to="/questionnaire" className="mt-4 inline-block">
              <Button variant="primary">Start planning</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {savedTrips.map((trip) => (
              <div
                key={trip.savedId}
                className="glass-panel overflow-hidden rounded-3xl"
              >
                <div className="relative h-36 overflow-hidden">
                  <GradientBackdrop vibe={trip.package.vibe} />
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{ backgroundImage: `url(${trip.package.coverImageUrl})` }}
                  />
                </div>
                <div className="p-5">
                  <h2 className="font-display text-xl">{trip.package.destination}</h2>
                  <p className="mt-1 text-sm text-white/60">
                    {trip.package.itinerary.length} days · ${trip.package.estimatedCost.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Saved {new Date(trip.savedAt).toLocaleDateString()}
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
            ))}
          </div>
        )}
      </div>

      <ChatFab />
    </div>
  );
}
