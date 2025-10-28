import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText, Calendar, Table, FolderOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { reportsService } from '@/services/database';
import { googleSheetsPatientCRM } from '@/services/googleSheetsPatientCRM';
import { googleDriveService } from '@/services/googleDrive';
import type { Report } from '@/services/database';

interface ReportsViewerProps {
  patientId?: string;
  patientName?: string;
  showAllReports?: boolean;
  className?: string;
}

const ReportsViewer: React.FC<ReportsViewerProps> = ({ 
  patientId,
  patientName,
  showAllReports = false,
  className = ""
}) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [crmSheetId, setCrmSheetId] = useState<string | null>(null);
  const [patientFolderUrl, setPatientFolderUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      if (!user?.id) return;

      try {
        let reportsData: Report[] = [];
        
        if (patientId) {
          reportsData = await reportsService.getByPatient(patientId);
          
          // Obtener URL de carpeta del paciente si tenemos el nombre
          if (patientName) {
            const folderUrl = await googleDriveService.getPatientFolderUrl(patientName, patientId);
            setPatientFolderUrl(folderUrl);
          }
        } else if (showAllReports) {
          reportsData = await reportsService.getAll();
        }

        setReports(reportsData);

        // Obtener CRM Sheet ID
        const sheetId = await googleSheetsPatientCRM.getOrCreateCRMSheet();
        setCrmSheetId(sheetId);

      } catch (error) {
        console.error('Error cargando informes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [user?.id, patientId, patientName, showAllReports]);

  // ✅ ÚNICA función formatDate
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels = {
      'primera_visita': 'Primera Visita',
      'seguimiento': 'Seguimiento',
      'alta_paciente': 'Alta Paciente'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'generating': 'bg-yellow-100 text-yellow-800',
      'error': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'completed': 'Completado',
      'generating': 'Generando...',
      'error': 'Error'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Cargando informes...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con accesos rápidos */}
      {(patientId || crmSheetId) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <Table className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">
                    {patientId ? 'Gestión del Paciente' : 'CRM General'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {patientId 
                      ? 'Carpeta Drive y registro en CRM' 
                      : 'Sistema completo de gestión de pacientes'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {patientFolderUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(patientFolderUrl, '_blank')}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Carpeta Drive
                  </Button>
                )}
                
                {crmSheetId && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(
                      googleSheetsPatientCRM.getCRMViewUrl(crmSheetId), 
                      '_blank'
                    )}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {patientId ? 'Ver en CRM' : 'Abrir CRM'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de informes */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay informes disponibles</p>
              {patientId && (
                <p className="text-sm mt-2">
                  Los nuevos informes aparecerán aquí automáticamente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-muted-foreground">
              {reports.length} informe{reports.length !== 1 ? 's' : ''} encontrado{reports.length !== 1 ? 's' : ''}
            </h4>
          </div>
          
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium">{report.title}</h3>
                      <Badge className={getStatusBadgeColor(report.status ?? '')}>
                        {getStatusLabel(report.status ?? '')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(report.created_at ?? '')}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getReportTypeLabel(report.report_type)}
                      </Badge>
                      {report.input_type && (
                        <Badge variant="secondary" className="text-xs">
                          {report.input_type === 'voice' ? '🎤 Voz' : 
                           report.input_type === 'text' ? '📝 Texto' : '🔄 Mixto'}
                        </Badge>
                      )}
                    </div>

                    {report.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.content.substring(0, 200)}...
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {report.google_drive_file_id && report.status === 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(
                          `https://docs.google.com/document/d/${report.google_drive_file_id}/edit`, 
                          '_blank'
                        )}
                        className="shrink-0"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Documento
                      </Button>
                    )}
                    
                    {report.status === 'generating' && (
                      <div className="text-xs text-muted-foreground px-3 py-2 bg-yellow-50 rounded">
                        Procesando...
                      </div>
                    )}
                    
                    {report.status === 'error' && (
                      <div className="text-xs text-red-600 px-3 py-2 bg-red-50 rounded">
                        Error al generar
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsViewer;
