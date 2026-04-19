import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookieHeader = req.headers.cookie || '';
  const sessionToken = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('session='))
    ?.split('=')[1];

  if (!sessionToken) {
    return res.status(401).json({ user: null });
  }

  try {
    const [row] = await sql`
      SELECT u.id, u.name, u.email, u.role, u.avatar_url
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ${sessionToken}
        AND s.expires_at > NOW()
      LIMIT 1
    `;

    if (!row) {
      return res.status(401).json({ user: null });
    }

    return res.status(200).json({
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        avatar: row.avatar_url,
        isLoggedIn: true,
      },
    });
  } catch (error) {
    console.error('[me]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
