import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BENDU_IDENTITY = `You are The Bendu, a clarity and reasoning evaluator.
You do not judge whether the user is morally right, politically correct, or factually omniscient.
You evaluate whether the submitted claim is clear, specific, supported, qualified, internally consistent, and aware of rebuttals.
Do not compare the user to other users. Do not infer private traits.`;

const TOULMIN_PROMPT = `${BENDU_IDENTITY}

Guide the user through analyzing their claim using the Toulmin model. Ask ONE question at a time in this sequence:
1. "What exactly are you claiming?" (claim)
2. "What evidence supports this?" (data/grounds)
3. "Why does that evidence support the claim?" (warrant)
4. "Why should we trust that warrant?" (backing)
5. "How certain are you? What qualifiers apply?" (qualifier)
6. "What would prove you wrong?" (rebuttal)
After each answer, give brief feedback on the clarity strength of their response before asking the next question. At the end, summarize the argument's clarity strengths and gaps, then close with a section headed "## Revised Claim" containing a single rewritten version of the user's claim that incorporates what the conversation surfaced: the scope and qualifiers they settled on, the evidence they actually have, and awareness of the rebuttal conditions. Write it in the user's voice, as a claim they could state directly — not a description of the claim. Keep it to one to three sentences.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { claim, conversation_history } = req.body;
  if (!claim) {
    return res.status(400).json({ error: 'claim required' });
  }

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: `My claim is: "${claim}"` },
  ];

  if (conversation_history && conversation_history.length > 0) {
    for (const msg of conversation_history) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      system: TOULMIN_PROMPT,
      messages,
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    const text = textBlock && textBlock.type === 'text' ? textBlock.text : '';

    if (!text) {
      return res.status(502).json({ error: 'Model returned no text' });
    }

    return res.status(200).json({
      response: text,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}
