import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { provider, min_price, max_price, sort = 'price_asc', page = '1', limit = '50' } = req.query as Record<string, string>;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      let rows;
      if (provider && provider !== 'all') {
        rows = await sql`
          SELECT
            el.*,
            u.name AS seller_name,
            COALESCE(AVG(r.rating), 0) AS seller_rating,
            COUNT(DISTINCT r.id) AS seller_reviews
          FROM email_listings el
          JOIN users u ON u.id = el.seller_id
          LEFT JOIN reviews r ON r.seller_id = el.seller_id
          WHERE el.status = 'active'
            AND el.provider = ${provider}
            ${min_price ? sql`AND el.price >= ${parseInt(min_price)}` : sql``}
            ${max_price ? sql`AND el.price <= ${parseInt(max_price)}` : sql``}
          GROUP BY el.id, u.name
          ORDER BY ${
            sort === 'price_asc' ? sql`el.price ASC` :
            sort === 'price_desc' ? sql`el.price DESC` :
            sort === 'newest' ? sql`el.created_at DESC` :
            sort === 'rating' ? sql`seller_rating DESC` :
            sql`el.price ASC`
          }
          LIMIT ${parseInt(limit)} OFFSET ${offset}
        `;
      } else {
        rows = await sql`
          SELECT
            el.*,
            u.name AS seller_name,
            COALESCE(AVG(r.rating), 0) AS seller_rating,
            COUNT(DISTINCT r.id) AS seller_reviews
          FROM email_listings el
          JOIN users u ON u.id = el.seller_id
          LEFT JOIN reviews r ON r.seller_id = el.seller_id
          WHERE el.status = 'active'
            ${min_price ? sql`AND el.price >= ${parseInt(min_price)}` : sql``}
            ${max_price ? sql`AND el.price <= ${parseInt(max_price)}` : sql``}
          GROUP BY el.id, u.name
          ORDER BY ${
            sort === 'price_asc' ? sql`el.price ASC` :
            sort === 'price_desc' ? sql`el.price DESC` :
            sort === 'newest' ? sql`el.created_at DESC` :
            sort === 'rating' ? sql`seller_rating DESC` :
            sql`el.price ASC`
          }
          LIMIT ${parseInt(limit)} OFFSET ${offset}
        `;
      }

      const [countRow] = await sql`SELECT COUNT(*) FROM email_listings WHERE status = 'active'`;
      const total = parseInt(countRow.count as string);

      const emails = rows.map(row => ({
        id: String(row.id),
        address: row.masked_address as string,
        provider: row.provider as string,
        age: row.age_label as string,
        price: parseInt(row.price as string),
        description: row.description as string,
        verifications: {
          phone: row.verified_phone as boolean,
          recovery: row.verified_recovery as boolean,
          twoFa: row.verified_2fa as boolean,
        },
        sellerId: String(row.seller_id),
        sellerName: row.seller_name as string,
        sellerRating: parseFloat(row.seller_rating as string),
        sellerReviews: parseInt(row.seller_reviews as string),
        status: row.status as string,
        warranty: row.warranty_days ? `${row.warranty_days} hari` : '7 hari',
        imageCount: 1,
      }));

      return res.status(200).json({ emails, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
      console.error('[emails GET]', error);
      return res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
  }

  if (req.method === 'POST') {
    // Auth check
    const cookieHeader = req.headers.cookie || '';
    const sessionToken = cookieHeader
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('session='))
      ?.split('=')[1];

    if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const [session] = await sql`
        SELECT user_id FROM sessions WHERE token = ${sessionToken} AND expires_at > NOW() LIMIT 1
      `;
      if (!session) return res.status(401).json({ error: 'Session expired' });

      const { masked_address, provider, age_label, price, description, verified_phone, verified_recovery, verified_2fa, warranty_days } = req.body;

      const [listing] = await sql`
        INSERT INTO email_listings
          (seller_id, masked_address, provider, age_label, price, description, verified_phone, verified_recovery, verified_2fa, warranty_days)
        VALUES
          (${session.user_id}, ${masked_address}, ${provider}, ${age_label}, ${price}, ${description}, ${verified_phone}, ${verified_recovery}, ${verified_2fa}, ${warranty_days})
        RETURNING id
      `;

      return res.status(201).json({ id: listing.id });
    } catch (error) {
      console.error('[emails POST]', error);
      return res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
