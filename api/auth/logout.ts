import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookieHeader = req.headers.cookie || '';
  const sessionToken = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('session='))
    ?.split('=')[1];

  if (sessionToken) {
    try {
      await sql`DELETE FROM sessions WHERE token = ${sessionToken}`;
    } catch (error) {
      console.error('[logout]', error);
    }
  }

  res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0');
  return res.status(200).json({ success: true });
}
