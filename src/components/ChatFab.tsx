import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, X } from 'lucide-react';
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

const WELCOME =
  "Hi! I'm your itinerary assistant. Tell me what to change and I'll update your trip instantly. ✈";

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
          className="fixed z-[9999] flex flex-col overflow-hidden rounded-2xl border border-white/10 text-white shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
          style={{
            bottom: 'calc(90px + env(safe-area-inset-bottom))',
            right: 'calc(24px + env(safe-area-inset-right))',
            width: 380,
            height: 520,
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: '70vh',
            background: 'linear-gradient(145deg, #1a2f4a, #0f1f35)',
          }}
        >
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3"
            style={{
              background: 'rgba(255, 210, 51, 0.12)',
              borderBottom: '1px solid rgba(255, 210, 51, 0.2)',
            }}
          >
            <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#FFD233' }}>
              <Plane className="h-4 w-4" aria-hidden style={{ color: '#FFD233' }} />
              Itinerary Assistant
            </p>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              aria-label="Close chat"
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="chat-scroll flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[80%] px-4 py-2.5 text-sm"
                  style={
                    m.from === 'user'
                      ? {
                          background: '#FFD233',
                          color: '#0D1B2A',
                          borderRadius: '16px 16px 4px 16px',
                        }
                      : {
                          background: 'rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.9)',
                          borderRadius: '16px 16px 16px 4px',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }
                  }
                >
                  {m.text}
                </div>
              </div>
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
              className="mt-1 inline-block rounded-full px-3 py-1.5 text-xs font-semibold hover:opacity-90"
              style={{ background: '#FFD233', color: '#0D1B2A' }}
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
              className="min-w-0 flex-1 text-sm text-white placeholder:text-white/40 focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 24,
                padding: '12px 16px',
              }}
            />
            <button
              onClick={handleFreeformSubmit}
              aria-label="Send message"
              className="flex shrink-0 items-center justify-center font-bold cursor-pointer"
              style={{
                background: '#FFD233',
                color: '#0D1B2A',
                borderRadius: '50%',
                width: 40,
                height: 40,
              }}
            >
              →
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        aria-label={chatOpen ? 'Close chat' : 'Need to adjust? Chat with us'}
        className={`group fixed z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-gold-accent text-ink shadow-lg shadow-ocean-deepest/40 transition-transform duration-200 hover:scale-110 hover:shadow-xl cursor-pointer sm:h-14 sm:w-14 ${
          chatOpen ? '' : 'chat-fab'
        }`}
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
          <>
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
          </>
        )}
      </button>
    </>
  );
}
