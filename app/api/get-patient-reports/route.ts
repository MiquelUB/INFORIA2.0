import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch reports for the patient (RLS will filter by user_id automatically)
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select(`
        id,
        title,
        content,
        report_type,
        input_type,
        status,
        created_at,
        updated_at,
        google_drive_file_id,
        audio_transcription
      `)
      .eq('patient_id', patientId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: reports || [],
      count: reports?.length || 0
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
