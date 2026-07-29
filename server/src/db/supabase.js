import { createClient } from '@supabase/supabase-js';

// Service role key should ONLY be used on the server side
// Never expose this key to the client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fallback to anon key for development (WARNING: Not recommended for production)
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const keyToUse = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !keyToUse) {
  console.error('Missing Supabase credentials. Check your .env file.');
  if (!supabaseServiceKey) {
    console.warn('WARNING: Using anon key instead of service role key. Admin operations may be restricted by RLS policies.');
  }
}

// Create admin client with service role key for bypassing RLS
export const supabaseAdmin = createClient(supabaseUrl, keyToUse, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Create client with anon key for respecting RLS (when needed)
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey || keyToUse,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
