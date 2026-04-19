import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const db = getDb();

    const [row] = await db`
      SELECT u.id, u.name, u.email, u.role, u.avatar
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `;

    if (!row) {
      const response = NextResponse.json({ user: null });
      response.cookies.delete('session');
      return response;
    }

    return NextResponse.json({
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        avatar: row.avatar,
        isLoggedIn: true,
      },
    });
  } catch (error) {
    console.error('[me]', error);
    return NextResponse.json({ user: null });
  }
}
