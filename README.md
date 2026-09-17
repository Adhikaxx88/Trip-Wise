# TripWise

**Your Journey in One Click.**

TripWise is a travel-planning web app. Answer a short set of preference
questions (vibe, duration, budget, group size) and get back a personalized,
complete trip package — a destination summary plus a day-by-day itinerary —
that you can edit and save.

## Flow

- **Landing** → **Questionnaire** (Typeform-style, one question per screen) → **Summary/Itinerary** → **Edit** or **Save**
- **Landing** → **Chatbot** (same underlying questions, conversational) → same **Summary/Itinerary**

Booking is a redirect to an external provider — there is no payment flow.

## Tech

- React + TypeScript + Vite
- React Router for client-side routing
- Tailwind CSS (v4, CSS-first theme in `src/index.css`)
- React Context + `localStorage` for state (no backend)
- A local TypeScript matching function (`src/logic/matchTrip.ts`) over a
  hardcoded destination dataset (`src/data/destinations.ts`) stands in for a
  real recommendation API

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – typecheck and build for production
- `npm run lint` – run oxlint
- `npm run preview` – preview the production build

## Project structure

```
src/
  components/   shared UI (Button, GlassCard, StepIndicator, ChatBubble, ItineraryDayCard...)
  pages/        Landing, Questionnaire, Chatbot, Summary, Edit, Saved
  data/         mock destinations dataset + shared question options
  logic/        recommendation matching function
  types/        TypeScript interfaces
  context/      TripPreferencesContext, CurrentTripContext, SavedTripsContext
```
