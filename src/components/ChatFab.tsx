import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ChatBubble from './ChatBubble';
import { getFaqAnswer, SUGGESTED_QUESTIONS } from '../data/chatbotFaq';

interface Message {
  id: string;
  from: 'bot' | 'user';
  text: string;
}

let messageCounter = 0;
function nextMessageId(prefix: string) {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

const WELCOME = "Hi! I'm the TripWise assistant. Ask me anything about planning your trip, or head to the full questionnaire to get matched.";

export default function ChatFab() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [freeformInput, setFreeformInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);

  useEffect(() => {
    if (!chatOpen || greeted.current) return;
    greeted.current = true;
    setMessages([{ id: nextMessageId('bot'), from: 'bot', text: WELCOME }]);
  }, [chatOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pushMessage = (from: Message['from'], text: string) => {
    setMessages((prev) => [...prev, { id: nextMessageId(from), from, text }]);
  };

  const handleSuggestedQuestion = (question: string, answer: string) => {
    pushMessage('user', question);
    setTimeout(() => pushMessage('bot', answer), 400);
  };

  const handleFreeformSubmit = () => {
    const text = freeformInput.trim();
    if (!text) return;
    setFreeformInput('');
    pushMessage('user', text);

    const faqAnswer = getFaqAnswer(text);
    setTimeout(() => {
      pushMessage(
        'bot',
        faqAnswer ?? "I'm best at quick questions. For a full trip match, head to the questionnaire!",
      );
    }, 400);
  };

  return (
    <>
      {chatOpen && (
        <div
          className="fixed z-[9999] flex flex-col overflow-hidden rounded-2xl border border-white/15 text-white shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
          style={{
            bottom: 'calc(90px + env(safe-area-inset-bottom))',
            right: 'calc(24px + env(safe-area-inset-right))',
            width: 320,
            height: 420,
            maxWidth: 'calc(100vw - 32px)',
            background: 'rgba(13, 33, 55, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden>✈</span> Itinerary Assistant
            </p>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              aria-label="Close chat"
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
            {messages.map((m) => (
              <ChatBubble key={m.id} from={m.from}>
                {m.text}
              </ChatBubble>
            ))}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTED_QUESTIONS.map((sq) => (
                <button
                  key={sq.question}
                  onClick={() => handleSuggestedQuestion(sq.question, sq.answer)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 hover:bg-white/15 cursor-pointer"
                >
                  {sq.question}
                </button>
              ))}
            </div>

            <Link
              to="/questionnaire"
              onClick={() => setChatOpen(false)}
              className="mt-1 inline-block rounded-full bg-gold-accent px-3 py-1.5 text-xs font-semibold text-ink hover:opacity-90"
            >
              Start full questionnaire →
            </Link>

            <div ref={bottomRef} />
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t border-white/10 px-3 py-2.5">
            <input
              type="text"
              value={freeformInput}
              onChange={(e) => setFreeformInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFreeformSubmit()}
              placeholder="Type a request..."
              className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white placeholder:text-white/40 focus:border-gold-accent focus:outline-none"
            />
            <button
              onClick={handleFreeformSubmit}
              className="shrink-0 rounded-full bg-gold-accent px-3.5 py-2 text-xs font-semibold text-ink cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        aria-label={chatOpen ? 'Close chat' : 'Talk to the TripWise assistant'}
        title={chatOpen ? 'Close chat' : 'Talk to the TripWise assistant'}
        className="fixed z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-ocean-mid text-white shadow-lg shadow-ocean-deep/40 transition-transform hover:scale-105 cursor-pointer sm:h-14 sm:w-14"
        style={{
          bottom: 'calc(1rem + env(safe-area-inset-bottom))',
          right: 'calc(1rem + env(safe-area-inset-right))',
        }}
      >
        {chatOpen ? (
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
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
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
        )}
      </button>
    </>
  );
}
