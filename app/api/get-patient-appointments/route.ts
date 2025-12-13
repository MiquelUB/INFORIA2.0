// Contenido para: app/api/get-patient-appointments/route.ts

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createClient(); // Cliente RLS (para obtener el usuario)

  // Cliente Admin (para saltar RLS en el JOIN)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // <-- Service Role Key para bypass RLS
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // ej: "11"
    const year = searchParams.get('year');   // ej: "2025"

    if (!month || !year) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros mes y año' }), { status: 400 });
    }

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
       return new Response(JSON.stringify({ error: 'Parámetros de fecha inválidos' }), { status: 400 });
    }

    // ---- INICIO DE LA CORRECCIÓN ----
    // Crear las fechas de inicio y fin del mes
    // El mes en JS es 0-indexado, por eso (monthNum - 1)
    const startDate = new Date(yearNum, monthNum - 1, 1);
    // El día 0 del mes siguiente es el último día del mes actual
    const endDate = new Date(yearNum, monthNum, 0);

    // Formatear a YYYY-MM-DD
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    // ---- FIN DE LA CORRECCIÓN ----


    // Consulta a la base de datos usando cliente Admin
    const { data, error } = await supabaseAdmin // <-- CAMBIO: Usar Admin client
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        patients (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .gte('appointment_date', formattedStartDate) // Mayor o igual al primer día del mes
      .lte('appointment_date', formattedEndDate)  // Menor o igual al último día del mes
      .order('appointment_time', { ascending: true }); // Ordenar por hora cronológicamente

    if (error) {
      console.error('Appointments error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Error interno del servidor';
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
