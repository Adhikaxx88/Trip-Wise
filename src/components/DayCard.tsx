import { useState, type DragEvent } from 'react';
import {
  Bus,
  Car,
  CarTaxiFront,
  Clock,
  GripVertical,
  Luggage,
  MapPin,
  Plane,
  Ship,
  TrainFront,
  X,
  type LucideIcon,
} from 'lucide-react';
import Button from './Button';
import TimePicker from './TimePicker';
import { getActivitySuggestions, suggestionImage } from '../data/activitySuggestions';
import { routeMapsLink } from '../data/transport';
import { getMapsLink } from '../data/tripwiseMaster';
import { dailyTransportCostIDR, formatIDR } from '../logic/tripMedia';
import { getActivityImage, getTransportImage, handleImageError } from '../data/getImage';
import type { ItineraryActivity, ItineraryDay, TransportOption } from '../types';

const TRANSPORT_ICON: Record<string, LucideIcon> = {
  train: TrainFront,
  bus: Bus,
  flight: Plane,
  ferry: Ship,
  car: Car,
  other: CarTaxiFront,
};

function TransportIcon({ type, className = 'h-4 w-4' }: { type: string; className?: string }) {
  const Icon = TRANSPORT_ICON[type] ?? CarTaxiFront;
  return <Icon className={className} aria-hidden />;
}

