import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../lib/supabase';
import type { ClarityScore } from '../lib/types';
import { COLOR_MAP } from '../lib/types';
import './DetailPage.css';

interface Props {
  userId: string;
  onBack: () => void;
  onMagnifier: (claim: string) => void;
}

export function DetailPage({ userId, onBack, onMagnifier }: Props) {
  const [scores, setScores] = useState<ClarityScore[]>([]);
  const [selected, setSelected] = useState<ClarityScore | null>(null);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  async function loadHistory() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data } = await supabase
      .from('clarity_scores')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (data) {
      setScores(data);
      if (data.length > 0) setSelected(data[data.length - 1]);
    }
  }

  const chartData = scores.map((s) => ({
    date: new Date(s.created_at).toLocaleDateString(),
    score: s.score,
    color: s.color_hex,
  }));

  return (
    <div>
      <button onClick={onBack} className="btn-link">
        &larr; Back
      </button>

      <h2 className="page-title">Codex</h2>

      <section className="card section">
        <h3 className="section-heading">How Assessment Works</h3>
        <p className="body-text">
          Each claim is assessed for communication clarity across five dimensions
          (0-20 each): Specificity, Evidence, Assumptions, Consistency, and
          Precision. The total gives your clarity score (0-100). The Bendu does not
          judge truth, morality, or political correctness — only how clearly a claim
          is expressed.
        </p>

        <div className="color-legend">
          {Object.entries(COLOR_MAP).map(([label, { hex }]) => (
            <div key={label} className="color-legend-item">
              <span className="color-dot" style={{ background: hex }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className="color-ranges">
          Red: 0-33 | Orange: 33-60 | Yellow: 60-80 | Green: 80-91 | Blue: 91-96
          | Indigo: 96-99 | Violet: 99-100
        </p>
      </section>

      <section className="card section">
        <h3 className="section-heading">Archive — 30 Days</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--ink-3)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--teal)"
                strokeWidth={2}
                dot={{ r: 4, fill: 'var(--teal)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="empty-state">No scores yet.</p>
        )}
      </section>

      {selected && (
        <section className="card section">
          <h3 className="section-heading">
            Component Breakdown
            <span
              className="color-dot"
              style={{ background: selected.color_hex, marginLeft: 8, verticalAlign: 'middle' }}
            />
          </h3>
          <p className="selected-claim">
            &ldquo;{selected.post_text.slice(0, 120)}
            {selected.post_text.length > 120 ? '...' : ''}&rdquo;
          </p>

          {selected.component_scores &&
            Object.entries(selected.component_scores).map(([key, val]) => (
              <div key={key} className="breakdown-row">
                <div className="breakdown-meta">
                  <span className="component-label">{key}</span>
                  <span className="component-value">{val as number}/20</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${((val as number) / 20) * 100}%`,
                      background: selected.color_hex,
                    }}
                  />
                </div>
              </div>
            ))}
          <p className="body-text" style={{ marginTop: 'var(--space-3)' }}>
            {selected.explanation}
          </p>
        </section>
      )}

      {scores.length > 1 && (
        <section className="section">
          <h3 className="section-heading">Recent Assessments</h3>
          <div className="assessment-list">
            {scores
              .slice()
              .reverse()
              .slice(0, 10)
              .map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`assessment-row ${selected?.id === s.id ? 'active' : ''}`}
                  style={{ borderLeftColor: s.color_hex }}
                >
                  <span className="assessment-score">{s.score}/100</span>
                  <span className="assessment-text">
                    {s.post_text.slice(0, 60)}
                    {s.post_text.length > 60 ? '...' : ''}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}

      <button
        onClick={() => onMagnifier(selected?.post_text ?? '')}
        className="btn-primary"
      >
        Open Mirror
      </button>
    </div>
  );
}
