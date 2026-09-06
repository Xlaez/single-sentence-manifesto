-- ==============================================================================
-- THE SINGLE-SENTENCE MANIFESTO — PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chapter_number INT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  closed_by_handle TEXT,
  total_words INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chapters_active ON chapters (is_closed);
CREATE INDEX IF NOT EXISTS idx_chapters_number ON chapters (chapter_number DESC);

-- 3. WORDS TABLE
CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  word_text TEXT NOT NULL,
  word_index INT NOT NULL,
  author_handle TEXT NOT NULL,
  author_url TEXT,
  modifier_type TEXT NOT NULL DEFAULT 'standard',
  original_word_text TEXT,
  fire_reactions INT NOT NULL DEFAULT 0,
  skull_reactions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_words_chapter_index ON words (chapter_id, word_index ASC);
CREATE INDEX IF NOT EXISTS idx_words_author ON words (author_handle);

-- 4. TRANSACTIONS AUDIT LEDGER
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reference TEXT UNIQUE NOT NULL,
  amount INT NOT NULL, -- in subunits (kobo for NGN, cents for USD)
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'NGN')),
  status TEXT NOT NULL CHECK (status IN ('initialized', 'success', 'failed')),
  payer_email TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  word_text TEXT NOT NULL,
  modifier_type TEXT NOT NULL,
  target_word_id TEXT,
  gateway_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_transactions_ref ON transactions (reference);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status);
CREATE INDEX IF NOT EXISTS idx_transactions_author ON transactions (author_handle);

-- 5. ATOMIC REACTION INCREMENT FUNCTIONS
CREATE OR REPLACE FUNCTION increment_word_reaction(
  p_word_id TEXT,
  p_reaction_type TEXT
)
RETURNS VOID AS $$
BEGIN
  IF p_reaction_type = 'fire' THEN
    UPDATE words SET fire_reactions = fire_reactions + 1 WHERE id = p_word_id;
  ELSIF p_reaction_type = 'skull' THEN
    UPDATE words SET skull_reactions = skull_reactions + 1 WHERE id = p_word_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Public can read chapters and words
CREATE POLICY "Public read chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "Public read words" ON words FOR SELECT USING (true);
-- Service role full access
CREATE POLICY "Service role full chapters" ON chapters FOR ALL USING (true);
CREATE POLICY "Service role full words" ON words FOR ALL USING (true);
CREATE POLICY "Service role full transactions" ON transactions FOR ALL USING (true);

-- 7. SEED DATA FOR CHAPTER 1 (If not already initialized)
INSERT INTO chapters (id, chapter_number, title, is_closed, total_words, created_at)
VALUES (
  'chap-1',
  1,
  'Chapter I: The First Words of the Hivemind',
  false,
  7,
  NOW() - INTERVAL '1 hour'
)
ON CONFLICT (chapter_number) DO NOTHING;

INSERT INTO words (id, chapter_id, word_text, word_index, author_handle, author_url, modifier_type, fire_reactions, skull_reactions, created_at)
VALUES
  ('w-1', 'chap-1', 'In', 1, 'genesis_agent', 'https://x.com', 'standard', 14, 0, NOW() - INTERVAL '58 minutes'),
  ('w-2', 'chap-1', 'the', 2, 'cyber_scribe', null, 'standard', 5, 1, NOW() - INTERVAL '56 minutes'),
  ('w-3', 'chap-1', 'beginning', 3, 'philosopher_x', null, 'standard', 9, 0, NOW() - INTERVAL '54 minutes'),
  ('w-4', 'chap-1', 'the', 4, 'pixel_tycoon', null, 'standard', 3, 0, NOW() - INTERVAL '52 minutes'),
  ('w-5', 'chap-1', 'INTERNET', 5, 'loud_keyboard', null, 'scream', 27, 2, NOW() - INTERVAL '50 minutes'),
  ('w-6', 'chap-1', 'demanded', 6, 'shitpost_daily', null, 'standard', 12, 1, NOW() - INTERVAL '48 minutes'),
  ('w-7', 'chap-1', 'chaos', 7, 'anarchy_dev', null, 'standard', 42, 3, NOW() - INTERVAL '46 minutes')
ON CONFLICT (id) DO NOTHING;
