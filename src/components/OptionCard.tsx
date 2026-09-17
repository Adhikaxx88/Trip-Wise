interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export default function OptionCard({ label, description, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-150 cursor-pointer sm:px-6 sm:py-4 ${
        selected
          ? 'border-ocean-mid bg-ocean-mid/10 shadow-[0_0_0_3px_rgba(23,103,138,0.15)]'
          : 'border-ink/10 bg-white hover:border-ocean-light/60 hover:bg-ocean-light/5'
      }`}
    >
      <span className={`block text-base font-semibold ${selected ? 'text-ocean-deep' : 'text-ink'}`}>
        {label}
      </span>
      {description && <span className="mt-0.5 block text-sm text-ink/60">{description}</span>}
    </button>
  );
}
