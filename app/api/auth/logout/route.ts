import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value;

    if (token) {
      const db = getDb();
      await db`DELETE FROM sessions WHERE token = ${token}`;
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('session');
    return response;
  } catch (error) {
    console.error('[logout]', error);
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session');
    return response;
  }
}
