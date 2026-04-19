import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { sql } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password harus diisi' });
  }

  try {
    const [user] = await sql`
      SELECT id, name, email, password_hash, role, avatar_url
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const valid = await bcrypt.compare(password, user.password_hash as string);
    if (!valid) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (${sessionToken}, ${user.id}, ${expiresAt.toISOString()})
    `;

    res.setHeader(
      'Set-Cookie',
      `session=${sessionToken}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`
    );

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar_url,
        isLoggedIn: true,
      },
    });
  } catch (error) {
    console.error('[login]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
