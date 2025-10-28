import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { googleDriveService } from '@/services/googleDrive';
import { 
  HardDrive, 
  ExternalLink, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Loader2 
} from 'lucide-react';

interface GoogleDriveIntegrationProps {
  className?: string;
}

export const GoogleDriveIntegration: React.FC<GoogleDriveIntegrationProps> = ({ 
  className 
}) => {
  const { toast } = useToast();
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const checkPermissions = async () => {
    setIsChecking(true);
    try {
      const permissions = await googleDriveService.hasPermissions();
      setHasPermissions(permissions);
    } catch (error) {
      console.error('Error verificando permisos:', error);
      setHasPermissions(false);
    } finally {
      setIsChecking(false);
    }
  };

  const requestPermissions = async () => {
    setIsRequesting(true);
    try {
      const success = await googleDriveService.requestPermissions();
      if (success) {
        toast({
          title: "Permisos solicitados",
          description: "Serás redirigido para autorizar el acceso a Google Drive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron solicitar los permisos de Google Drive",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al solicitar permisos de Google Drive",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const renderStatus = () => {
    if (isChecking) {
      return (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Verificando permisos...</span>
        </div>
      );
    }

    if (hasPermissions === null) {
      return (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Estado desconocido</span>
        </div>
      );
    }

    if (hasPermissions) {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Google Drive conectado</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Activo
          </Badge>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-amber-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Permisos requeridos</span>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          Pendiente
        </Badge>
      </div>
    );
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <HardDrive className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-lora text-lg font-semibold text-[#2E403B]">
              Almacenamiento Zero-Knowledge
            </h3>
            <p className="text-sm text-muted-foreground">
              Tus informes se guardan en tu Google Drive personal
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#FBF9F6] rounded-lg p-4">
          {renderStatus()}
        </div>

        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-[#2E403B] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#2E403B]">
                Máxima privacidad y seguridad
              </p>
              <p className="text-xs text-muted-foreground">
                Solo tú tienes acceso a tus informes clínicos
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <ExternalLink className="h-5 w-5 text-[#2E403B] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#2E403B]">
                Acceso directo desde cualquier dispositivo
              </p>
              <p className="text-xs text-muted-foreground">
                Usa Google Docs para editar y compartir informes
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-2">
          {!hasPermissions && (
            <Button
              onClick={requestPermissions}
              disabled={isRequesting}
              className="bg-[#2E403B] hover:bg-[#800020] text-white"
            >
              {isRequesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Solicitando...
                </>
              ) : (
              <>
                <HardDrive className="mr-2 h-4 w-4" />
                Conectar Google Drive
              </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={checkPermissions}
            disabled={isChecking}
            className="border-[#2E403B] text-[#2E403B] hover:bg-[#2E403B] hover:text-white"
          >
            {isChecking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Verificar Estado
          </Button>
        </div>

        {/* Warning for missing permissions */}
        {hasPermissions === false && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">
                  Permisos de Google Drive requeridos
                </p>
                <p className="text-amber-700 mt-1">
                  Para garantizar la privacidad de tus informes, necesitamos acceso a tu Google Drive. 
                  Los informes se guardarán en una carpeta privada llamada "INFORIA Reports".
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GoogleDriveIntegration;