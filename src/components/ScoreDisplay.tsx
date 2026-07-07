import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ClarityScore, EvaluateResponse } from '../lib/types';
import { scoreToColor } from '../lib/types';
import './ScoreDisplay.css';

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
    <div>
      <form onSubmit={handleEvaluate} className="assess-form">
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Enter a claim to assess..."
          rows={4}
          className="field-textarea"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Assessing...' : 'Assess Clarity'}
        </button>
      </form>

      <div className="score-grid">
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
        <div className="result-card">
          <h3 className="result-header">
            Score: <span className="result-score">{lastScore.score}</span>/100
            <span
              className="color-dot"
              style={{ background: lastScore.color_hex }}
            />
          </h3>
          <p className="result-explanation">{lastScore.explanation}</p>
          <div className="component-grid">
            {Object.entries(lastScore.components).map(([key, val]) => (
              <div key={key} className="component-item">
                <span className="component-label">{key}</span>
                <span className="component-value">{val}/20</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(val / 20) * 100}%`,
                      background: lastScore.color_hex,
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
      className="score-block"
      style={{ borderTopColor: colorHex || 'var(--line)' }}
    >
      <div className="score-block-label">{label}</div>
      <div className="score-block-value">
        {score !== null ? score : '—'}
      </div>
    </div>
  );
}
