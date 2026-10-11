/**
 * DocuMatch AI - Supabase Client Manager
 * Configured securely through developer environment variables:
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function initializeClient(): SupabaseClient | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const isPlaceholder = url.includes('your-project') || anonKey.includes('your-anon-key');

  if (url && anonKey && url.startsWith('http') && !isPlaceholder) {
    try {
      supabaseInstance = createClient(url.trim(), anonKey.trim(), {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      supabaseInstance = null;
      return null;
    }
  }

  supabaseInstance = null;
  return null;
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    supabaseInstance = initializeClient();
  }
  return supabaseInstance;
}

// Initial initialization
initializeClient();
