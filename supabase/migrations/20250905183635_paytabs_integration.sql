-- Enable pgcrypto if missing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- payments table (if not already present)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  provider text NOT NULL, -- e.g. paytabs
  provider_payment_id text, -- paytabs 'payment_reference' or transaction id
  amount_bigint bigint NOT NULL, -- in minor units (halalas/cents)
  currency text NOT NULL DEFAULT 'SAR',
  status text NOT NULL DEFAULT 'pending', -- pending, succeeded, failed
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_pid_idx ON payments (provider, provider_payment_id);

-- transactions table (ledger)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL, -- purchase, gift_send, gift_receive, payout, fee
  amount_bigint bigint NOT NULL,
  currency text NOT NULL DEFAULT 'SAR',
  related_payment_id uuid REFERENCES payments(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions (user_id);

-- Add coins column to profiles if missing (stores user's coin balance in minor units)
-- Note: This will be added when profiles table is created
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins bigint DEFAULT 0;

-- RLS: if you use RLS enablement adapt. (If RLS is enabled in your project, add/adjust policies as needed)
-- (Not enabling RLS by default here to avoid unexpected lockouts.)

-- Done SQL.
