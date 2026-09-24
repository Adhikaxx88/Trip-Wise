import { useState, type FormEvent } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatBubble from './ChatBubble';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

interface ItineraryAssistantProps {
  onCheaperHotel: () => void;
  onAddActivity: () => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  from: 'bot',
  text: "Hi! I'm your itinerary assistant. Try \"change hotel to cheaper option\" or \"add a beach activity\".",
};

function replyFor(input: string, actions: ItineraryAssistantProps): string {
  const text = input.toLowerCase();

  if (text.includes('cheap') && text.includes('hotel')) {
    actions.onCheaperHotel();
    return "Done — I swapped in a cheaper hotel option and trimmed the cost by about 20%.";
  }
  if (text.includes('hotel')) {
    actions.onCheaperHotel();
    return "Got it — I adjusted the hotel pricing for you.";
  }
  if (text.includes('add') && text.includes('activ')) {
    actions.onAddActivity();
    return "Added a new activity to your first day — feel free to edit its name, time, and price.";
  }
  if (text.includes('add') && (text.includes('beach') || text.includes('trip'))) {
    actions.onAddActivity();
    return "Added a new activity — I tossed it onto day one, rename it to whatever you have in mind.";
  }
  if (text.includes('remove') || text.includes('delete')) {
    return "You can remove any activity with the ✕ button right on its card.";
  }
  return "Got it, noted!";
}

export default function ItineraryAssistant(props: ItineraryAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [draft, setDraft] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    const botText = replyFor(trimmed, props);
    setMessages((prev) => [...prev, { from: 'user', text: trimmed }, { from: 'bot', text: botText }]);
    setDraft('');
  };

  return (
    <>
      {open && (
        <div
          className="fixed z-50 flex w-80 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-2xl animate-fade-in"
          style={{
            bottom: 'calc(5rem + env(safe-area-inset-bottom))',
            right: 'calc(1rem + env(safe-area-inset-right))',
            height: '400px',
            maxWidth: 'calc(100vw - 2rem)',
          }}
        >
          <div className="flex shrink-0 items-center justify-between bg-ocean-deepest px-4 py-3 text-white">
            <p className="text-sm font-semibold">Itinerary Assistant</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="inline-flex cursor-pointer items-center rounded-full px-1.5 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => (
              <ChatBubble key={i} from={m.from}>
                {m.text}
              </ChatBubble>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-2 border-t border-ink/10 p-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask for a change..."
              className="min-w-0 flex-1 rounded-full border border-ink/10 px-3 py-2 text-sm focus:border-ocean-mid focus:outline-none"
              aria-label="Message the itinerary assistant"
            />
            <button
              type="submit"
              className="shrink-0 cursor-pointer rounded-full bg-ocean-mid px-3 py-2 text-sm font-semibold text-white hover:bg-ocean-deep"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open itinerary assistant"
        title="Itinerary assistant"
        className="fixed z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gold-accent text-xl text-ink shadow-lg shadow-ocean-deep/40 transition-transform hover:scale-105 cursor-pointer sm:h-14 sm:w-14"
        style={{
          bottom: 'calc(1rem + env(safe-area-inset-bottom))',
          right: 'calc(1rem + env(safe-area-inset-right))',
        }}
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
      </button>
    </>
  );
}
