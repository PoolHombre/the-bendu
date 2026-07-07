export interface ComponentScores {
  specificity: number;
  evidence: number;
  assumptions: number;
  consistency: number;
  precision: number;
}

export interface ClarityScore {
  id: string;
  user_id: string;
  post_text: string;
  score: number;
  color: string;
  color_hex: string;
  component_scores: ComponentScores;
  explanation: string;
  created_at: string;
}

export interface EvaluateResponse {
  score: number;
  color: string;
  color_hex: string;
  components: ComponentScores;
  explanation: string;
  id: string;
}

export interface MagnifierMessage {
  role: 'user' | 'assistant';
  content: string;
}


export const COLOR_MAP: Record<string, { label: string; hex: string }> = {
  Red: { label: 'Red', hex: '#EF4444' },
  Orange: { label: 'Orange', hex: '#F97316' },
  Yellow: { label: 'Yellow', hex: '#EAB308' },
  Green: { label: 'Green', hex: '#22C55E' },
  Blue: { label: 'Blue', hex: '#3B82F6' },
};

export function scoreToColor(score: number): { label: string; hex: string } {
  if (score <= 20) return COLOR_MAP.Red;
  if (score <= 40) return COLOR_MAP.Orange;
  if (score <= 60) return COLOR_MAP.Yellow;
  if (score <= 80) return COLOR_MAP.Green;
  return COLOR_MAP.Blue;
}
