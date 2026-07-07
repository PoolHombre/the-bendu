import { useState, useRef, useEffect } from 'react';
import type { MagnifierMessage } from '../lib/types';

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
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <button onClick={onBack} style={linkBtnStyle}>
        &larr; Back to Codex
      </button>

      <h2 style={{ marginBottom: 8 }}>Mirror</h2>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
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
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 14,
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={startConversation}
            disabled={loading || !claim.trim()}
            style={{
              marginTop: 8,
              padding: '10px 24px',
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Starting...' : 'Begin Analysis'}
          </button>
        </div>
      ) : (
        <div>
          <div
            style={{
              padding: '8px 12px',
              background: '#f0f0f0',
              borderRadius: 4,
              marginBottom: 12,
              fontSize: 13,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              <strong>Claim:</strong> {claim.slice(0, 100)}
              {claim.length > 100 ? '...' : ''}
            </span>
            <button
              onClick={restart}
              style={{
                fontSize: 12,
                background: 'none',
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              New claim
            </button>
          </div>

          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: 4,
              maxHeight: 400,
              overflowY: 'auto',
              marginBottom: 12,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  background: msg.role === 'assistant' ? '#f9f9f9' : 'white',
                  borderBottom: '1px solid #eee',
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ fontSize: 11, color: '#888' }}>
                  {msg.role === 'assistant' ? 'Mirror' : 'You'}
                </strong>
                <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#f9f9f9',
                  fontSize: 14,
                  color: '#888',
                }}
              >
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Your response..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: '8px 16px',
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const linkBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#3B82F6',
  cursor: 'pointer',
  padding: 0,
  fontSize: 14,
  marginBottom: 16,
  display: 'block',
};
