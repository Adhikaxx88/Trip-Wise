import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import ChatFab from '../components/ChatFab';
import Logo from '../components/Logo';
import ProfileAvatarLink from '../components/ProfileAvatarLink';
import Reveal from '../components/Reveal';
import { StaggerGroup, StaggerItem } from '../components/Stagger';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80';

const differentiators = [
  {
    label: 'Beaches & Vibes',
    image:
      'https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=900&q=80',
    old: 'You search manually',
    fresh: 'We plan it all, you just pack your bags',
  },
  {
    label: 'Adventure & Wild',
    image:
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=900&q=80',
    old: 'Generic recommendations',
    fresh: 'Tailored to your vibe, not your stress',
  },
  {
    label: 'Hidden Gems',
    image:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    old: 'Manual trip planning',
    fresh: 'Smart plan in seconds, yours to tweak',
  },
];

const steps = [
  {
    number: '1',
    title: 'Tell us your vibe',
    description:
      'Answer a few quick questions about your mood, budget, and travel style. It takes less than a minute.',
    image:
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
  },
  {
    number: '2',
    title: 'We build your itinerary',
    description:
      'TripWise assembles a full destination, budget, and day-by-day plan while you finish your coffee.',
    image:
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
  },
  {
    number: '3',
    title: 'You just show up',
    description:
      'Save it, tweak anything you like. Everything else is already sorted for you.',
    image:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
  },
];

const testimonials = [
  {
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
    name: 'Sarah M.',
    trip: 'Bali, Indonesia',
    quote:
      'I had my full itinerary ready before I even packed my bag. Three days in Bali, perfectly sorted by budget and vibe. Honestly magical.',
  },
  {
    photo:
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=200&h=200&q=80',
    name: 'Rizky & Dinda',
    trip: 'Lombok, Indonesia',
    quote:
      'We used to fight over where to eat and what to do on trips. TripWise just handled everything. Best honeymoon ever.',
  },
  {
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    name: 'Kevin T.',
    trip: 'Raja Ampat, Indonesia',
    quote:
      'Typed in my budget and vibe, got a full plan in under a minute. The snorkeling spots it picked were insane. 10 out of 10.',
  },
];

function Star() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
    </svg>
  );
}

