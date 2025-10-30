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
  private static readonly FOLDER_NAME = 'iNFORiA_INFORMES';
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.folders',
    'https://www.googleapis.com/auth/documents'
  ];

  async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.provider_token) {
        console.error('No hay token de Google disponible:', error);
        return null;
      }

      return session.provider_token;
    } catch (error) {
      console.error('Error obteniendo token:', error);
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
        throw new Error('Error buscando carpeta iNFORiA_INFORMES');
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
        throw new Error('Error creando carpeta iNFORiA_INFORMES');
      }

      const createData = await createResponse.json();
      console.log('✅ Carpeta iNFORiA_INFORMES creada:', createData.id);
      
      return createData.id;
    } catch (error) {
      console.error('Error gestionando carpeta iNFORiA_INFORMES:', error);
      return null;
    }
  }

  private async getOrCreatePatientFolder(patientName: string, patientId: string): Promise<string | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const baseFolder = await this.getOrCreateInforiaFolder();
      if (!baseFolder) return null;

      const folderName = patientName.replace(/[<>:"/\\|?*]/g, '_').trim();
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
      console.log('✅ Carpeta del paciente creada en iNFORiA_INFORMES:', createData.id);
      
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
}

export const googleDriveService = new GoogleDriveService();