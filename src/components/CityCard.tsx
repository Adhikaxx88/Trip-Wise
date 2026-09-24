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
      className={`group relative flex h-28 w-full flex-col overflow-hidden rounded-2xl border-2 text-left transition-all duration-150 ${
        selected
          ? 'border-ocean-mid shadow-[0_0_0_3px_rgba(23,103,138,0.15)]'
          : 'border-ink/10 hover:border-ocean-light/60'
      } ${disabled && !selected ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
    >
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = 'https://source.unsplash.com/400x300/?travel+destination+beautiful';
        }}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75))' }}
      />
      {selected && (
        <span className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-ocean-mid text-[11px] text-white">
          ✓
        </span>
      )}
      <div className="relative mt-auto px-3 py-2">
        <p className="text-sm font-semibold text-white drop-shadow-sm">{name}</p>
        {subtitle && <p className="text-xs text-white/80 drop-shadow-sm">{subtitle}</p>}
      </div>
    </button>
  );
}
