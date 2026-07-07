import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ClarityScore, EvaluateResponse } from '../lib/types';
import { scoreToColor } from '../lib/types';

interface Props {
  userId: string;
  onNavigateDetail: () => void;
}

export function ScoreDisplay({ userId, onNavigateDetail }: Props) {
  const [postText, setPostText] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastScore, setLastScore] = useState<EvaluateResponse | null>(null);
  const [scores, setScores] = useState<ClarityScore[]>([]);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  async function loadHistory() {
    const { data } = await supabase
      .from('clarity_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setScores(data);
  }

  async function handleEvaluate(e: React.FormEvent) {
    e.preventDefault();
    if (!postText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, post_text: postText }),
      });
      const data: EvaluateResponse = await res.json();
      setLastScore(data);
      setPostText('');
      loadHistory();
    } catch {
      alert('Assessment failed');
    }
    setLoading(false);
  }

  function getAverage(hours: number): { score: number; color: string; hex: string } | null {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recent = scores.filter((s) => new Date(s.created_at) >= since);
    if (recent.length === 0) return null;
    const avg = Math.round(
      recent.reduce((sum, s) => sum + s.score, 0) / recent.length
    );
    const c = scoreToColor(avg);
    return { score: avg, color: c.label, hex: c.hex };
  }

  const avg24h = getAverage(24);
  const avg7d = getAverage(24 * 7);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <form onSubmit={handleEvaluate} style={{ marginBottom: 24 }}>
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Enter a claim to assess..."
          rows={4}
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
          type="submit"
          disabled={loading}
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
          {loading ? 'Assessing...' : 'Assess Clarity'}
        </button>
      </form>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <ScoreBlock
          label="Assessment"
          score={lastScore?.score ?? scores[0]?.score ?? null}
          colorHex={lastScore?.color_hex ?? scores[0]?.color_hex ?? null}
          onClick={onNavigateDetail}
        />
        <ScoreBlock
          label="Balance 24h"
          score={avg24h?.score ?? null}
          colorHex={avg24h?.hex ?? null}
          onClick={onNavigateDetail}
        />
        <ScoreBlock
          label="Balance 7d"
          score={avg7d?.score ?? null}
          colorHex={avg7d?.hex ?? null}
          onClick={onNavigateDetail}
        />
      </div>

      {lastScore && (
        <div
          style={{
            padding: 16,
            border: '1px solid #ddd',
            borderRadius: 4,
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: '0 0 8px' }}>
            Score: {lastScore.score}/100
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: lastScore.color_hex,
                marginLeft: 8,
              }}
            />
          </h3>
          <p style={{ fontSize: 14, color: '#666', margin: '0 0 12px' }}>
            {lastScore.explanation}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(lastScore.components).map(([key, val]) => (
              <div key={key} style={{ fontSize: 13 }}>
                <strong>{key}:</strong> {val}/20
                <div
                  style={{
                    height: 4,
                    background: '#eee',
                    borderRadius: 2,
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      height: 4,
                      width: `${(val / 20) * 100}%`,
                      background: lastScore.color_hex,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBlock({
  label,
  score,
  colorHex,
  onClick,
}: {
  label: string;
  score: number | null;
  colorHex: string | null;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 16,
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: 4,
        cursor: 'pointer',
        borderTop: `4px solid ${colorHex || '#ccc'}`,
      }}
    >
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 'bold' }}>
        {score !== null ? score : '—'}
      </div>
      {colorHex && (
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: colorHex,
            margin: '8px auto 0',
          }}
        />
      )}
    </div>
  );
}
