interface CityCardProps {
  name: string;
  subtitle?: string;
  imageUrl: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function CityCard({ name, subtitle, imageUrl, selected, disabled, onClick }: CityCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-all duration-150 ${
        selected
          ? 'border-ocean-mid shadow-[0_0_0_3px_rgba(23,103,138,0.15)]'
          : 'border-ink/10 hover:border-ocean-light/60'
      } ${disabled && !selected ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
    >
      <div className="relative h-24 w-full overflow-hidden bg-ink/5">
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://source.unsplash.com/400x300/?travel+destination';
          }}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {selected && (
          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ocean-mid text-[11px] text-white">
            ✓
          </span>
        )}
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-semibold text-ink">{name}</p>
        {subtitle && <p className="text-xs text-ink/50">{subtitle}</p>}
      </div>
    </button>
  );
}
