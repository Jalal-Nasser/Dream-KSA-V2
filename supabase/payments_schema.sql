-- Enable pgcrypto if missing for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Payments table (stores raw provider info)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  provider text NOT NULL, -- e.g. stripe, stc_pay
  provider_payment_id text, -- provider's id (payment_intent / invoice)
  amount_bigint bigint NOT NULL, -- amount in minor units (e.g. halalas / cents)
  currency text NOT NULL DEFAULT 'SAR',
  status text NOT NULL DEFAULT 'pending', -- pending, succeeded, failed
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments (user_id);
CREATE INDEX IF NOT EXISTS payments_provider_pid_idx ON payments (provider, provider_payment_id);

-- Transactions table (app-level ledger for coins/gifts)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type text NOT NULL, -- purchase, gift_send, gift_receive, payout, fee
  amount_bigint bigint NOT NULL,
  currency text NOT NULL DEFAULT 'SAR',
  related_payment_id uuid REFERENCES payments(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions (user_id);

-- RLS: restrict inserts so only owner (authenticated user) can insert their rows
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_insert_authenticated ON payments
  FOR INSERT
  USING ( auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL) )
  WITH CHECK ( auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL) );

CREATE POLICY payments_select_authenticated ON payments
  FOR SELECT
  USING ( auth.uid() IS NOT NULL AND (user_id = auth.uid() OR (exists(select 1 from users where id = auth.uid() and /* add admin flag check if needed */ true))) );

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY transactions_insert_authenticated ON transactions
  FOR INSERT
  USING ( auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL) )
  WITH CHECK ( auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL) );

CREATE POLICY transactions_select_authenticated ON transactions
  FOR SELECT
  USING ( auth.uid() IS NOT NULL AND (user_id = auth.uid() OR /* allow admins to view all - implement admin flag later */ false) );

-- Note: adapt admin checks to your profiles table boolean (is_admin or role).
