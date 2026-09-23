import { Link } from 'react-router-dom';

export default function ChatFab() {
  return (
    <Link
      to="/chatbot"
      aria-label="Need to adjust? Chat with us"
      className="chat-fab group fixed z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gold-accent text-ink shadow-lg shadow-ocean-deepest/40 transition-transform duration-200 hover:scale-110 hover:shadow-xl cursor-pointer sm:h-14 sm:w-14"
      style={{
        bottom: 'calc(1rem + env(safe-area-inset-bottom))',
        right: 'calc(1rem + env(safe-area-inset-right))',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 sm:h-6 sm:w-6"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      <span
        className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ocean-deepest px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
        role="tooltip"
      >
        Need to adjust? Chat with us
      </span>
    </Link>
  );
}