interface DragHandleProps {
  onDragStart: (e: DragEvent<HTMLSpanElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}

interface DayCardProps {
  day: ItineraryDay;
  packageId: string;
  destination: string;
  country?: string;
  groupSize?: number;
  isEditing?: boolean;
  onChangeTransport?: (optionIndex: number) => void;
  onChangeActivity?: (activityIndex: number, field: 'name' | 'time', value: string) => void;
  onChangeActivityPrice?: (activityIndex: number, value: string) => void;
  onRemoveActivity?: (activityIndex: number) => void;
  onAddActivity?: (activity: ItineraryActivity) => void;
  dragHandleProps?: DragHandleProps;
}

export default function DayCard({
  day,
  packageId,
  destination,
  country,
  groupSize = 1,
  isEditing = false,
  onChangeTransport,
  onChangeActivity,
  onChangeActivityPrice,
  onRemoveActivity,
  onAddActivity,
  dragHandleProps,
}: DayCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
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
            <h3 className="inline-flex items-center gap-2 text-base font-semibold text-ink sm:text-lg">
              <Luggage className="h-4 w-4 shrink-0 text-gold-accent-deep sm:h-5 sm:w-5" aria-hidden />
              <span>
                {day.fromCity} → {day.toCity}
              </span>
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
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-ocean-mid hover:text-ocean-deep"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            View route
          </a>
        )}

        {selected && (
          <div className="mt-4 overflow-hidden rounded-xl border border-ink/10 bg-white">
            <div className="flex flex-col sm:flex-row">
              <img
                src={selected.image || getTransportImage(selected.type)}
                alt={selected.name}
                loading="lazy"
                onError={handleImageError}
                className="h-32 w-full object-cover sm:h-auto sm:w-40"
              />
              <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex text-ocean-mid">
                      <TransportIcon type={selected.type} className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-semibold text-ink">{selected.name}</p>
                    {selected.badge && (
                      <span className="rounded-full bg-ocean-mid/10 px-2 py-0.5 text-[11px] font-semibold text-ocean-mid">
                        {selected.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink/50">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {selected.duration} · {selected.costLabel ?? `$${selected.costPerPerson}`} / person
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
                      <TransportIcon type={opt.type} className="h-3.5 w-3.5 shrink-0" />
                      {opt.name}
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

  const transportCost = dailyTransportCostIDR(packageId, day.day);
  const suggestions = getActivitySuggestions(day.city ?? destination, country);
  const existingNames = new Set(day.activities.map((a) => a.name.toLowerCase()));
  const freshSuggestions = suggestions.filter((s) => !existingNames.has(s.name.toLowerCase()));

  const handleAddSuggested = (name: string, cost: number) => {
    onAddActivity?.({ time: '9:00 AM', name, price: cost });
    setSuggestionsOpen(false);
  };

  const handleAddCustom = () => {
    onAddActivity?.({ time: '9:00 AM', name: 'New activity', price: 0 });
    setSuggestionsOpen(false);
  };

  return (
    <div
      onDragOver={dragHandleProps?.onDragOver}
      onDrop={dragHandleProps?.onDrop}
      className={`rounded-2xl border bg-white p-4 shadow-sm transition-shadow sm:p-6 ${
        dragHandleProps?.isDragOver ? 'border-ocean-mid ring-2 ring-ocean-mid/30' : 'border-ink/10'
      } ${dragHandleProps?.isDragging ? 'opacity-40' : ''}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isEditing && dragHandleProps && (
            <span
              draggable
              onDragStart={dragHandleProps.onDragStart}
              onDragEnd={dragHandleProps.onDragEnd}
              className="inline-flex cursor-grab select-none text-ink/30 hover:text-ink/60 active:cursor-grabbing"
              aria-label="Drag to reorder this day"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" aria-hidden />
            </span>
          )}
          <span className="font-display text-xl text-ocean-mid sm:text-2xl">
            {String(day.day).padStart(2, '0')}
          </span>
          <h3 className="text-base font-semibold text-ink sm:text-lg">{day.title}</h3>
        </div>
        {dayTotal > 0 && (
          <div className="text-right text-xs text-ink/50">
            <p className="font-display text-sm text-ocean-mid sm:text-base">${dayTotal.toLocaleString()}</p>
            <p>${dayTotalPerPerson.toLocaleString()} / person</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-ocean-mid/5 px-3 py-2 text-xs text-ocean-deep">
        <Bus className="h-4 w-4 shrink-0" aria-hidden />
        <span>Estimated local transport (car/bus/MRT): {formatIDR(transportCost)}</span>
      </div>

      <ul className="mt-4 space-y-3">
        {day.activities.map((activity, i) => (
          <li key={i} className={isEditing ? 'overflow-hidden rounded-xl border border-ink/10' : undefined}>
            {activity.transport && (
              <p className="mb-1 text-xs text-ink/40">
                Getting there: {activity.transport.type} · {activity.transport.duration}
                {activity.transport.cost > 0 ? ` · $${activity.transport.cost}` : ''}
              </p>
            )}
            <div className={`flex items-start gap-3 text-sm ${isEditing ? 'p-3' : ''}`}>
              <img
                src={getActivityImage(activity.name)}
                alt=""
                loading="lazy"
                onError={handleImageError}
                style={{ width: 96, height: 72, borderRadius: 8, objectFit: 'cover' }}
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <a
                        href={getMapsLink(activity.name, destination)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ocean-mid/10 px-2.5 py-1 text-[11px] font-semibold text-ocean-mid hover:bg-ocean-mid/20"
                      >
                        <MapPin className="h-3 w-3" aria-hidden />
                        Maps
                      </a>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <TimePicker
                        value={activity.time ?? '9:00 AM'}
                        onChange={(v) => onChangeActivity?.(i, 'time', v)}
                      />
                      <input
                        value={activity.name}
                        onChange={(e) => onChangeActivity?.(i, 'name', e.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-ink/10 px-2 py-1.5 text-sm focus:border-ocean-mid focus:outline-none sm:px-3"
                        aria-label="Activity name"
                      />
                      <div className="flex shrink-0 items-center gap-0.5">
                        <span className="text-xs text-ink/40">$</span>
                        <input
                          type="number"
                          min={0}
                          value={activity.price ?? ''}
                          onChange={(e) => onChangeActivityPrice?.(i, e.target.value)}
                          placeholder="0"
                          className="w-14 rounded-lg border border-ink/10 px-1.5 py-1.5 text-xs focus:border-ocean-mid focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveActivity?.(i)}
                        className="inline-flex shrink-0 items-center rounded-full px-2 py-1 text-ink/40 hover:text-red-500 cursor-pointer"
                        aria-label="Remove activity"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        {activity.time && <span className="font-medium text-ocean-light">{activity.time}</span>}
                        <p className="text-ink">{activity.name}</p>
                        <a
                          href={getMapsLink(activity.name, destination)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-xs text-gold-accent-deep hover:text-gold-accent"
                        >
                          <MapPin className="h-3 w-3" aria-hidden />
                          Maps
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
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {isEditing && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setSuggestionsOpen((v) => !v)}
            className="text-sm font-semibold text-ocean-mid hover:text-ocean-deep cursor-pointer"
          >
            + Add activity
          </button>

          {suggestionsOpen && (
            <div className="mt-2 rounded-xl border border-ink/10 bg-surface p-3">
              <p className="text-xs font-medium text-ink/50">Suggestions for {day.city ?? destination}:</p>
              <ul className="mt-2 space-y-1.5">
                {freshSuggestions.slice(0, 5).map((s) => (
                  <li key={s.name} className="flex items-center gap-2 rounded-lg bg-white p-1.5">
                    <img
                      src={suggestionImage(s.name)}
                      alt=""
                      onError={handleImageError}
                      style={{ width: 40, height: 30, borderRadius: 6, objectFit: 'cover' }}
                      className="shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate text-xs text-ink">{s.name}</span>
                    <span className="shrink-0 text-[11px] text-ink/40">{s.cost > 0 ? `$${s.cost}` : 'Free'}</span>
                    <button
                      type="button"
                      onClick={() => handleAddSuggested(s.name, s.cost)}
                      className="shrink-0 rounded-full bg-ocean-mid/10 px-2 py-1 text-[11px] font-semibold text-ocean-mid hover:bg-ocean-mid/20 cursor-pointer"
                    >
                      + Add
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleAddCustom}
                className="mt-2 text-xs font-medium text-ink/50 hover:text-ink cursor-pointer"
              >
                Or add custom activity...
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
