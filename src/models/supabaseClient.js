const { createClient } = require('@supabase/supabase-js');

const url  = (process.env.SUPABASE_URL || '').trim();
const anon = (process.env.SUPABASE_ANON_KEY || '').trim();

if (!url || !anon) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
}

const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});

module.exports = { supabase };
