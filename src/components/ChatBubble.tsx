import type { ReactNode } from 'react';

interface ChatBubbleProps {
  from: 'bot' | 'user';
  children: ReactNode;
}

export default function ChatBubble({ from, children }: ChatBubbleProps) {
  const isBot = from === 'bot';
  return (
    <div className={`flex animate-slide-up ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm sm:text-base ${
          isBot
            ? 'rounded-bl-sm bg-white text-ink shadow-sm'
            : 'rounded-br-sm bg-ocean-mid text-white'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
