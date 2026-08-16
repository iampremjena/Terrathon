import { createClient } from '@supabase/supabase-js';

// Sanitize inputs to prevent malformed API endpoints
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Remove trailing slashes and unintended subpaths
export const supabaseUrl = rawUrl
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/auth\/v1$/, '')
  .replace(/\/rest\/v1$/, '');

// Remove surrounding quotes or spaces
export const supabaseAnonKey = rawKey.trim().replace(/^["']|["']$/g, '');

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);