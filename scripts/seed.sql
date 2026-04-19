-- Seed users (demo sellers)
INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Akun Resmi',       'seller1@buymail.id', '$2a$12$demohashdemohashdemoha1uQJ0g0EW8KVtWFqBmT0MO1wUj5IVn.', 'seller'),
  ('00000000-0000-0000-0000-000000000002', 'Email Terpercaya', 'seller2@buymail.id', '$2a$12$demohashdemohashdemoha1uQJ0g0EW8KVtWFqBmT0MO1wUj5IVn.', 'seller'),
  ('00000000-0000-0000-0000-000000000003', 'Starter Pack',     'seller3@buymail.id', '$2a$12$demohashdemohashdemoha1uQJ0g0EW8KVtWFqBmT0MO1wUj5IVn.', 'seller'),
  ('00000000-0000-0000-0000-000000000004', 'BulkMail Pro',     'seller4@buymail.id', '$2a$12$demohashdemohashdemoha1uQJ0g0EW8KVtWFqBmT0MO1wUj5IVn.', 'seller'),
  ('00000000-0000-0000-0000-000000000005', 'DigitalAcc',       'seller5@buymail.id', '$2a$12$demohashdemohashdemoha1uQJ0g0EW8KVtWFqBmT0MO1wUj5IVn.', 'seller'),
  ('00000000-0000-0000-0000-000000000006', 'TopSeller ID',     'seller6@buymail.id', '$2a$12$demohashdemohashdemoha1uQJ0g0EW8KVtWFqBmT0MO1wUj5IVn.', 'seller')
ON CONFLICT (email) DO NOTHING;

-- Seed reviews to establish seller ratings
INSERT INTO reviews (listing_id, buyer_id, seller_id, rating, comment)
SELECT
  NULL,
  '00000000-0000-0000-0000-000000000001',
  s.id,
  CASE s.email
    WHEN 'seller1@buymail.id' THEN 5
    WHEN 'seller2@buymail.id' THEN 4
    WHEN 'seller3@buymail.id' THEN 4
    WHEN 'seller4@buymail.id' THEN 5
    WHEN 'seller5@buymail.id' THEN 4
    WHEN 'seller6@buymail.id' THEN 5
  END,
  'Penjual terpercaya'
FROM users s
WHERE s.role = 'seller'
ON CONFLICT DO NOTHING;

-- Seed email listings (220 entries covering all providers)
INSERT INTO email_listings (seller_id, masked_address, provider, age_label, price, description, verified_phone, verified_recovery, verified_2fa, warranty_days, status)
SELECT
  seller_id,
  masked_address,
  provider::email_provider,
  age_label,
  price,
  description,
  verified_phone,
  verified_recovery,
  verified_2fa,
  warranty_days,
  'active'
FROM (
  SELECT
    CASE (n % 6)
      WHEN 0 THEN '00000000-0000-0000-0000-000000000001'::uuid
      WHEN 1 THEN '00000000-0000-0000-0000-000000000002'::uuid
      WHEN 2 THEN '00000000-0000-0000-0000-000000000003'::uuid
      WHEN 3 THEN '00000000-0000-0000-0000-000000000004'::uuid
      WHEN 4 THEN '00000000-0000-0000-0000-000000000005'::uuid
      ELSE        '00000000-0000-0000-0000-000000000006'::uuid
    END AS seller_id,
    CASE (n + n/3) % 4
      WHEN 0 THEN 'premium.' || (n*17+3)%999 || '***@gmail.com'
      WHEN 1 THEN 'business.' || (n*13+5)%999 || '***@outlook.com'
      WHEN 2 THEN 'marketing.' || (n*11+7)%999 || '***@yahoo.com'
      ELSE        'agency.' || (n*19+2)%999 || '***@mycompany.id'
    END AS masked_address,
    CASE (n + n/3) % 4
      WHEN 0 THEN 'gmail'
      WHEN 1 THEN 'outlook'
      WHEN 2 THEN 'yahoo'
      ELSE        'custom'
    END AS provider,
    CASE n % 9
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
    CASE (n + n/3) % 4
      WHEN 0 THEN 45000 + (n*7919 % 80000)
      WHEN 1 THEN 80000 + (n*7919 % 80000)
      WHEN 2 THEN 120000 + (n*7919 % 80000)
      ELSE        200000 + (n*7919 % 80000)
    END AS price,
    CASE n % 8
      WHEN 0 THEN 'Akun bersih tanpa riwayat spam, siap pakai untuk bisnis.'
      WHEN 1 THEN 'Verified lengkap, cocok untuk marketing campaign profesional.'
      WHEN 2 THEN 'Aged account dengan deliverability tinggi, clean history.'
      WHEN 3 THEN 'Full verifikasi, recovery aktif, perfect untuk B2B outreach.'
      WHEN 4 THEN 'Akun premium dengan history bersih, siap digunakan.'
      WHEN 5 THEN 'Terverifikasi phone & 2FA, cocok untuk operasional bisnis.'
      WHEN 6 THEN 'Gmail lama dengan reputasi baik, clean dari spam filter.'
      ELSE        'Outlook business class, full security features enabled.'
    END AS description,
    (n % 3 <> 0) AS verified_phone,
    (n % 4 <> 1) AS verified_recovery,
    (n % 5 = 0)  AS verified_2fa,
    CASE n % 4
      WHEN 0 THEN 3
      WHEN 1 THEN 7
      WHEN 2 THEN 14
      ELSE        30
    END AS warranty_days
  FROM generate_series(1, 220) AS n
) seed_data;
