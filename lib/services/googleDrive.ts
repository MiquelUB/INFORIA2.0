import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  createdTime: string;
}

export interface DriveCreateResponse {
  fileId: string;
  webViewLink: string;
  success: boolean;
  message: string;
}

export class GoogleDriveService {
  private static readonly FOLDER_NAME = 'INFORIA-INFORMES';
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/drive.file'
  ];

  async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error obteniendo sesión:', error.message);
        return null;
      }
      
      if (!session) {
        console.error('❌ No hay sesión activa. Usuario debe autenticarse con Google OAuth.');
        return null;
      }
      
      if (!session.provider_token) {
        console.error('❌ No hay provider_token en la sesión. Asegúrate de haberte autenticado con Google (OAuth), no solo con email/password.');
        console.warn('📋 Sesión disponible pero sin Google OAuth:', {
          user: session.user?.email,
          provider: session.user?.identities?.map(i => i.provider) || []
        });
        return null;
      }

      console.log('✅ Google OAuth token obtenido correctamente');
      return session.provider_token;
    } catch (error) {
      console.error('❌ Error en getAccessToken:', error);
      return null;
    }
  }

  async hasPermissions(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error verificando permisos de Drive:', error);
      return false;
    }
  }

  private async getOrCreateInforiaFolder(): Promise<string | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${GoogleDriveService.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!searchResponse.ok) {
        throw new Error('Error buscando carpeta INFORIA_INFORMES_PACIENTES');
      }

      const searchData = await searchResponse.json();
      
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }

      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: GoogleDriveService.FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        })
      });

      if (!createResponse.ok) {
        throw new Error('Error creando carpeta INFORIA_INFORMES_PACIENTES');
      }

      const createData = await createResponse.json();
      console.log('✅ Carpeta INFORIA_INFORMES_PACIENTES creada:', createData.id);
      
      return createData.id;
    } catch (error) {
      console.error('Error gestionando carpeta INFORIA_INFORMES_PACIENTES:', error);
      return null;
    }
  }

  private async getOrCreatePatientFolder(patientName: string, patientId: string): Promise<string | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const baseFolder = await this.getOrCreateInforiaFolder();
      if (!baseFolder) return null;

      const folderName = patientName.replace(/[<>:"/\\|?*']/g, '_').trim();
      const searchName = `${folderName}_${patientId.substring(0, 8)}`;

      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${searchName}' and '${baseFolder}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!searchResponse.ok) {
        throw new Error('Error buscando carpeta del paciente');
      }

      const searchData = await searchResponse.json();
      
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }

      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: searchName,
          parents: [baseFolder],
          mimeType: 'application/vnd.google-apps.folder'
        })
      });

      if (!createResponse.ok) {
        throw new Error('Error creando carpeta del paciente');
      }

      const createData = await createResponse.json();
      console.log('✅ Carpeta del paciente creada en INFORIA_INFORMES_PACIENTES:', createData.id);
      
      return createData.id;
    } catch (error) {
      console.error('Error gestionando carpeta del paciente:', error);
      return null;
    }
  }

  async createPatientReport(
    title: string, 
    content: string, 
    patientName: string,
    patientId: string
  ): Promise<DriveCreateResponse> {
    console.log('🚀 [DriveService] createPatientReport iniciado:', { title, patientName, patientId });
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          fileId: '',
          webViewLink: '',
          success: false,
          message: 'No tienes permisos de Google Drive. Re-autentica tu cuenta.'
        };
      }

      const patientFolderId = await this.getOrCreatePatientFolder(patientName, patientId);
      if (!patientFolderId) {
        return {
          fileId: '',
          webViewLink: '',
          success: false,
          message: 'Error creando carpeta del paciente'
        };
      }

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const fileName = `${dateStr} - ${title}`;

      const metadata = {
        name: fileName,
        parents: [patientFolderId],
        mimeType: 'application/vnd.google-apps.document'
      };

      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (!createResponse.ok) {
        throw new Error('Error creando documento en Drive');
      }

      const fileData = await createResponse.json();

      const requests = [
        {
          insertText: {
            location: { index: 1 },
            text: `${title}\n\n${content}`
          }
        },
        {
          updateTextStyle: {
            range: {
              startIndex: 1,
              endIndex: title.length + 1
            },
            textStyle: {
              bold: true,
              fontSize: { magnitude: 16, unit: 'PT' }
            },
            fields: 'bold,fontSize'
          }
        }
      ];

      const updateResponse = await fetch(
        `https://docs.googleapis.com/v1/documents/${fileData.id}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests })
        }
      );

      if (!updateResponse.ok) {
        console.warn('Documento creado pero error al formatear contenido');
      }

      console.log('✅ Informe guardado en carpeta del paciente:', fileData.id);

      return {
        fileId: fileData.id,
        webViewLink: `https://docs.google.com/document/d/${fileData.id}/edit`,
        success: true,
        message: 'Informe guardado exitosamente en Google Drive'
      };

    } catch (error) {
      console.error('Error creando documento en Drive:', error);
      return {
        fileId: '',
        webViewLink: '',
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // CORRECCIÓN: Eliminar parámetro patientName no usado (línea 283 del error)
  async createReport(
    title: string, 
    content: string
  ): Promise<DriveCreateResponse> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          fileId: '',
          webViewLink: '',
          success: false,
          message: 'No tienes permisos de Google Drive. Re-autentica tu cuenta.'
        };
      }

      const folderId = await this.getOrCreateInforiaFolder();
      if (!folderId) {
        return {
          fileId: '',
          webViewLink: '',
          success: false,
          message: 'Error accediendo a la carpeta de informes'
        };
      }

      const metadata = {
        name: `${title}.gdoc`,
        parents: [folderId],
        mimeType: 'application/vnd.google-apps.document'
      };

      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (!createResponse.ok) {
        throw new Error('Error creando documento en Drive');
      }

      const fileData = await createResponse.json();

      const requests = [
        {
          insertText: {
            location: { index: 1 },
            text: `${title}\n\n${content}`
          }
        },
        {
          updateTextStyle: {
            range: {
              startIndex: 1,
              endIndex: title.length + 1
            },
            textStyle: {
              bold: true,
              fontSize: { magnitude: 16, unit: 'PT' }
            },
            fields: 'bold,fontSize'
          }
        }
      ];

      const updateResponse = await fetch(
        `https://docs.googleapis.com/v1/documents/${fileData.id}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests })
        }
      );

      if (!updateResponse.ok) {
        console.warn('Documento creado pero error al formatear contenido');
      }

      console.log('✅ Informe guardado en Google Drive:', fileData.id);

      return {
        fileId: fileData.id,
        webViewLink: `https://docs.google.com/document/d/${fileData.id}/edit`,
        success: true,
        message: 'Informe guardado exitosamente en Google Drive'
      };

    } catch (error) {
      console.error('Error creando documento en Drive:', error);
      return {
        fileId: '',
        webViewLink: '',
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async listReports(): Promise<GoogleDriveFile[]> {
    try {
      const token = await this.getAccessToken();
      if (!token) return [];

      const folderId = await this.getOrCreateInforiaFolder();
      if (!folderId) return [];

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false&fields=files(id,name,webViewLink,webContentLink,createdTime)&orderBy=createdTime desc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error listando informes');
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error listando informes:', error);
      return [];
    }
  }

  async listPatientReports(patientName: string, patientId: string): Promise<GoogleDriveFile[]> {
    try {
      const token = await this.getAccessToken();
      if (!token) return [];

      const patientFolderId = await this.getOrCreatePatientFolder(patientName, patientId);
      if (!patientFolderId) return [];

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${patientFolderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false&fields=files(id,name,webViewLink,webContentLink,createdTime)&orderBy=createdTime desc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error listando informes del paciente');
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error listando informes del paciente:', error);
      return [];
    }
  }

  async checkFileExists(fileId: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      if (!token) return false;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,trashed`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) return false;

      const data = await response.json();
      return !data.trashed;
    } catch (error) {
      console.error('Error verificando archivo:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: GoogleDriveService.SCOPES.join(' '),
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Error solicitando permisos:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en requestPermissions:', error);
      return false;
    }
  }

  async getPatientFolderUrl(patientName: string, patientId: string): Promise<string | null> {
    try {
      const patientFolderId = await this.getOrCreatePatientFolder(patientName, patientId);
      if (!patientFolderId) return null;

      return `https://drive.google.com/drive/folders/${patientFolderId}`;
    } catch (error) {
      console.error('Error obteniendo URL de carpeta del paciente:', error);
      return null;
    }
  }

  /**
   * Crea un Google Sheet para el CRM del paciente
   */
  async createPatientCRMSheet(
    patientName: string,
    patientId: string,
    patientEmail?: string,
    patientBirthDate?: string
  ): Promise<DriveCreateResponse> {
    const token = await this.getAccessToken();
    if (!token) {
      return {
        fileId: '',
        webViewLink: '',
        success: false,
        message: 'No tienes permisos de Google Drive. Re-autentica tu cuenta.'
      };
    }

    let sheetId = '';
    let webViewLink = '';

    try {
      // 1. Crear la carpeta del paciente
      const patientFolderId = await this.getOrCreatePatientFolder(patientName, patientId);
      if (!patientFolderId) {
        throw new Error('Error creando carpeta del paciente');
      }

      // 2. Definir el nombre del CRM
      const fileName = `CRM - ${patientName}`;
      
      // 3. Crear el Google Sheet
      const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: { title: fileName },
          sheets: [
            { properties: { title: 'Datos del Paciente' } },
            { properties: { title: 'Seguimiento de Sesiones' } },
            { properties: { title: 'Historial de Pagos' } }
          ]
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Error creando Google Sheet: ${createResponse.statusText}`);
      }

      const fileData = await createResponse.json();
      sheetId = fileData.spreadsheetId;
      // Usar spreadsheetViewLink si existe, si no construirla
      webViewLink = fileData.spreadsheetViewLink || `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Google Sheet creado - ID: ${sheetId}`);
      }

      // 4. Mover el Sheet a la carpeta del paciente
      await fetch(`https://www.googleapis.com/drive/v3/files/${sheetId}?addParents=${patientFolderId}&removeParents=root`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 5. Poblar el Sheet con los datos del paciente (LA CORRECCIÓN ESTÁ AQUÍ)
      const sheetData = [
        ['DATOS DEL PACIENTE'],
        ['Nombre Completo', patientName],
        ['ID de Paciente', patientId],
        ['Email', patientEmail || 'No proporcionado'],
        ['Fecha de Nacimiento', patientBirthDate || 'No proporcionada'],
        ['Enlace Carpeta Drive', `https://drive.google.com/drive/folders/${patientFolderId}`]
      ];

      // **** INICIO DE LA CORRECCIÓN ****
      // CORRECCIÓN: Usar 'values.update' (con método PUT) en lugar de 'batchUpdate'
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Datos%20del%20Paciente!A1:B6?valueInputOption=RAW`,
        {
          method: 'PUT', // <-- ANTES ERA 'POST'
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ values: sheetData }) // <-- ANTES USABA 'requests'
        }
      );
      // **** FIN DE LA CORRECCIÓN ****

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('⚠️ Google Sheet creado pero error al inicializar datos:', errorData);
        throw new Error('Error al escribir datos en el Sheet');
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ CRM Sheet creado y poblado:', webViewLink);
      }

      return {
        fileId: sheetId,
        webViewLink: webViewLink,
        success: true,
        message: 'CRM creado y poblado exitosamente'
      };

    } catch (error) {
      console.error('Error creando CRM en Google Sheets:', error);
      return {
        fileId: sheetId, // Devolvemos el ID aunque falle el poblar datos
        webViewLink: webViewLink, // Devolvemos el Link aunque falle el poblar datos
        success: false, // Devolvemos 'false' en caso de error
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // ✅ NUEVO: Función para subir archivos binarios (Audio, PDF, Imágenes)
  async uploadFile(
    fileBlob: Blob,
    fileName: string,
    patientName: string,
    patientId: string,
    mimeType: string = 'audio/wav'
  ): Promise<{ id: string; webViewLink: string } | null> {
    try {
      console.log('📤 Iniciando subida de archivo:', { fileName, size: fileBlob.size });
      
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('❌ No hay token de acceso a Google. Por favor inicia sesión con Google OAuth.');
      }

      console.log('📁 Obteniendo/creando carpeta del paciente...');
      const folderId = await this.getOrCreatePatientFolder(patientName, patientId);
      if (!folderId) {
        throw new Error('❌ No se pudo crear carpeta del paciente en Google Drive');
      }

      const metadata = {
        name: fileName,
        parents: [folderId],
        mimeType: mimeType
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', fileBlob);

      console.log('🔄 Enviando archivo a Google Drive...');
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google Drive error response:', { status: response.status, statusText: response.statusText, error: errorText });
        throw new Error(`Error en Google Drive: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Archivo subido exitosamente:', result.id);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Error subiendo archivo:', errorMsg);
      return null;
    }
  }

  // Función para borrar archivos (Limpieza de duplicados)
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        console.error('❌ No hay token para borrar archivo:', fileId);
        return false;
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        console.log(`🗑️ Archivo eliminado de Drive: ${fileId}`);
        return true;
      } else {
        console.error(`❌ Error borrando archivo ${fileId}:`, response.statusText);
        return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Excepción borrando archivo:', errorMsg);
      return false;
    }
  }
}

export const googleDriveService = new GoogleDriveService();