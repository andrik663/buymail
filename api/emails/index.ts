import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = neon(process.env.DATABASE_URL!);

  if (req.method === 'GET') {
    try {
      const {
        provider,
        min_price,
        max_price,
        sort = 'price_asc',
        page = '1',
        limit = '50',
        search = '',
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      const orderBy =
        sort === 'price_desc' ? 'el.price DESC' :
        sort === 'newest'     ? 'el.created_at DESC' :
        sort === 'rating'     ? 'seller_rating DESC' :
        'el.price ASC';

      // Build WHERE clauses
      const params: (string | number)[] = ['active'];
      let paramIdx = 2;
      const whereClauses: string[] = ['el.status = $1'];

      if (provider && provider !== 'all') {
        whereClauses.push(`el.provider = $${paramIdx++}`);
        params.push(provider);
      }
      if (min_price) {
        whereClauses.push(`el.price >= $${paramIdx++}`);
        params.push(parseInt(min_price));
      }
      if (max_price) {
        whereClauses.push(`el.price <= $${paramIdx++}`);
        params.push(parseInt(max_price));
      }
      if (search) {
        whereClauses.push(`(el.address ILIKE $${paramIdx} OR u.name ILIKE $${paramIdx})`);
        params.push(`%${search}%`);
        paramIdx++;
      }

      const whereStr = whereClauses.join(' AND ');

      const limitIdx = paramIdx;
      const offsetIdx = paramIdx + 1;
      params.push(limitNum, offset);

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
        warranty: row.warranty as string ?? '7 hari',
        imageCount: 1,
      }));

      return res.status(200).json({ emails, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
      console.error('[emails GET]', error);
      return res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
  }

  if (req.method === 'POST') {
    const cookieHeader = req.headers.cookie || '';
    const sessionToken = cookieHeader
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('session='))
      ?.split('=')[1];

    if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const sessions = await db(
        `SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW() LIMIT 1`,
        [sessionToken]
      );
      if (!sessions.length) return res.status(401).json({ error: 'Session expired' });

      const { address, provider, age_label, price, description, phone_verified, recovery_verified, two_fa_verified, warranty } = req.body;
      const userId = sessions[0].user_id;

      const rows = await db(
        `INSERT INTO email_listings
          (seller_id, address, provider, age_label, price, description, phone_verified, recovery_verified, two_fa_verified, warranty)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [userId, address, provider, age_label, price, description, phone_verified, recovery_verified, two_fa_verified, warranty]
      );

      return res.status(201).json({ id: rows[0].id });
    } catch (error) {
      console.error('[emails POST]', error);
      return res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
