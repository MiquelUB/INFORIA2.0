import { useState, useEffect } from 'react';

export interface PatientReport {
  id: string;
  title?: string;
  content?: string;
  report_type?: string;
  input_type?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  google_drive_file_id?: string;
  audio_transcription?: string;
}

export interface PatientPayment {
  id: number;
  date: string;
  amount: string;
  status: string;
  method: string;
  concept: string;
}

export function usePatientReportsAndPayments(patientId: string) {
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [payments, setPayments] = useState<PatientPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch reports
        const reportsResponse = await fetch(
          `/api/get-patient-reports?patientId=${patientId}`
        );
        if (!reportsResponse.ok) {
          throw new Error('Failed to fetch reports');
        }
        const reportsData = await reportsResponse.json();
        setReports(reportsData.data || []);

        // Fetch payments
        const paymentsResponse = await fetch(
          `/api/get-patient-payments?patientId=${patientId}`
        );
        if (!paymentsResponse.ok) {
          throw new Error('Failed to fetch payments');
        }
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  return { reports, payments, loading, error };
}
