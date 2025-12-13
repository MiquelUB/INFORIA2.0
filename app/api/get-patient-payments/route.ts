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

    // Para pagos, podríamos obtenerlos de una tabla de pagos/invoices
    // De momento retornamos array vacío ya que no hay tabla de pagos
    // TODO: Implementar tabla de pagos/invoices cuando esté disponible
    
    // Si tenemos tabla de pagos, sería así:
    // const { data: payments, error: paymentsError } = await supabase
    //   .from('payments')
    //   .select('*')
    //   .eq('patient_id', patientId)
    //   .eq('user_id', user.id)
    //   .order('payment_date', { ascending: false });

    // Por ahora retornamos datos vacíos
    return NextResponse.json({
      data: [],
      count: 0,
      message: 'Payment system not yet implemented'
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
