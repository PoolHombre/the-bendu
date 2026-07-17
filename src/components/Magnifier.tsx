import { useState, useRef, useEffect } from 'react';
import type { MagnifierMessage, EvaluateResponse } from '../lib/types';
import './Magnifier.css';

interface Props {
  userId: string;
  initialClaim?: string;
  onBack: () => void;
}

function extractRevisedClaim(messages: MagnifierMessage[]): string | null {
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'assistant') return null;
  const match = last.content.match(/##\s*Revised Claim\s*\n+([\s\S]+)/i);
  if (!match) return null;
  return match[1].trim().replace(/^["']|["']$/g, '');
}

export function Magnifier({ userId, initialClaim = '', onBack }: Props) {
  const [claim, setClaim] = useState(initialClaim);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<MagnifierMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<{
    initial: EvaluateResponse;
    revised: EvaluateResponse;
  } | null>(null);
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function startConversation() {
    if (!claim.trim()) return;
    setStarted(true);
    setLoading(true);

    try {
      const res = await fetch('/api/magnifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim, conversation_history: [] }),
      });
      const data = await res.json();
      setMessages([{ role: 'assistant', content: data.response }]);
    } catch {
      setMessages([
        { role: 'assistant', content: 'Error starting conversation.' },
      ]);
    }
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: MagnifierMessage = { role: 'user', content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/magnifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim, conversation_history: updated }),
      });
      const data = await res.json();
      setMessages([...updated, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages([
        ...updated,
        { role: 'assistant', content: 'Error getting response.' },
      ]);
    }
    setLoading(false);
  }

  function restart() {
    setMessages([]);
    setClaim('');
    setStarted(false);
    setComparison(null);
    setScoreError('');
  }

  async function scoreRevision(revisedClaim: string) {
    setScoring(true);
    setScoreError('');

    try {
      const evaluate = async (text: string, save: boolean) => {
        const res = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, post_text: text, save }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Scoring failed (${res.status})`);
        }
        return (await res.json()) as EvaluateResponse;
      };

      const [initial, revised] = await Promise.all([
        evaluate(claim, false),
        evaluate(revisedClaim, true),
      ]);
      setComparison({ initial, revised });
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : 'Scoring failed');
    }
    setScoring(false);
  }

  const revisedClaim = extractRevisedClaim(messages);

  return (
    <div>
      <button onClick={onBack} className="btn-link">
        &larr; Back
      </button>

      <h2 className="page-title">Mirror</h2>
      <p className="mirror-intro">
        Walk through your claim step by step using the Toulmin model. The Mirror
        asks about your evidence, warrants, qualifiers, and rebuttals — then
        reflects back where the clarity gaps are.
      </p>

      {!started ? (
        <div>
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Enter a claim to examine..."
            rows={3}
            className="field-textarea"
          />
          <button
            onClick={startConversation}
            disabled={loading || !claim.trim()}
            className="btn-primary"
            style={{ marginTop: 8 }}
          >
            {loading ? 'Starting...' : 'Begin Analysis'}
          </button>
        </div>
      ) : (
        <div className="chat-container">
          <div className="claim-bar">
            <span className="claim-text">
              <strong>Claim:</strong> {claim.slice(0, 100)}
              {claim.length > 100 ? '...' : ''}
            </span>
            <button onClick={restart} className="btn-ghost btn-sm">
              New claim
            </button>
          </div>

          <div className="message-scroll">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${msg.role === 'assistant' ? 'bubble-mirror' : 'bubble-you'}`}
              >
                <span className="bubble-label">
                  {msg.role === 'assistant' ? 'Mirror' : 'You'}
                </span>
                <div className="bubble-content">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble bubble-mirror">
                <span className="bubble-label">Mirror</span>
                <div className="bubble-content thinking">Thinking...</div>
              </div>
            )}

            {revisedClaim && !comparison && (
              <div className="score-revision-bar">
                <button
                  onClick={() => scoreRevision(revisedClaim)}
                  disabled={scoring}
                  className="btn-primary"
                >
                  {scoring ? 'Scoring...' : 'Score Revision'}
                </button>
                {scoreError && <p className="score-error">{scoreError}</p>}
              </div>
            )}

            {comparison && (
              <ComparisonPanel
                initial={comparison.initial}
                revised={comparison.revised}
              />
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-bar">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Your response..."
              className="field-input chat-field"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="btn-primary btn-send"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const MAX_COMPONENT = 20;

function ComparisonPanel({
  initial,
  revised,
}: {
  initial: EvaluateResponse;
  revised: EvaluateResponse;
}) {
  const keys = Object.keys(initial.components) as Array<
    keyof typeof initial.components
  >;

  return (
    <div className="comparison-panel">
      <h3 className="comparison-title">Initial vs. Revised</h3>
      <p className="comparison-overall">
        Overall: {initial.score} &rarr; {revised.score}
      </p>
      <div className="comparison-rows">
        {keys.map((key) => (
          <DeltaBar
            key={key}
            label={key}
            initial={initial.components[key]}
            revised={revised.components[key]}
          />
        ))}
      </div>
      <div className="comparison-legend">
        <span>
          <span className="legend-swatch swatch-red" /> initial / lost
        </span>
        <span>
          <span className="legend-swatch swatch-blue" /> revised / gained
        </span>
      </div>
    </div>
  );
}

function DeltaBar({
  label,
  initial,
  revised,
}: {
  label: string;
  initial: number;
  revised: number;
}) {
  const delta = revised - initial;
  const pct = (n: number) => `${(n / MAX_COMPONENT) * 100}%`;

  let segments: Array<{ color: string; width: string }>;
  let scoreLabel: string;

  if (delta > 0) {
    // Red bar = initial, extended with blue for the gain
    segments = [
      { color: 'var(--clarity-red)', width: pct(initial) },
      { color: 'var(--clarity-blue)', width: pct(delta) },
    ];
    scoreLabel = `(${initial}/${MAX_COMPONENT})+${delta}`;
  } else if (delta < 0) {
    // Blue bar = reduced score, red appended for the points lost
    segments = [
      { color: 'var(--clarity-blue)', width: pct(revised) },
      { color: 'var(--clarity-red)', width: pct(-delta) },
    ];
    scoreLabel = `(${initial}/${MAX_COMPONENT})-${-delta}`;
  } else {
    // No change: full blue bar, plain label
    segments = [{ color: 'var(--clarity-blue)', width: pct(revised) }];
    scoreLabel = `(${initial}/${MAX_COMPONENT})`;
  }

  return (
    <div className="delta-row">
      <span className="component-label">{label}</span>
      <span className="component-value">{scoreLabel}</span>
      <div className="bar-track delta-track">
        {segments.map((s, i) => (
          <div
            key={i}
            className="delta-segment"
            style={{ width: s.width, background: s.color }}
          />
        ))}
      </div>
    </div>
  );
}
