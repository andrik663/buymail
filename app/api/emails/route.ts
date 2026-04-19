import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider') || '';
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const sort = searchParams.get('sort') || 'price_asc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const orderBy =
      sort === 'price_desc' ? 'el.price DESC' :
      sort === 'newest'     ? 'el.created_at DESC' :
      sort === 'rating'     ? 'u.rating DESC' :
      'el.price ASC';

    // Build WHERE clauses
    const params: (string | number)[] = ['active'];
    let paramIdx = 2;
    const whereClauses: string[] = ['el.status = $1'];

    if (provider && provider !== 'all') {
      whereClauses.push(`el.provider = $${paramIdx++}`);
      params.push(provider);
    }
    if (minPrice) {
      whereClauses.push(`el.price >= $${paramIdx++}`);
      params.push(parseInt(minPrice));
    }
    if (maxPrice) {
      whereClauses.push(`el.price <= $${paramIdx++}`);
      params.push(parseInt(maxPrice));
    }
    if (search) {
      whereClauses.push(`(el.address ILIKE $${paramIdx} OR u.name ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    const whereStr = whereClauses.join(' AND ');
    const limitIdx = paramIdx;
    const offsetIdx = paramIdx + 1;
    params.push(limit, offset);

    const db = getDb();

    const queryStr = `
      SELECT
        el.id, el.address, el.provider, el.age_label, el.price,
        el.description, el.phone_verified, el.recovery_verified,
        el.two_fa_verified, el.seller_id, el.status, el.warranty,
        el.created_at,
        u.name AS seller_name,
        u.rating AS seller_rating,
        u.review_count AS seller_reviews
      FROM email_listings el
      JOIN users u ON u.id = el.seller_id
      WHERE ${whereStr}
      ORDER BY ${orderBy}
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const countStr = `
      SELECT COUNT(*) FROM email_listings el
      JOIN users u ON u.id = el.seller_id
      WHERE ${whereStr}
    `;

    const [rows, countRows] = await Promise.all([
      db(queryStr, params as never[]),
      db(countStr, params.slice(0, -2) as never[]),
    ]);

    const total = parseInt(String(countRows[0].count));

    const emails = rows.map(row => ({
      id: String(row.id),
      address: row.address as string,
      provider: row.provider as string,
      age: row.age_label as string,
      price: parseInt(String(row.price)),
      description: row.description as string,
      verifications: {
        phone: row.phone_verified as boolean,
        recovery: row.recovery_verified as boolean,
        twoFa: row.two_fa_verified as boolean,
      },
      sellerId: String(row.seller_id),
      sellerName: row.seller_name as string,
      sellerRating: parseFloat(String(row.seller_rating ?? 0)),
      sellerReviews: parseInt(String(row.seller_reviews ?? 0)),
      status: row.status as string,
      warranty: (row.warranty as string) ?? '7 hari',
      imageCount: 1,
    }));

    return NextResponse.json({ emails, total, page, limit });
  } catch (error) {
    console.error('[emails GET]', error);
    return NextResponse.json({ emails: [], total: 0, page: 1, limit: 50 });
  }
}
