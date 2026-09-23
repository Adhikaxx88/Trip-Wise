import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Logo from '../components/Logo';
import ProfileAvatarLink from '../components/ProfileAvatarLink';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80';

const differentiators = [
  {
    old: 'You search manually',
    fresh: 'We recommend a complete package',
  },
  {
    old: 'Generic recommendations',
    fresh: 'Personalized to your vibe & budget',
  },
  {
    old: 'Manual trip planning',
    fresh: 'Auto-generated, editable itinerary',
  },
];

export default function Landing() {
  return (
    <div className="min-h-dvh w-full bg-ocean-deepest text-white">
      <div
        className="relative flex min-h-dvh w-full flex-col justify-between bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,23,42,0.55) 0%, rgba(0,23,42,0.75) 55%, #00172A 100%), url(${HERO_IMAGE})`,
        }}
      >
        <header
          className="flex items-center justify-between px-4 py-5 sm:px-12 sm:py-6"
          style={{ paddingTop: 'max(1.25rem, calc(0.75rem + env(safe-area-inset-top)))' }}
        >
          <Logo />
          <ProfileAvatarLink />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-4 text-center animate-fade-in sm:px-6">
          <p className="mb-4 text-xs font-medium tracking-wide text-white/70 sm:text-sm">
            Your Journey in One Click
          </p>
          <h1 className="font-display max-w-3xl text-3xl font-medium leading-tight sm:text-5xl md:text-6xl">
            A complete trip, planned for you before you finish your coffee.
          </h1>
          <p className="mt-6 max-w-xl text-sm text-white/80 sm:text-base md:text-lg">
            Answer a few quick questions and TripWise hands you a full destination,
            budget, and day-by-day itinerary, ready to tweak, save, and book.
          </p>

          <div className="mt-10 flex w-full max-w-xs flex-col items-center gap-4 sm:max-w-none sm:flex-row sm:justify-center">
            <Link to="/questionnaire" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full px-8 py-4 text-base sm:w-auto">
                Plan my trip
              </Button>
            </Link>
            <Link to="/chatbot" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full px-8 py-4 text-base sm:w-auto">
                Talk it through instead
              </Button>
            </Link>
          </div>
        </main>

        <section
          className="px-4 pt-10 sm:px-12 sm:pb-16"
          style={{ paddingBottom: 'max(3rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}
        >
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {differentiators.map((d) => (
              <div
                key={d.old}
                className="glass-panel animate-slide-up rounded-2xl p-5 text-left"
              >
                <p className="text-xs text-white/50 line-through">{d.old}</p>
                <p className="mt-1 text-sm font-semibold text-gold-accent">{d.fresh}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
