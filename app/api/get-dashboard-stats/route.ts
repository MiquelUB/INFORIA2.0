import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch dashboard stats
    const [patientsData, reportsData, appointmentsData] = await Promise.all([
      supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('appointment_date', new Date().toISOString().split('T')[0])
    ]);

    // Fetch recent reports with patient info
    const { data: recentReports, error: recentError } = await supabase
      .from('reports')
      .select(`
        id,
        title,
        report_type,
        status,
        created_at,
        patients(name, id)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Error fetching recent reports:', recentError);
    }

    return NextResponse.json({
      stats: {
        totalPatients: patientsData.count || 0,
        totalReports: reportsData.count || 0,
        upcomingAppointments: appointmentsData.count || 0,
      },
      recentReports: recentReports || [],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