const SNAP_SECTION_IDS = ['hero', 'how-it-works', 'testimonials'];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const sections = document.querySelectorAll<HTMLElement>('.snap-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && el.id) {
            setActiveSection(el.id);
          }
        });
      },
      { threshold: [0.3, 0.6, 1.0], rootMargin: '0px' },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-dvh w-full text-white">
      {/* Single fixed background image, locked in place for the entire page */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        aria-hidden="true"
      />
      {/* Single fixed dark overlay, same layer, shared by every section */}
      <div
        className="fixed inset-0 -z-10 bg-[rgba(8,20,40,0.55)]"
        aria-hidden="true"
      />

      <div
        id="hero"
        className="snap-section relative flex min-h-dvh w-full flex-col justify-between"
      >
        <header
          className={`sticky top-0 z-50 flex items-center justify-between px-4 py-5 transition-colors duration-300 sm:px-12 sm:py-6 ${
            scrolled ? 'bg-white/85 shadow-sm backdrop-blur-md' : 'bg-transparent'
          }`}
          style={{ paddingTop: 'max(1.25rem, calc(0.75rem + env(safe-area-inset-top)))' }}
        >
          <Logo />
          <ProfileAvatarLink />
        </header>

        <main className="flex flex-1 flex-col items-center justify-end px-4 pb-6 text-center sm:px-6 sm:pb-10">
          <Reveal variant="up">
            <p className="mb-4 text-sm tracking-wide text-white/80 sm:text-base">
              <span className="font-serif-accent italic">Your Journey</span>{' '}
              <span className="font-sans font-bold not-italic">in One Click.</span>
            </p>
          </Reveal>
          <Reveal variant="up" delay={150}>
            <h1 className="font-display max-w-3xl text-3xl font-medium leading-tight sm:text-5xl md:text-6xl">
              A complete trip, planned for you before you finish your coffee.
            </h1>
          </Reveal>
          <Reveal variant="up" delay={400}>
            <p
              className="mt-6 max-w-xl text-sm text-white/80 sm:text-base md:text-lg"
              style={{ lineHeight: 1.6 }}
            >
              Answer a few quick questions and TripWise hands you a full destination,
              budget, and day-by-day itinerary, ready to tweak, save, and book.
            </p>
          </Reveal>

          <Reveal variant="scale" delay={600}>
            <div className="mt-10 flex w-full max-w-xs flex-col items-center gap-4 sm:max-w-none sm:flex-row sm:justify-center">
              <Link to="/questionnaire" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  className="w-full px-8 py-4 text-base transition-[transform,box-shadow] duration-300 hover:scale-[1.03] hover:shadow-[0_0_0_8px_rgba(255,217,97,0.25)] sm:w-auto"
                >
                  Plan my trip
                </Button>
              </Link>
              <Link to="/chatbot" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full px-8 py-4 text-base transition-colors duration-300 hover:border-gold-accent hover:text-gold-accent-deep sm:w-auto"
                >
                  Talk it through instead
                </Button>
              </Link>
            </div>
          </Reveal>
        </main>

        <section
          className="relative z-20 px-4 pt-10 sm:px-12 sm:pb-16"
          style={{ paddingBottom: 'max(320px, calc(2.5rem + env(safe-area-inset-bottom)))' }}
        >
          <StaggerGroup className="relative z-20 mx-auto mb-[60px] grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {differentiators.map((d) => (
              <StaggerItem key={d.label}>
                <div className="group relative isolate min-h-[320px] overflow-hidden rounded-2xl sm:min-h-[380px]">
                  <img
                    src={d.image}
                    alt={d.label}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-deepest via-ocean-deepest/50 to-ocean-deepest/10" />
                  <div className="relative flex h-full flex-col justify-between p-5 text-left">
                    <span className="w-fit rounded-full bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-1">
                      {d.label}
                    </span>
                    <div>
                      <p className="text-xs text-white/60 line-through">{d.old}</p>
                      <p className="mt-1 text-sm font-bold text-white">{d.fresh}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      </div>

      <section
        id="how-it-works"
        className="snap-section px-4 pb-20 pt-20 text-white sm:px-12"
      >
        <div className="relative z-10 mx-auto max-w-5xl">
          <Reveal variant="down">
            <h2 className="text-center font-serif-accent text-3xl font-bold not-italic text-white sm:text-4xl">
              How It Works
            </h2>
          </Reveal>

          <div className="mt-14 flex flex-col gap-20">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-14"
              >
                <Reveal
                  variant={i % 2 === 1 ? 'right' : 'left'}
                  className={`text-center sm:text-left ${i % 2 === 1 ? 'sm:order-2' : ''}`}
                >
                  <div className="flex flex-col items-center gap-2 sm:items-start">
                    <span className="font-serif-accent text-[#FFD233] text-5xl font-bold sm:text-6xl">
                      {step.number}
                    </span>
                    <h3
                      className="font-serif-accent font-semibold text-white"
                      style={{ fontSize: '24px' }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="max-w-md text-white/[0.75]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
                    >
                      {step.description}
                    </p>
                  </div>
                </Reveal>
                <Reveal
                  variant={i % 2 === 1 ? 'left' : 'right'}
                  className={`flex justify-center ${i % 2 === 1 ? 'sm:order-1' : ''}`}
                >
                  <div className="w-full max-w-sm rotate-[-2deg] rounded-lg border border-white/[0.15] bg-white/[0.08] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-[10px] transition-transform duration-300 hover:rotate-0">
                    <img
                      src={step.image}
                      alt={step.title}
                      loading="lazy"
                      style={{ height: '300px' }}
                      className="w-full rounded-[12px] object-cover"
                    />
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="testimonials"
        className="snap-section px-4 pb-20 pt-20 text-white sm:px-12"
      >
        <div className="relative z-10 mx-auto max-w-5xl">
          <Reveal variant="up">
            <h2 className="text-center font-serif-accent text-3xl font-bold text-white sm:text-4xl">
              What Travelers Say
            </h2>
            <p
              className="mt-3 text-center text-base text-white/[0.55]"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
            >
              Real people, real trips, zero stress.
            </p>
          </Reveal>

          <StaggerGroup className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <StaggerItem key={t.name}>
                <div className="flex h-full flex-col items-center rounded-2xl border border-white/[0.12] bg-white/[0.07] p-6 text-center shadow-[0_4px_24px_rgba(0,0,0,0.3)] backdrop-blur-[10px] transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
                  <img
                    src={t.photo}
                    alt={t.name}
                    loading="lazy"
                    className="h-16 w-16 rounded-full border-2 border-[#FFD233] object-cover"
                  />
                  <div className="mt-3 flex gap-0.5 text-[#FFD233]" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} />
                    ))}
                  </div>
                  <p
                    className="mt-4 font-serif-accent text-sm italic text-white/[0.85]"
                    style={{ lineHeight: 1.6 }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-auto pt-4">
                    <p
                      className="text-sm font-bold text-white"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {t.name}
                    </p>
                    <p
                      className="text-xs text-white/[0.45]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
                    >
                      {t.trip}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <nav className="scroll-dots" aria-label="Page sections">
        {SNAP_SECTION_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={`dot ${activeSection === id ? 'active' : ''}`}
            aria-label={`Go to ${id.replace(/-/g, ' ')} section`}
            aria-current={activeSection === id ? 'true' : undefined}
            onClick={() =>
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
            }
          />
        ))}
      </nav>

      <ChatFab />
    </div>
  );
}
