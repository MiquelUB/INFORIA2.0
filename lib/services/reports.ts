import { createClient } from '@/lib/supabase/client';

export interface GenerateReportRequest {
  patientId: string;
  reportType: 'primera_visita' | 'seguimiento';
  inputType: 'audio' | 'text';
  audioTranscription?: string;
  textNotes?: string;
}

export interface ReportResponse {
  success: boolean;
  report?: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    status: string;
  };
  credits_used?: number;
  credits_remaining?: number;
  error?: string;
}

export interface TranscriptionResponse {
  success: boolean;
  transcription?: string;
  duration?: number;
  error?: string;
}

export class ReportsService {
  /**
   * Transcribe audio file to text using Whisper API
   */
  static async transcribeAudio(audioFile: File): Promise<TranscriptionResponse> {
    const supabase = createClient();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const formData = new FormData();
      formData.append('audio', audioFile);

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: formData,
      });

      if (error) {
        console.error('Error transcribing audio:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Audio transcription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Generate a psychological report using AI
   */
  static async generateReport(request: GenerateReportRequest): Promise<ReportResponse> {
    const supabase = createClient();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: request,
      });

      if (error) {
        console.error('Error generating report:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Report generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Get all reports for the current user
   */
  static async getUserReports() {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          patients:patient_id (
            name,
            birth_date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get reports error:', error);
      throw error;
    }
  }

  /**
   * Get a specific report by ID
   */
  static async getReport(reportId: string) {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          patients:patient_id (
            name,
            birth_date,
            notes
          )
        `)
        .eq('id', reportId)
        .single();

      if (error) {
        console.error('Error fetching report:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get report error:', error);
      throw error;
    }
  }

  /**
   * Delete a report
   */
  static async deleteReport(reportId: string) {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error('Error deleting report:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Delete report error:', error);
      throw error;
    }
  }
}