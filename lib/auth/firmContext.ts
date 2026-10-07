import { createClient } from '@/lib/supabase/server';

export type FirmContext = {
  userId: string;
  userEmail: string | undefined;
  firmId: string;
};

/**
 * Resolves the authenticated user and their firm.
 * Returns null if the user is not signed in or has no firm.
 * Every API route must call this before touching client data.
 */
export async function getFirmContext(): Promise<FirmContext | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: firmUser } = await supabase
    .from('firm_users')
    .select('firm_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!firmUser?.firm_id) return null;

  return {
    userId: user.id,
    userEmail: user.email,
    firmId: firmUser.firm_id,
  };
}