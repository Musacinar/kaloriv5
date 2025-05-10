/*
  # Add user-specific food tracking

  1. New Tables
    - `user_foods`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `food_id` (uuid, references yemekler)
      - `amount` (float)
      - `calories` (integer)
      - `date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for user access
*/

CREATE TABLE IF NOT EXISTS user_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  food_id uuid REFERENCES yemekler NOT NULL,
  amount float NOT NULL,
  calories integer NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_foods ENABLE ROW LEVEL SECURITY;

-- Users can read their own food entries
CREATE POLICY "Users can read own food entries"
  ON user_foods
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own food entries
CREATE POLICY "Users can insert own food entries"
  ON user_foods
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own food entries
CREATE POLICY "Users can update own food entries"
  ON user_foods
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own food entries
CREATE POLICY "Users can delete own food entries"
  ON user_foods
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);