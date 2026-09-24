import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatBubble from '../components/ChatBubble';
import Logo from '../components/Logo';
import {
  BUDGET_OPTIONS,
  DATE_RANGE_PRESETS,
  datesFromPresetDays,
  getVisibleSteps,
  GROUP_SIZE_PRESETS,
  GROUP_TYPE_OPTIONS,
  INTENSITY_OPTIONS,
  matchFreeTextToStep,
  VIBE_IDK_OPTION,
  VIBE_OPTIONS,
  type StepDef,
} from '../data/questionOptions';
import { getFaqAnswer, SUGGESTED_QUESTIONS } from '../data/chatbotFaq';
import { useCurrentTrip } from '../context/CurrentTripContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useTripPreferences } from '../context/TripPreferencesContext';
import { daysBetweenInclusive, formatDateRange, formatFullDate, todayIsoDate } from '../logic/dates';
import { matchTrip } from '../logic/matchTrip';
import type { TripPreferences } from '../types';

const PROMPTS: Partial<Record<StepDef['id'], string>> = {
  vibe: "Hi! I'm the TripWise assistant. What's the vibe you're going for on this trip?",
  dates: 'Nice choice. When are you thinking of going?',
  budget: "Got it. What's your total budget for the trip?",
  groupSize: 'How many people are coming along?',
  intensity: 'Since you want adventure, how intense should the activities be?',
  groupType: "Last thing, who's coming with you?",
};

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

