import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Logo from '../components/Logo';
import ProfileAvatarLink from '../components/ProfileAvatarLink';
import GradientBackdrop from '../components/GradientBackdrop';
import type { Vibe } from '../types';

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

const howItWorks = [
  {
    step: '1',
    title: 'Tell us your vibe',
    body: 'Answer a handful of quick questions about how you like to travel.',
  },
  {
    step: '2',
    title: 'We match your trip',
    body: 'Our engine pairs a destination, budget, and itinerary to fit you.',
  },
  {
    step: '3',
    title: 'Save & book',
    body: 'Tweak anything you like, then save or book the plan in one click.',
  },
];

const destinations: { title: string; vibe: Vibe }[] = [
  { title: 'Beaches & Vibes', vibe: 'relaxing' },
  { title: 'Adventure & Wild', vibe: 'adventurous' },
  { title: 'Hidden Gems', vibe: 'cultural' },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-5 transition-colors duration-300 sm:px-12 sm:py-6"
      style={{
        paddingTop: 'max(1.25rem, calc(0.75rem + env(safe-area-inset-top)))',
        backgroundColor: scrolled ? 'color-mix(in srgb, var(--color-ocean-deepest) 60%, transparent)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="flex items-center gap-4 sm:gap-6">
        <Logo />
        <Link
          to="/saved"
          className="hidden text-sm font-medium text-white/80 transition-colors hover:text-gold-accent sm:inline-block"
        >
          Saved Trips
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/saved"
          className="text-xs font-medium text-white/80 transition-colors hover:text-gold-accent sm:hidden"
        >
          Saved
        </Link>
        <ProfileAvatarLink />
      </div>
    </header>
  );
}

export default function Landing() {
  return (
    <div className="min-h-dvh w-full bg-ocean-deepest text-white">
      <Navbar />

      <div
        className="relative flex min-h-dvh w-full flex-col justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,23,42,0.55) 0%, rgba(0,23,42,0.75) 55%, #00172A 100%), url(${HERO_IMAGE})`,
        }}
      >
        <main
          className="flex flex-1 flex-col items-center justify-center px-4 text-center animate-fade-in sm:px-6"
          style={{ paddingTop: 'max(5rem, calc(4.5rem + env(safe-area-inset-top)))' }}
        >
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
      </div>

      <section className="px-4 py-10 sm:px-12 sm:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-2xl font-medium sm:text-3xl">How It Works</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="animate-slide-up text-left">
                <span className="font-display text-4xl font-semibold text-gold-accent">
                  {item.step}
                </span>
                <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-white/70">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 sm:px-12 sm:pb-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-center text-2xl font-medium sm:text-3xl">
            Pick a starting point
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {destinations.map((d) => (
              <Link
                key={d.title}
                to="/questionnaire"
                state={{ presetVibe: d.vibe }}
                className="group relative block h-48 cursor-pointer overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:scale-105 hover:border-gold-accent hover:shadow-[0_0_24px_0_var(--color-gold-accent)]"
              >
                <GradientBackdrop vibe={d.vibe} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="relative flex h-full items-end p-4">
                  <span className="font-display text-lg font-semibold text-white">
                    {d.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="px-4 pt-2 sm:px-12"
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
  );
}
