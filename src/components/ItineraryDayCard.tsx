import type { ItineraryDay } from '../types';

export default function ItineraryDayCard({ day }: { day: ItineraryDay }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl text-ocean-mid">
          {String(day.day).padStart(2, '0')}
        </span>
        <h3 className="text-lg font-semibold text-ink">{day.title}</h3>
      </div>
      <ul className="mt-4 space-y-3">
        {day.activities.map((activity, i) => (
          <li key={i} className="flex gap-3 text-sm">
            {activity.time && (
              <span className="w-20 shrink-0 font-medium text-ocean-light">{activity.time}</span>
            )}
            <div>
              <p className="text-ink">{activity.name}</p>
              {activity.note && <p className="text-ink/50">{activity.note}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
