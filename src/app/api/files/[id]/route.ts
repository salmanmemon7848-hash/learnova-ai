import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeString } from '@/lib/validation';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;

    // SECURITY: Sanitize route parameter before database queries.
    // OWASP Reference: A03:2021 Injection
    const id = sanitizeString(rawId, 128);

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!id) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('saved_files')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id); // RLS double-check

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ File Delete Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to delete file.' }, { status: 500 });
  }
}
