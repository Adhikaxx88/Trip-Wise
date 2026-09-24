import { useState } from 'react';
import Button from './Button';
import { activityImageUrl, placeMapsLink } from '../logic/tripMedia';
import { routeMapsLink } from '../data/transport';
import type { ItineraryDay, TransportOption } from '../types';

interface ItineraryDayCardProps {
  day: ItineraryDay;
  groupSize?: number;
  onChangeTransport?: (optionIndex: number) => void;
}

const TRANSPORT_ICON: Record<string, string> = {
  train: '🚆',
  bus: '🚌',
  flight: '✈️',
  ferry: '⛴️',
  car: '🚗',
  other: '🚕',
};

const GENERIC_FALLBACK_IMAGE = 'https://source.unsplash.com/800x500/?travel+destination+beautiful';

export default function ItineraryDayCard({ day, groupSize = 1, onChangeTransport }: ItineraryDayCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const dayTotalPerPerson = day.activities.reduce((sum, a) => sum + (a.price ?? 0), 0);
  const dayTotal = dayTotalPerPerson * groupSize;

  if (day.type === 'transition') {
    const options = day.transportOptions ?? [];
    const selectedIndex = day.selectedTransportIndex ?? 0;
    const selected: TransportOption | undefined = options[selectedIndex];
    const bookingUrl = selected?.bookingUrl ?? 'https://www.traveloka.com';

    return (
      <div className="rounded-2xl border-2 border-dashed border-gold-accent/60 bg-gold-accent/5 p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xl text-gold-accent-deep sm:text-2xl">
              {String(day.day).padStart(2, '0')}
            </span>
            <h3 className="text-base font-semibold text-ink sm:text-lg">
              🧳 {day.fromCity} → {day.toCity}
            </h3>
          </div>
          {selected && (
            <div className="text-right text-xs text-ink/50">
              <p className="font-display text-sm text-gold-accent-deep sm:text-base">
                {selected.costLabel ?? `$${selected.costPerPerson}`}
              </p>
              <p>per person</p>
            </div>
          )}
        </div>

        {day.fromCity && day.toCity && (
          <a
            href={routeMapsLink(day.fromCity, day.toCity)}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-xs font-medium text-ocean-mid hover:text-ocean-deep"
          >
            📍 View route
          </a>
        )}

        {selected && (
          <div className="mt-4 overflow-hidden rounded-xl border border-ink/10 bg-white">
            <div className="flex flex-col sm:flex-row">
              <img
                src={selected.image}
                alt={selected.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = GENERIC_FALLBACK_IMAGE;
                }}
                className="h-32 w-full object-cover sm:h-auto sm:w-40"
              />
              <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg">{TRANSPORT_ICON[selected.type] ?? '🚕'}</span>
                    <p className="text-sm font-semibold text-ink">{selected.name}</p>
                    {selected.badge && (
                      <span className="rounded-full bg-ocean-mid/10 px-2 py-0.5 text-[11px] font-semibold text-ocean-mid">
                        {selected.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink/50">
                    ⏱ {selected.duration} · 💰 {selected.costLabel ?? `$${selected.costPerPerson}`} / person
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  {options.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setPickerOpen((v) => !v)}
                      className="text-xs font-semibold text-ocean-mid hover:text-ocean-deep cursor-pointer"
                    >
                      Change transport
                    </button>
                  ) : (
                    <span />
                  )}
                  <a href={bookingUrl} target="_blank" rel="noreferrer">
                    <Button variant="accent" className="px-4 py-2 text-xs">
                      Book ↗
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {pickerOpen && (
              <div className="space-y-2 border-t border-ink/10 p-3">
                {options.map((opt, i) => (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => {
                      onChangeTransport?.(i);
                      setPickerOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs cursor-pointer ${
                      i === selectedIndex ? 'bg-ocean-mid/10 text-ocean-deep' : 'hover:bg-ink/5 text-ink'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {TRANSPORT_ICON[opt.type] ?? '🚕'} {opt.name}
                    </span>
                    <span className="shrink-0 text-ink/50">
                      {opt.costLabel ?? `$${opt.costPerPerson}`} · {opt.duration}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-xl text-ocean-mid sm:text-2xl">
            {String(day.day).padStart(2, '0')}
          </span>
          <h3 className="text-base font-semibold text-ink sm:text-lg">{day.title}</h3>
        </div>
        {dayTotal > 0 && (
          <div className="text-right text-xs text-ink/50">
            <p className="font-display text-sm text-ocean-mid sm:text-base">
              ${dayTotal.toLocaleString()}
            </p>
            <p>${dayTotalPerPerson.toLocaleString()} / person</p>
          </div>
        )}
      </div>
      <ul className="mt-4 space-y-3">
        {day.activities.map((activity, i) => (
          <li key={i}>
            {activity.transport && (
              <p className="mb-1 text-xs text-ink/40">
                Getting there: {activity.transport.type} · {activity.transport.duration}
                {activity.transport.cost > 0 ? ` · $${activity.transport.cost}` : ''}
              </p>
            )}
            <div className="flex items-start gap-3 text-sm">
              <img
                src={activityImageUrl(activity.name, day.city)}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = GENERIC_FALLBACK_IMAGE;
                }}
                style={{ width: 96, height: 72, borderRadius: 8, objectFit: 'cover' }}
                className="shrink-0"
              />
              <div className="flex flex-1 items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    {activity.time && (
                      <span className="font-medium text-ocean-light">{activity.time}</span>
                    )}
                    <p className="text-ink">{activity.name}</p>
                    <a
                      href={placeMapsLink(activity.name, day.city)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gold-accent-deep hover:text-gold-accent"
                    >
                      📍 Maps
                    </a>
                  </div>
                  {activity.note && <p className="text-ink/50">{activity.note}</p>}
                </div>
                {typeof activity.price === 'number' && activity.price > 0 && (
                  <span className="shrink-0 rounded-full bg-ocean-mid/10 px-2 py-0.5 text-xs font-medium text-ocean-mid">
                    ${activity.price}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
