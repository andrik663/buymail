import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

async function getUserId(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  if (!token) return null;
  const db = getDb();
  const [session] = await db`SELECT user_id FROM sessions WHERE token = ${token} AND expires_at > NOW()`;
  return session?.user_id ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ items: [] });

    const db = getDb();
    const rows = await db`
      SELECT c.listing_id, el.address, el.provider, el.price
      FROM cart c
      JOIN email_listings el ON el.id = c.listing_id
      WHERE c.user_id = ${userId}
    `;

    return NextResponse.json({ items: rows });
  } catch (error) {
    console.error('[cart GET]', error);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { listing_id } = await req.json();
    const db = getDb();

    await db`INSERT INTO cart (user_id, listing_id) VALUES (${userId}, ${listing_id}) ON CONFLICT DO NOTHING`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[cart POST]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { listing_id } = await req.json();
    const db = getDb();

    if (listing_id) {
      await db`DELETE FROM cart WHERE user_id = ${userId} AND listing_id = ${listing_id}`;
    } else {
      await db`DELETE FROM cart WHERE user_id = ${userId}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[cart DELETE]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
