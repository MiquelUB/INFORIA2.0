// components/workspace/SessionClient.tsx
"use client";

import React from 'react';
import { Patient } from '@/lib/types';
import { Report } from '@/lib/services/database';

interface SessionClientProps {
  patient: Patient | null;
  initialReports: Report[];
}

export default function SessionClient({ patient, initialReports }: SessionClientProps) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {patient ? `Sesión con ${patient.name}` : 'Sesión clínica'}
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>Componente de espacio de trabajo clínico</p>
        <p>Paciente: {patient?.name || 'No seleccionado'}</p>
        <p>Informes iniciales: {initialReports.length}</p>
      </div>
    </div>
  );
}