export default function Chatbot() {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = useTripPreferences();
  const { setCurrentTrip } = useCurrentTrip();
  const { subscription, canRegenerate, regenerationsRemaining, recordRegeneration } = useSubscription();
  const [draft, setDraft] = useState<TripPreferences>(preferences);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [freeformInput, setFreeformInput] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const promptedSteps = useRef(new Set<string>());

  const steps = useMemo(() => getVisibleSteps(draft, false), [draft]);
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];

  useEffect(() => {
    if (!currentStep || promptedSteps.current.has(currentStep.id)) return;
    const prompt = PROMPTS[currentStep.id];
    if (!prompt) return;
    promptedSteps.current.add(currentStep.id);
    setMessages((prev) => [...prev, { id: nextMessageId('bot'), from: 'bot', text: prompt }]);
  }, [currentStep]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMatching]);

  const pushMessage = (from: Message['from'], text: string) => {
    setMessages((prev) => [...prev, { id: nextMessageId(from), from, text }]);
  };

  const applyAnswer = (patch: Partial<TripPreferences>) => {
    const nextDraft = { ...draft, ...patch };
    setDraft(nextDraft);

    const nextSteps = getVisibleSteps(nextDraft, false);
    if (stepIndex < nextSteps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      finish(nextDraft);
    }
  };

  const advance = (label: string, patch: Partial<TripPreferences>) => {
    pushMessage('user', label);
    applyAnswer(patch);
  };

  const finish = (finalPrefs: TripPreferences) => {
    if (!canRegenerate) {
      setLimitReached(true);
      pushMessage(
        'bot',
        `You've used your 3 free trip matches this month. They reset on ${formatFullDate(
          subscription.regenerationsResetAt,
        )} — or upgrade anytime for unlimited matches and hidden-gem destinations.`,
      );
      return;
    }
    updatePreferences(finalPrefs);
    setIsMatching(true);
    pushMessage('bot', 'Perfect, matching you a trip now…');
    setTimeout(async () => {
      const pkg = await matchTrip(finalPrefs, subscription.currentTier);
      recordRegeneration();
      setCurrentTrip(pkg, finalPrefs);
      navigate(`/trip/${pkg.id}`);
    }, 1400);
  };

  const handleSuggestedQuestion = (question: string, answer: string) => {
    pushMessage('user', question);
    setTimeout(() => pushMessage('bot', answer), 500);
  };

  const handleFreeformSubmit = () => {
    const text = freeformInput.trim();
    if (!text || isMatching) return;
    setFreeformInput('');
    pushMessage('user', text);

    const parsed = matchFreeTextToStep(text, currentStep.id);
    if (parsed) {
      applyAnswer(parsed.patch);
      return;
    }

    const faqAnswer = getFaqAnswer(text);
    setTimeout(() => {
      pushMessage(
        'bot',
        faqAnswer ?? 'Got it! You can also tap one of the options below to keep things moving.',
      );
    }, 500);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="flex items-center justify-between bg-ocean-deepest px-6 py-5 sm:px-12">
        <Logo />
        {subscription.currentTier === 'free' && regenerationsRemaining !== null && (
          <p className="text-xs font-medium text-white/50">
            {regenerationsRemaining} match{regenerationsRemaining === 1 ? '' : 'es'} left this month
          </p>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
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

        {!isMatching && limitReached && (
          <div
            className="sticky bottom-0 mt-4 space-y-3 rounded-2xl bg-surface pt-2 text-center"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <Link
              to="/profile"
              className="inline-block rounded-full bg-gold-accent px-6 py-3 font-semibold text-ink hover:opacity-90"
            >
              View plans
            </Link>
          </div>
        )}

        {!isMatching && !limitReached && (
          <div
            className="sticky bottom-0 mt-4 space-y-3 rounded-2xl bg-surface pt-2"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {currentStep.id === 'vibe' && (
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => advance(opt.label, { vibe: [opt.value] })}
                    className="rounded-full border-2 border-ocean-mid/30 bg-white px-4 py-2 text-sm font-semibold text-ocean-deep hover:bg-ocean-mid/10 cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  onClick={() => advance(VIBE_IDK_OPTION.label, { vibe: [] })}
                  className="rounded-full border-2 border-ocean-mid/30 bg-white px-4 py-2 text-sm font-semibold text-ocean-deep hover:bg-ocean-mid/10 cursor-pointer"
                >
                  {VIBE_IDK_OPTION.label}
                </button>
              </div>
            )}

            {currentStep.id === 'dates' && (
              <div className="flex flex-wrap gap-2">
                {DATE_RANGE_PRESETS.map((preset) => {
                  const { startDate, endDate } = datesFromPresetDays(preset.days);
                  return (
                    <button
                      key={preset.label}
                      onClick={() =>
                        advance(`${formatDateRange(startDate, endDate)} (${preset.days} days)`, {
                          startDate,
                          endDate,
                          durationDays: daysBetweenInclusive(startDate, endDate),
                        })
                      }
                      className="rounded-full border-2 border-ocean-mid/30 bg-white px-4 py-2 text-sm font-semibold text-ocean-deep hover:bg-ocean-mid/10 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  );
                })}
                <DateRangeInline
                  onConfirm={(startDate, endDate) =>
                    advance(`${formatDateRange(startDate, endDate)}`, {
                      startDate,
                      endDate,
                      durationDays: daysBetweenInclusive(startDate, endDate),
                    })
                  }
                />
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
              <div className="flex flex-wrap gap-2">
                {GROUP_SIZE_PRESETS.map((n) => (
                  <button
                    key={n}
                    onClick={() => advance(n === 1 ? 'Just me' : `${n} people`, { groupSize: n })}
                    className="rounded-full border-2 border-ocean-mid/30 bg-white px-4 py-2 text-sm font-semibold text-ocean-deep hover:bg-ocean-mid/10 cursor-pointer"
                  >
                    {n === 1 ? 'Just me' : `${n} people`}
                  </button>
                ))}
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

            <div className="flex gap-2 overflow-x-auto pb-1">
              {SUGGESTED_QUESTIONS.map((sq) => (
                <button
                  key={sq.question}
                  onClick={() => handleSuggestedQuestion(sq.question, sq.answer)}
                  className="shrink-0 rounded-full border border-ocean-light/40 bg-ocean-light/5 px-3 py-1.5 text-xs font-medium text-ocean-deep hover:bg-ocean-light/15 cursor-pointer"
                >
                  {sq.question}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-ink/10 pt-3">
              <input
                type="text"
                value={freeformInput}
                onChange={(e) => setFreeformInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFreeformSubmit()}
                placeholder="Type your answer or a question..."
                className="min-w-0 flex-1 rounded-full border-2 border-ink/10 px-4 py-2.5 text-sm focus:border-ocean-mid focus:outline-none"
              />
              <button
                onClick={handleFreeformSubmit}
                className="shrink-0 rounded-full bg-ocean-mid px-4 py-2.5 text-sm font-semibold text-white cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DateRangeInline({ onConfirm }: { onConfirm: (startDate: string, endDate: string) => void }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const valid = start && end && end >= start;

  return (
    <div className="flex w-full flex-wrap items-center gap-2 rounded-2xl border-2 border-ocean-mid/20 bg-white px-3 py-2">
      <input
        type="date"
        min={todayIsoDate()}
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-ink/10 px-2 py-1.5 text-sm focus:border-ocean-mid focus:outline-none"
      />
      <span className="text-ink/40">to</span>
      <input
        type="date"
        min={start || todayIsoDate()}
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-ink/10 px-2 py-1.5 text-sm focus:border-ocean-mid focus:outline-none"
      />
      <button
        type="button"
        disabled={!valid}
        onClick={() => valid && onConfirm(start, end)}
        className="shrink-0 rounded-full bg-ocean-mid px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40 cursor-pointer"
      >
        Set dates
      </button>
    </div>
  );
}
