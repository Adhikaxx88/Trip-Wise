import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBubble from '../components/ChatBubble';
import Logo from '../components/Logo';
import {
  BUDGET_OPTIONS,
  DURATION_PRESETS,
  getVisibleSteps,
  GROUP_SIZE_PRESETS,
  GROUP_TYPE_OPTIONS,
  INTENSITY_OPTIONS,
  VIBE_OPTIONS,
  type StepDef,
} from '../data/questionOptions';
import { useCurrentTrip } from '../context/CurrentTripContext';
import { useTripPreferences } from '../context/TripPreferencesContext';
import { matchTrip } from '../logic/matchTrip';
import type { TripPreferences } from '../types';

const PROMPTS: Record<StepDef['id'], string> = {
  vibe: "Hi! I'm the TripWise assistant. What's the vibe you're going for on this trip?",
  duration: 'Nice choice. How many days do you have?',
  budget: "Got it. What's your total budget for the trip?",
  groupSize: 'How many people are coming along?',
  intensity: 'Since you want adventure — how intense should the activities be?',
  groupType: "Last thing — who's coming with you?",
};

interface Message {
  id: string;
  from: 'bot' | 'user';
  text: string;
}

export default function Chatbot() {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = useTripPreferences();
  const { setCurrentTrip } = useCurrentTrip();
  const [draft, setDraft] = useState<TripPreferences>(preferences);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const promptedSteps = useRef(new Set<string>());

  const steps = useMemo(() => getVisibleSteps(draft), [draft]);
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];

  useEffect(() => {
    if (!currentStep || promptedSteps.current.has(currentStep.id)) return;
    promptedSteps.current.add(currentStep.id);
    setMessages((prev) => [
      ...prev,
      { id: `bot-${currentStep.id}`, from: 'bot', text: PROMPTS[currentStep.id] },
    ]);
  }, [currentStep]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMatching]);

  const advance = (label: string, patch: Partial<TripPreferences>) => {
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, from: 'user', text: label }]);
    const nextDraft = { ...draft, ...patch };
    setDraft(nextDraft);

    const nextSteps = getVisibleSteps(nextDraft);
    if (stepIndex < nextSteps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      finish(nextDraft);
    }
  };

  const finish = (finalPrefs: TripPreferences) => {
    updatePreferences(finalPrefs);
    setIsMatching(true);
    setMessages((prev) => [
      ...prev,
      { id: 'bot-matching', from: 'bot', text: 'Perfect — matching you a trip now…' },
    ]);
    setTimeout(() => {
      const pkg = matchTrip(finalPrefs);
      setCurrentTrip(pkg, finalPrefs);
      navigate(`/trip/${pkg.id}`);
    }, 1400);
  };

  const handleTextSubmit = () => {
    const n = parseInt(textInput, 10);
    if (!Number.isFinite(n) || n <= 0) return;
    if (currentStep.id === 'duration') {
      advance(`${n} days`, { durationDays: n });
    } else if (currentStep.id === 'groupSize') {
      advance(n === 1 ? 'Just me' : `${n} people`, { groupSize: n });
    }
    setTextInput('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex items-center justify-between bg-ocean-deepest px-6 py-5 sm:px-12">
        <Logo />
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-0">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {messages.map((m) => (
            <ChatBubble key={m.id} from={m.from}>
              {m.text}
            </ChatBubble>
          ))}
          {isMatching && (
            <ChatBubble from="bot">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ocean-mid [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ocean-mid" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ocean-mid [animation-delay:0.2s]" />
              </span>
            </ChatBubble>
          )}
          <div ref={bottomRef} />
        </div>

        {!isMatching && (
          <div className="sticky bottom-0 mt-4 rounded-2xl bg-surface pt-2">
            {currentStep.id === 'vibe' && (
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => advance(opt.label, { vibe: opt.value })}
                    className="rounded-full border-2 border-ocean-mid/30 bg-white px-4 py-2 text-sm font-semibold text-ocean-deep hover:bg-ocean-mid/10 cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {currentStep.id === 'duration' && (
              <div className="flex flex-wrap items-center gap-2">
                {DURATION_PRESETS.map((d) => (
                  <button
                    key={d}
                    onClick={() => advance(`${d} days`, { durationDays: d })}
                    className="rounded-full border-2 border-ocean-mid/30 bg-white px-4 py-2 text-sm font-semibold text-ocean-deep hover:bg-ocean-mid/10 cursor-pointer"
                  >
                    {d} days
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                    placeholder="Custom #"
                    className="w-24 rounded-full border-2 border-ink/10 px-3 py-2 text-sm focus:border-ocean-mid focus:outline-none"
                  />
                  <button
                    onClick={handleTextSubmit}
                    className="rounded-full bg-ocean-mid px-4 py-2 text-sm font-semibold text-white cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {currentStep.id === 'budget' && (
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() =>
                      advance(opt.label, { budget: { min: opt.min, max: opt.max, currency: 'USD' } })
                    }
                    className="rounded-full border-2 border-ocean-mid/30 bg-white px-4 py-2 text-sm font-semibold text-ocean-deep hover:bg-ocean-mid/10 cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {currentStep.id === 'groupSize' && (
              <div className="flex flex-wrap items-center gap-2">
                {GROUP_SIZE_PRESETS.map((n) => (
                  <button
                    key={n}
                    onClick={() => advance(n === 1 ? 'Just me' : `${n} people`, { groupSize: n })}
                    className="rounded-full border-2 border-ocean-mid/30 bg-white px-4 py-2 text-sm font-semibold text-ocean-deep hover:bg-ocean-mid/10 cursor-pointer"
                  >
                    {n === 1 ? 'Just me' : `${n} people`}
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                    placeholder="Custom #"
                    className="w-24 rounded-full border-2 border-ink/10 px-3 py-2 text-sm focus:border-ocean-mid focus:outline-none"
                  />
                  <button
                    onClick={handleTextSubmit}
                    className="rounded-full bg-ocean-mid px-4 py-2 text-sm font-semibold text-white cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {currentStep.id === 'intensity' && (
              <div className="flex flex-wrap gap-2">
                {INTENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => advance(opt.label, { activityIntensity: opt.value })}
                    className="rounded-full border-2 border-ocean-mid/30 bg-white px-4 py-2 text-sm font-semibold text-ocean-deep hover:bg-ocean-mid/10 cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {currentStep.id === 'groupType' && (
              <div className="flex flex-wrap gap-2">
                {GROUP_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => advance(opt.label, { groupType: opt.value })}
                    className="rounded-full border-2 border-ocean-mid/30 bg-white px-4 py-2 text-sm font-semibold text-ocean-deep hover:bg-ocean-mid/10 cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
