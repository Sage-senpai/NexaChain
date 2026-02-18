-- Run this in your Supabase SQL Editor
-- Adds account_status column to profiles table

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active'
  CHECK (account_status IN ('active', 'deactivated'));

-- Backfill all existing users as active
UPDATE profiles SET account_status = 'active' WHERE account_status IS NULL;
