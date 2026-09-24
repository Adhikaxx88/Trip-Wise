import { useState } from 'react';
import TimePicker from './TimePicker';
import { activityImageUrl } from '../logic/tripMedia';
import type { ItineraryActivity } from '../types';

interface PlaceCardProps {
  activity: ItineraryActivity;
  destination: string;
  onChangeName: (value: string) => void;
  onChangeTime: (value: string) => void;
  onChangePrice: (value: string) => void;
  onRemove: () => void;
}

export default function PlaceCard({
  activity,
  destination,
  onChangeName,
  onChangeTime,
  onChangePrice,
  onRemove,
}: PlaceCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${activity.name} ${destination}`)}`;

  return (
    <li className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        {imgFailed ? (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-mid to-ocean-light text-xl text-white sm:h-20 sm:w-20">
            🗺️
          </div>
        ) : (
          <img
            src={activityImageUrl(activity.name)}
            onError={() => setImgFailed(true)}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-20"
            loading="lazy"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink sm:text-base">
                {activity.name || 'Untitled activity'}
              </p>
              <p className="mt-0.5 text-xs text-ink/50">
                {activity.note ?? 'A great stop on your itinerary.'}
              </p>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-ocean-mid/10 px-2.5 py-1 text-[11px] font-semibold text-ocean-mid hover:bg-ocean-mid/20"
            >
              📍 Maps
            </a>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <TimePicker value={activity.time ?? '9:00 AM'} onChange={onChangeTime} />
            <input
              value={activity.name}
              onChange={(e) => onChangeName(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-ink/10 px-2 py-1.5 text-sm focus:border-ocean-mid focus:outline-none sm:px-3"
              aria-label="Activity name"
            />
            <div className="flex shrink-0 items-center gap-0.5">
              <span className="text-xs text-ink/40">$</span>
              <input
                type="number"
                min={0}
                value={activity.price ?? ''}
                onChange={(e) => onChangePrice(e.target.value)}
                placeholder="0"
                className="w-14 rounded-lg border border-ink/10 px-1.5 py-1.5 text-xs focus:border-ocean-mid focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="shrink-0 rounded-full px-2 py-1 text-ink/40 hover:text-red-500 cursor-pointer"
              aria-label="Remove activity"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
