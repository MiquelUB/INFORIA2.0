// Ruta: src/services/GoogleSheetsPatientCRMService.ts

interface PatientCRMData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  created_at: string;
  total_reports: number;
  last_report_date?: string;
  payment_status: string;
  total_paid: number;
  next_payment_due?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'discharged';
  drive_folder_url?: string;
}

interface PaymentData {
  date: string;
  patientId: string;
  patientName: string;
  concept: string;
  amount: number;
  paymentMethod: string;
  status: string;
  notes?: string;
}

interface ReportCRMData {
  date: string;
  patientId: string;
  patientName: string;
  reportType: string;
  title: string;
  status: string;
  driveLink: string;
  inputMethod: string;
}

export class GoogleSheetsPatientCRMService {
  private static readonly CRM_SHEET_NAME = 'iNFORiA_CRM_PACIENTES';

  async getOrCreateCRMSheet(token: string | null): Promise<string | null> {
    try {
      if (!token) return null;

      // 1. Buscar sheet existente
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${GoogleSheetsPatientCRMService.CRM_SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (!searchResponse.ok) throw new Error('Error buscando CRM Sheet');
      const searchData = await searchResponse.json();

      if (searchData.files && searchData.files.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ CRM Sheet existente encontrado:', searchData.files[0].id);
        }
        return searchData.files[0].id; // Devuelve el ID del Sheet existente
      }

      // 2. Crear nuevo sheet si no se encuentra
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 No se encontró CRM Sheet. Creando uno nuevo...');
      }
      const createResponse = await fetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: { title: GoogleSheetsPatientCRMService.CRM_SHEET_NAME },
            sheets: [
              { properties: { title: 'Pacientes' } },
              { properties: { title: 'Citas' } },
              { properties: { title: 'Pagos' } },
              { properties: { title: 'Informes' } }
            ]
          })
        }
      );

      if (!createResponse.ok) throw new Error('Error creando CRM Sheet');
      const sheetData = await createResponse.json();
      const sheetId = sheetData.spreadsheetId;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ CRM Sheet nuevo creado:', sheetId);
      }

      // 3. Obtener los IDs reales de las pestañas
      const sheetIds = {
        pacientes: sheetData.sheets[0].properties.sheetId,
        citas: sheetData.sheets[1].properties.sheetId,
        pagos: sheetData.sheets[2].properties.sheetId,
        informes: sheetData.sheets[3].properties.sheetId,
      };

      // 4. Configurar las cabeceras
      await this.setupPatientsSheet(token, sheetId, sheetIds.pacientes);
      await this.setupCitasSheet(token, sheetId, sheetIds.citas);
      await this.setupPaymentsSheet(token, sheetId, sheetIds.pagos);
      await this.setupReportsSheet(token, sheetId, sheetIds.informes);

      return sheetId;
    } catch (err: unknown) {
      console.error('Error gestionando CRM Sheet:', err);
      return null;
    }
  }

  private async setupPatientsSheet(token: string | null, sheetId: string, sheetNumericId: number): Promise<void> {
    if (!token) return;

    const headers = [
      'ID', 'Nombre Completo', 'Email', 'Teléfono', 'Fecha Nacimiento', 
      'Fecha Alta', 'Total Informes', 'Último Informe', 'Estado Pago', 
      'Total Pagado €', 'Próximo Pago', 'Estado Paciente', 'Notas', 'Carpeta Drive'
    ];

    try {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Pacientes!A1:N1?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [headers] })
        }
      );

      // Estilo cabecera
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                repeatCell: {
                  range: { sheetId: sheetNumericId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 14 },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.18, green: 0.25, blue: 0.23 },
                      textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
                    }
                  },
                  fields: 'userEnteredFormat'
                }
              }
            ]
          })
        }
      );
    } catch (err: unknown) {
      console.error('Error configurando hoja Pacientes:', err);
    }
  }

  private async setupCitasSheet(token: string | null, sheetId: string, sheetNumericId: number): Promise<void> {
    if (!token) return;

    const headers = [
      'Fecha', 'Hora', 'ID Paciente', 'Nombre Paciente', 'Tipo Sesión', 'Estado', 'Notas'
    ];

    try {
      // Escribir cabeceras
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Citas!A1:G1?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [headers] })
        }
      );

      // Aplicar estilo a cabeceras (verde)
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                repeatCell: {
                  range: { sheetId: sheetNumericId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 7 },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.18, green: 0.25, blue: 0.23 },
                      textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
                    }
                  },
                  fields: 'userEnteredFormat'
                }
              }
            ]
          })
        }
      );
    } catch (err: unknown) {
      console.error('Error configurando hoja Citas:', err);
    }
  }

  private async setupPaymentsSheet(token: string | null, sheetId: string, sheetNumericId: number): Promise<void> {
    if (!token) return;

    const headers = [
      'Fecha', 'ID Paciente', 'Nombre Paciente', 'Concepto', 
      'Cantidad €', 'Método Pago', 'Estado', 'Notas'
    ];

    try {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Pagos!A1:H1?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [headers] })
        }
      );

      // Estilo cabecera
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                repeatCell: {
                  range: { sheetId: sheetNumericId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 8 },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.5, green: 0, blue: 0.125 },
                      textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
                    }
                  },
                  fields: 'userEnteredFormat'
                }
              }
            ]
          })
        }
      );
    } catch (err: unknown) {
      console.error('Error configurando hoja Pagos:', err);
    }
  }

  private async setupReportsSheet(token: string | null, sheetId: string, sheetNumericId: number): Promise<void> {
    if (!token) return;

    const headers = [
      'Fecha', 'ID Paciente', 'Nombre Paciente', 'Tipo Informe', 
      'Título', 'Estado', 'Link Google Docs', 'Método Input'
    ];

    try {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Informes!A1:H1?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: [headers] })
        }
      );
    } catch (err: unknown) {
      console.error('Error configurando hoja Informes:', err);
    }
  }

  async upsertPatientInCRM(token: string | null, patientData: PatientCRMData, sheetId?: string): Promise<boolean> {
    try {
      if (!token) return false;

      const crmSheetId = sheetId || await this.getOrCreateCRMSheet(token);
      if (!crmSheetId) return false;

      const searchResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Pacientes!A:A`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (!searchResponse.ok) throw new Error('Error buscando pacientes en CRM');
      const searchData: { values?: string[][] } = await searchResponse.json();
      const existingRows = searchData.values || [];

      let targetRow = -1;
      for (let i = 1; i < existingRows.length; i++) {
        if (existingRows[i][0] === patientData.id) {
          targetRow = i + 1;
          break;
        }
      }

      const rowData = [
        patientData.id,
        patientData.name,
        patientData.email || '',
        patientData.phone || '',
        patientData.birth_date || '',
        patientData.created_at,
        patientData.total_reports.toString(),
        patientData.last_report_date || '',
        patientData.payment_status,
        patientData.total_paid.toString(),
        patientData.next_payment_due || '',
        patientData.status,
        patientData.notes || '',
        patientData.drive_folder_url || ''
      ];

      if (targetRow > 0) {
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Pacientes!A${targetRow}:N${targetRow}?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: [rowData] })
          }
        );
      } else {
        const nextRow = existingRows.length + 1;
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Pacientes!A${nextRow}:N${nextRow}?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: [rowData] })
          }
        );
      }

      console.log('✅ Paciente actualizado en CRM:', patientData.name);
      return true;
    } catch (err: unknown) {
      console.error('Error actualizando paciente en CRM:', err);
      return false;
    }
  }

  async addReportToCRM(token: string | null, reportData: ReportCRMData, sheetId?: string): Promise<boolean> {
    try {
      if (!token) return false;

      const crmSheetId = sheetId || await this.getOrCreateCRMSheet(token);
      if (!crmSheetId) return false;

      const getResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Informes!A:A`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (!getResponse.ok) throw new Error('Error obteniendo datos de informes');
      const getData: { values?: string[][] } = await getResponse.json();
      const nextRow = (getData.values?.length || 0) + 1;

      const rowData = [
        reportData.date,
        reportData.patientId,
        reportData.patientName,
        reportData.reportType,
        reportData.title,
        reportData.status,
        reportData.driveLink,
        reportData.inputMethod
      ];

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Informes!A${nextRow}:H${nextRow}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowData] })
        }
      );

      console.log('✅ Informe agregado al CRM');
      return true;
    } catch (err: unknown) {
      console.error('Error agregando informe al CRM:', err);
      return false;
    }
  }

  async addPaymentToCRM(token: string | null, paymentData: PaymentData, sheetId?: string): Promise<boolean> {
    try {
      if (!token) return false;

      const crmSheetId = sheetId || await this.getOrCreateCRMSheet(token);
      if (!crmSheetId) return false;

      const getResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Pagos!A:A`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (!getResponse.ok) throw new Error('Error obteniendo datos de pagos');
      const getData: { values?: string[][] } = await getResponse.json();
      const nextRow = (getData.values?.length || 0) + 1;

      const rowData = [
        paymentData.date,
        paymentData.patientId,
        paymentData.patientName,
        paymentData.concept,
        paymentData.amount.toString(),
        paymentData.paymentMethod,
        paymentData.status,
        paymentData.notes || ''
      ];

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Pagos!A${nextRow}:H${nextRow}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowData] })
        }
      );

      console.log('✅ Pago agregado al CRM');
      return true;
    } catch (err: unknown) {
      console.error('Error agregando pago al CRM:', err);
      return false;
    }
  }

  async addCitaToCRM(
    token: string | null,
    citaData: {
      date: string; // YYYY-MM-DD
      time: string; // HH:MM
      patientId: string;
      patientName: string;
      sessionType: string; // Ej: "Primera Visita", "Seguimiento"
      status: string;      // Ej: "Programada"
      notes?: string;
    },
    sheetId?: string
  ): Promise<boolean> {
    try {
      if (!token) return false;

      const crmSheetId = sheetId || (await this.getOrCreateCRMSheet(token));
      if (!crmSheetId) return false;

      // Buscar la próxima fila vacía en la pestaña 'Citas'
      const getResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Citas!A:A`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!getResponse.ok) throw new Error('Error obteniendo datos de citas');
      const getData: { values?: string[][] } = await getResponse.json();
      const nextRow = (getData.values?.length || 0) + 1;

      const rowData = [
        citaData.date,
        citaData.time,
        citaData.patientId,
        citaData.patientName,
        citaData.sessionType,
        citaData.status,
        citaData.notes || '',
      ];

      // Escribir los datos de la cita en la nueva fila
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Citas!A${nextRow}:G${nextRow}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [rowData] }),
        }
      );

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Cita agregada al CRM');
      }
      return true;
    } catch (err: unknown) {
      console.error('Error agregando cita al CRM:', err);
      return false;
    }
  }

  async deletePatientFromCRM(token: string | null, patientId: string, sheetId?: string): Promise<boolean> {
    try {
      if (!token) {
        console.warn('⚠️ No token provided for deleting patient from CRM');
        return false;
      }

      const crmSheetId = sheetId || await this.getOrCreateCRMSheet(token);
      if (!crmSheetId) {
        console.warn('⚠️ No CRM sheet found');
        return false;
      }

      // 1. Buscar la fila del paciente en la pestaña 'Pacientes'
      const searchResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}/values/Pacientes!A:A`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (!searchResponse.ok) {
        throw new Error('Error buscando paciente en CRM');
      }

      const searchData: { values?: string[][] } = await searchResponse.json();
      const existingRows = searchData.values || [];

      // Buscar el índice de la fila que contiene el patientId
      let targetRowIndex = -1;
      for (let i = 1; i < existingRows.length; i++) { // Empezamos en 1 para saltar la cabecera
        if (existingRows[i][0] === patientId) {
          targetRowIndex = i;
          break;
        }
      }

      if (targetRowIndex === -1) {
        console.warn(`⚠️ Paciente ${patientId} no encontrado en CRM`);
        return false; // No encontrado, pero no es un error crítico
      }

      // 2. Obtener el sheetId numérico de la pestaña 'Pacientes'
      const sheetMetadataResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}?fields=sheets(properties)`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!sheetMetadataResponse.ok) {
        throw new Error('Error obteniendo metadata del sheet');
      }

      const sheetMetadata: { sheets: Array<{ properties: { title: string; sheetId: number } }> } = await sheetMetadataResponse.json();
      const patientsSheet = sheetMetadata.sheets.find(s => s.properties.title === 'Pacientes');
      
      if (!patientsSheet) {
        throw new Error('Pestaña Pacientes no encontrada');
      }

      const sheetNumericId = patientsSheet.properties.sheetId;

      // 3. Eliminar la fila usando batchUpdate
      const deleteResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${crmSheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: sheetNumericId,
                    dimension: 'ROWS',
                    startIndex: targetRowIndex,
                    endIndex: targetRowIndex + 1
                  }
                }
              }
            ]
          })
        }
      );

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(`Error eliminando fila del CRM: ${JSON.stringify(errorData)}`);
      }

      console.log(`✅ Paciente ${patientId} eliminado del CRM en fila ${targetRowIndex + 1}`);
      return true;

    } catch (err: unknown) {
      console.error('❌ Error eliminando paciente del CRM:', err);
      return false;
    }
  }

  getCRMViewUrl(sheetId: string): string {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
  }
}

export const googleSheetsPatientCRM = new GoogleSheetsPatientCRMService();
