import type { ItineraryDay } from '../types';

interface ItineraryDayCardProps {
  day: ItineraryDay;
  groupSize?: number;
}

export default function ItineraryDayCard({ day, groupSize = 1 }: ItineraryDayCardProps) {
  const dayTotalPerPerson = day.activities.reduce((sum, a) => sum + (a.price ?? 0), 0);
  const dayTotal = dayTotalPerPerson * groupSize;

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
          <li key={i} className="flex items-start justify-between gap-2 text-sm sm:gap-3">
            <div className="flex gap-2 sm:gap-3">
              {activity.time && (
                <span className="w-14 shrink-0 font-medium text-ocean-light sm:w-20">
                  {activity.time}
                </span>
              )}
              <div>
                <p className="text-ink">{activity.name}</p>
                {activity.note && <p className="text-ink/50">{activity.note}</p>}
              </div>
            </div>
            {typeof activity.price === 'number' && activity.price > 0 && (
              <span className="shrink-0 rounded-full bg-ocean-mid/10 px-2 py-0.5 text-xs font-medium text-ocean-mid">
                ${activity.price}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
