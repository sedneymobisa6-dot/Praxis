import { createClient } from '@supabase/supabase-js';

/**
 * Service role Supabase client.
 * Bypasses Row Level Security. Only use it in server side code
 * that has already verified the caller is a platform admin.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}