const { createClient } = require('@supabase/supabase-js');

// Trim env vars so stray whitespace in .env does not break auth signatures
const url = (process.env.SUPABASE_URL || '').trim();
const anon = (process.env.SUPABASE_ANON_KEY || '').trim();

// Crash early if service is misconfigured instead of failing later per request
if (!url || !anon) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
}

// Shared supabase-js client with non-persistent sessions (server-side usage only)
const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});

module.exports = { supabase };
