INSERT INTO public.gifts_catalog (title, price_bigint, image_url, metadata)
VALUES
  ('Rose', 10, '🌹', jsonb_build_object('category', 'flowers')),
  ('Heart', 25, '❤️', jsonb_build_object('category', 'love')),
  ('Star', 50, '⭐', jsonb_build_object('category', 'premium')),
  ('Crown', 100, '👑', jsonb_build_object('category', 'luxury')),
  ('Diamond', 250, '', jsonb_build_object('category', 'exclusive')),
  ('Rocket', 500, '🚀', jsonb_build_object('category', 'special')),
  ('Trophy', 1000, '🏆', jsonb_build_object('category', 'elite'))
ON CONFLICT DO NOTHING;
