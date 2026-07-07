import { useState, useRef, useEffect } from 'react';
import type { MagnifierMessage } from '../lib/types';
import './Magnifier.css';

interface Props {
  onBack: () => void;
}

export function Magnifier({ onBack }: Props) {
  const [claim, setClaim] = useState('');
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<MagnifierMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
  }

  return (
    <div>
      <button onClick={onBack} className="btn-link">
        &larr; Back to Codex
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
