import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';

async function getSession(req: VercelRequest) {
  const cookieHeader = req.headers.cookie || '';
  const token = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('session='))
    ?.split('=')[1];
  if (!token) return null;
  const [row] = await sql`
    SELECT user_id FROM sessions WHERE token = ${token} AND expires_at > NOW() LIMIT 1
  `;
  return row ? (row.user_id as string) : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await getSession(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT c.listing_id, el.address, el.provider, el.price
      FROM cart c
      JOIN email_listings el ON el.id = c.listing_id
      WHERE c.user_id = ${userId}
    `;
    return res.status(200).json({ items: rows });
  }

  if (req.method === 'POST') {
    const { listing_id } = req.body as { listing_id: string };
    await sql`
      INSERT INTO cart (user_id, listing_id)
      VALUES (${userId}, ${listing_id})
      ON CONFLICT (user_id, listing_id) DO NOTHING
    `;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { listing_id } = req.body as { listing_id: string };
    if (listing_id) {
      await sql`DELETE FROM cart WHERE user_id = ${userId} AND listing_id = ${listing_id}`;
    } else {
      await sql`DELETE FROM cart WHERE user_id = ${userId}`;
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
