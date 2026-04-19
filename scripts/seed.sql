-- Seed users (demo sellers)
-- password_hash is a placeholder (real users register via /api/auth/register)
INSERT INTO users (id, name, email, password_hash, role, rating, review_count, is_verified) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Akun Resmi',       'seller1@buymail.id', '$2a$12$placeholder000000000000000000000000000000000000000000000', 'seller', 4.8, 127, true),
  ('00000000-0000-0000-0000-000000000002', 'Email Terpercaya', 'seller2@buymail.id', '$2a$12$placeholder000000000000000000000000000000000000000000000', 'seller', 4.6, 89,  true),
  ('00000000-0000-0000-0000-000000000003', 'Starter Pack',     'seller3@buymail.id', '$2a$12$placeholder000000000000000000000000000000000000000000000', 'seller', 4.4, 56,  true),
  ('00000000-0000-0000-0000-000000000004', 'BulkMail Pro',     'seller4@buymail.id', '$2a$12$placeholder000000000000000000000000000000000000000000000', 'seller', 4.9, 312, true),
  ('00000000-0000-0000-0000-000000000005', 'DigitalAcc',       'seller5@buymail.id', '$2a$12$placeholder000000000000000000000000000000000000000000000', 'seller', 4.3, 74,  true),
  ('00000000-0000-0000-0000-000000000006', 'TopSeller ID',     'seller6@buymail.id', '$2a$12$placeholder000000000000000000000000000000000000000000000', 'seller', 4.7, 201, true)
ON CONFLICT (email) DO NOTHING;

-- Seed 220 email listings using generate_series
INSERT INTO email_listings (
  seller_id,
  address,
  provider,
  age_label,
  price,
  description,
  phone_verified,
  recovery_verified,
  two_fa_verified,
  warranty,
  status
)
SELECT
  CASE (n % 6)
    WHEN 0 THEN '00000000-0000-0000-0000-000000000001'::uuid
    WHEN 1 THEN '00000000-0000-0000-0000-000000000002'::uuid
    WHEN 2 THEN '00000000-0000-0000-0000-000000000003'::uuid
    WHEN 3 THEN '00000000-0000-0000-0000-000000000004'::uuid
    WHEN 4 THEN '00000000-0000-0000-0000-000000000005'::uuid
    ELSE        '00000000-0000-0000-0000-000000000006'::uuid
  END AS seller_id,

  CASE ((n + n/3) % 4)
    WHEN 0 THEN 'premium.' || ((n*17+3) % 999) || '***@gmail.com'
    WHEN 1 THEN 'business.' || ((n*13+5) % 999) || '***@outlook.com'
    WHEN 2 THEN 'marketing.' || ((n*11+7) % 999) || '***@yahoo.com'
    ELSE        'agency.' || ((n*19+2) % 999) || '***@mycompany.id'
  END AS address,

  CASE ((n + n/3) % 4)
    WHEN 0 THEN 'gmail'
    WHEN 1 THEN 'outlook'
    WHEN 2 THEN 'yahoo'
    ELSE        'custom'
  END AS provider,

  CASE (n % 9)
    WHEN 0 THEN '1 tahun'
    WHEN 1 THEN '2 tahun'
    WHEN 2 THEN '3 tahun'
    WHEN 3 THEN '4 tahun'
    WHEN 4 THEN '5 tahun'
    WHEN 5 THEN '6 tahun'
    WHEN 6 THEN '1 tahun 6 bulan'
    WHEN 7 THEN '2 tahun 8 bulan'
    ELSE        '3 tahun 4 bulan'
  END AS age_label,

  CASE ((n + n/3) % 4)
    WHEN 0 THEN 45000  + ((n * 7919) % 80000)
    WHEN 1 THEN 80000  + ((n * 7919) % 80000)
    WHEN 2 THEN 120000 + ((n * 7919) % 80000)
    ELSE        200000 + ((n * 7919) % 80000)
  END AS price,

  CASE (n % 8)
    WHEN 0 THEN 'Akun bersih tanpa riwayat spam, siap pakai untuk bisnis.'
    WHEN 1 THEN 'Verified lengkap, cocok untuk marketing campaign profesional.'
    WHEN 2 THEN 'Aged account dengan deliverability tinggi, clean history.'
    WHEN 3 THEN 'Full verifikasi, recovery aktif, perfect untuk B2B outreach.'
    WHEN 4 THEN 'Akun premium dengan history bersih, siap digunakan.'
    WHEN 5 THEN 'Terverifikasi phone & 2FA, cocok untuk operasional bisnis.'
    WHEN 6 THEN 'Gmail lama dengan reputasi baik, clean dari spam filter.'
    ELSE        'Outlook business class, full security features enabled.'
  END AS description,

  (n % 3 <> 0) AS phone_verified,
  (n % 4 <> 1) AS recovery_verified,
  (n % 5 = 0)  AS two_fa_verified,

  CASE (n % 4)
    WHEN 0 THEN '3 hari'
    WHEN 1 THEN '7 hari'
    WHEN 2 THEN '14 hari'
    ELSE        '30 hari'
  END AS warranty,

  'active' AS status

FROM generate_series(1, 220) AS n;
