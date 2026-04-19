import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { sql } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role: 'buyer' | 'seller' | 'both';
  };

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Format email tidak valid' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${passwordHash}, ${role})
      RETURNING id, name, email, role, avatar, created_at
    `;

    // Create a session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await sql`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (${sessionToken}, ${user.id}, ${expiresAt.toISOString()})
    `;

    res.setHeader(
      'Set-Cookie',
      `session=${sessionToken}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`
    );

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isLoggedIn: true,
      },
    });
  } catch (error) {
    console.error('[register]', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}
