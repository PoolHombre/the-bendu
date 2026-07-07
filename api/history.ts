import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user_id = req.query.user_id as string;
  const days = parseInt(req.query.days as string) || 30;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' });
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('clarity_scores')
    .select('*')
    .eq('user_id', user_id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}
