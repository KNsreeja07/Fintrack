/*
  # Finance Dashboard - Transactions Table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key) - Unique transaction identifier
      - `date` (date) - Transaction date
      - `description` (text) - Transaction description
      - `category` (text) - Transaction category (e.g., Food, Transport, Salary)
      - `amount` (decimal) - Transaction amount
      - `type` (text) - Transaction type (income or expense)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to read all transactions
    - Add policy for authenticated users to insert transactions
    - Add policy for authenticated users to update transactions
    - Add policy for authenticated users to delete transactions

  Note: In production, you would want more granular permissions,
  but for this demo, all authenticated users can manage transactions.
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  category text NOT NULL,
  amount decimal(12, 2) NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);