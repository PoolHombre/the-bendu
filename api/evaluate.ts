import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function scoreToColor(score: number): { label: string; hex: string } {
  if (score <= 20) return { label: 'Red', hex: '#D32F3A' };
  if (score <= 40) return { label: 'Orange', hex: '#C9760E' };
  if (score <= 60) return { label: 'Yellow', hex: '#B8960A' };
  if (score <= 80) return { label: 'Green', hex: '#168A5E' };
  return { label: 'Blue', hex: '#0B85A8' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, post_text, save = true } = req.body;
  if (!user_id || !post_text) {
    return res.status(400).json({ error: 'user_id and post_text required' });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      system: `You are The Bendu, a clarity and reasoning evaluator.
You do not judge whether the user is morally right, politically correct, or factually omniscient.
You evaluate whether the submitted claim is clear, specific, supported, qualified, internally consistent, and aware of rebuttals.
Score only the submitted text.
Do not compare the user to other users.
Do not infer private traits.
Return structured JSON only.`,
      messages: [
        {
          role: 'user',
          content: `Score this claim on communication clarity (0-100). Evaluate each component on a 0-20 scale:
- Specificity (0-20): Are there numbers, dates, names, or concrete details?
- Evidence (0-20): Is data or are sources cited?
- Assumptions (0-20): Are assumptions stated explicitly?
- Consistency (0-20): Are there internal contradictions?
- Precision (0-20): Are appropriate qualifiers used?

Return ONLY valid JSON, no markdown:
{"score": number, "components": {"specificity": number, "evidence": number, "assumptions": number, "consistency": number, "precision": number}, "explanation": "string"}

Claim to assess:
"${post_text.replace(/"/g, '\\"')}"`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    let text = textBlock && textBlock.type === 'text' ? textBlock.text : '';
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/g, '').trim();
    const result = JSON.parse(text);
    const color = scoreToColor(result.score);

    let id: string | null = null;
    if (save) {
      const { data, error } = await supabase
        .from('clarity_scores')
        .insert({
          user_id,
          post_text,
          score: result.score,
          color: color.label,
          color_hex: color.hex,
          component_scores: result.components,
          explanation: result.explanation,
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      id = data.id;
    }

    return res.status(200).json({
      id,
      score: result.score,
      color: color.label,
      color_hex: color.hex,
      components: result.components,
      explanation: result.explanation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
