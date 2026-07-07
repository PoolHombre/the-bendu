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

interface Props {
  userId: string;
  onBack: () => void;
  onMagnifier: () => void;
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
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <button onClick={onBack} style={linkBtnStyle}>
        &larr; Back
      </button>

      <h2 style={{ marginBottom: 16 }}>Codex</h2>

      <section style={{ marginBottom: 32 }}>
        <h3>How Assessment Works</h3>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>
          Each claim is assessed for communication clarity across five dimensions
          (0-20 each): Specificity, Evidence, Assumptions, Consistency, and
          Precision. The total gives your clarity score (0-100). The Bendu does not
          judge truth, morality, or political correctness — only how clearly a claim
          is expressed.
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
          {Object.entries(COLOR_MAP).map(([label, { hex }]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: hex,
                  display: 'inline-block',
                }}
              />
              {label}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: '#888' }}>
          Red: 0-20 | Orange: 21-40 | Yellow: 41-60 | Green: 61-80 | Blue: 81-100
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h3>Archive — 30 Days</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: '#888' }}>No scores yet.</p>
        )}
      </section>

      {selected && (
        <section style={{ marginBottom: 32 }}>
          <h3>
            Component Breakdown
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: selected.color_hex,
                marginLeft: 8,
                verticalAlign: 'middle',
              }}
            />
          </h3>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
            &ldquo;{selected.post_text.slice(0, 120)}
            {selected.post_text.length > 120 ? '...' : ''}&rdquo;
          </p>

          {selected.component_scores &&
            Object.entries(selected.component_scores).map(([key, val]) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                  }}
                >
                  <span style={{ textTransform: 'capitalize' }}>{key}</span>
                  <span>{val as number}/20</span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: '#eee',
                    borderRadius: 3,
                  }}
                >
                  <div
                    style={{
                      height: 6,
                      width: `${((val as number) / 20) * 100}%`,
                      background: selected.color_hex,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          <p style={{ fontSize: 13, color: '#555', marginTop: 12 }}>
            {selected.explanation}
          </p>
        </section>
      )}

      {scores.length > 1 && (
        <section style={{ marginBottom: 32 }}>
          <h3>Recent Assessments</h3>
          {scores
            .slice()
            .reverse()
            .slice(0, 10)
            .map((s) => (
              <div
                key={s.id}
                onClick={() => setSelected(s)}
                style={{
                  padding: '8px 12px',
                  marginBottom: 4,
                  border: '1px solid #eee',
                  borderRadius: 4,
                  cursor: 'pointer',
                  borderLeft: `4px solid ${s.color_hex}`,
                  background: selected?.id === s.id ? '#f9f9f9' : 'white',
                  fontSize: 13,
                }}
              >
                <strong>{s.score}/100</strong> &mdash;{' '}
                {s.post_text.slice(0, 60)}
                {s.post_text.length > 60 ? '...' : ''}
              </div>
            ))}
        </section>
      )}

      <button onClick={onMagnifier} style={primaryBtnStyle}>
        Open Mirror
      </button>
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

const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: '#3B82F6',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
};
