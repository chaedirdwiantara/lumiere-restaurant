import { createClient } from '@supabase/supabase-js';
import { config } from '.';

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create Supabase client with anon key for client-side operations
export const supabaseAnon = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

export default supabase;