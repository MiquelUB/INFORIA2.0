// API endpoint to get occupied appointment slots for a specific date
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Expects format "YYYY-MM-DD"

    if (!date) {
      return new Response(JSON.stringify({ error: 'Falta parámetro de fecha' }), { status: 400 });
    }

    // Query appointment times for that day and user
    const { data: slots, error } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('user_id', user.id)
      .eq('appointment_date', date);

    if (error) {
      throw error;
    }

    // Map response to return only an array of strings (e.g., ["09:00", "11:30"])
    const occupiedSlots = slots.map(slot => 
      slot.appointment_time.substring(0, 5) // "09:00:00" -> "09:00"
    );

    return new Response(JSON.stringify(occupiedSlots), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Error interno del servidor';
    return new Response(JSON.stringify({ error: errorMsg }), { status: 500 });
  }
}
