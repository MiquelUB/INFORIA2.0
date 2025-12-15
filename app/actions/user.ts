'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function acceptLegalTerms(version: string = 'v1.0') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      terms_accepted_at: new Date().toISOString(),
      terms_version: version,
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error accepting terms:', error);
    throw new Error('Failed to accept terms');
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
