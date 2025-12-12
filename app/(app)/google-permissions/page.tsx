'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { Shield, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function GooglePermissionsPage() {
  const [hasToken, setHasToken] = useState(false);
  const [tokenScopes, setTokenScopes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [reauthorizing, setReauthorizing] = useState(false);
  const supabase = createClient();

  const requiredScopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets',
  ];

  useEffect(() => {
    checkTokenAndScopes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkTokenAndScopes = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.provider_token) {
        setHasToken(true);
        
        // Intentar obtener info del token de Google
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${session.provider_token}`);
        
        if (response.ok) {
          const data = await response.json();
          const scopes = data.scope ? data.scope.split(' ') : [];
          setTokenScopes(scopes);
        }
      } else {
        setHasToken(false);
      }
    } catch (error) {
      console.error('Error verificando token:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestGooglePermissions = async () => {
    setReauthorizing(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/google-permissions`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent', // Forzar pantalla de consentimiento
            include_granted_scopes: 'true', // Mantener scopes anteriores
          },
          scopes: 'openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
        },
      });

      if (error) {
        console.error('Error solicitando permisos:', error);
        alert('Error al solicitar permisos: ' + error.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setReauthorizing(false);
    }
  };

  const hasDrivePermissions = () => {
    return tokenScopes.some(ts => ts.includes('drive') || ts.includes('spreadsheet'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permisos de Google Drive
            </CardTitle>
            <CardDescription>
              Gestiona los permisos de acceso a Google Drive y Sheets para crear CRM de pacientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estado del Token */}
            <Alert variant={hasToken ? "default" : "destructive"}>
              <AlertTitle className="flex items-center gap-2">
                {hasToken ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Token de Google detectado
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    No hay token de Google
                  </>
                )}
              </AlertTitle>
              <AlertDescription>
                {hasToken 
                  ? 'Tu sesión tiene un token de autenticación de Google activo.'
                  : 'No estás autenticado con Google. Inicia sesión primero.'}
              </AlertDescription>
            </Alert>

            {/* Permisos de Drive */}
            {hasToken && (
              <Alert variant={hasDrivePermissions() ? "default" : "destructive"}>
                <AlertTitle className="flex items-center gap-2">
                  {hasDrivePermissions() ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Permisos de Drive detectados
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      Faltan permisos de Drive
                    </>
                  )}
                </AlertTitle>
                <AlertDescription>
                  {hasDrivePermissions()
                    ? 'Tu token tiene permisos para acceder a Google Drive.'
                    : 'Tu token NO tiene permisos de Google Drive. Necesitas re-autenticarte.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Lista de Scopes Actuales */}
            {tokenScopes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Scopes actuales:</h3>
                <ul className="text-xs space-y-1 bg-muted p-3 rounded-lg max-h-40 overflow-y-auto">
                  {tokenScopes.map((scope, index) => (
                    <li key={index} className="font-mono">
                      {scope}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scopes Requeridos */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Permisos necesarios:</h3>
              <ul className="text-xs space-y-1">
                {requiredScopes.map((scope, index) => {
                  const hasScope = tokenScopes.some(ts => ts.includes(scope) || scope.includes(ts));
                  return (
                    <li key={index} className="flex items-center gap-2">
                      {hasScope ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="font-mono">{scope}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Botón de Re-autorización */}
            {hasToken && !hasDrivePermissions() && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={requestGooglePermissions}
                  disabled={reauthorizing}
                  className="w-full"
                >
                  {reauthorizing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Redirigiendo a Google...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Solicitar Permisos de Drive
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Se abrirá una ventana de Google para que autorices el acceso a Drive y Sheets
                </p>
              </div>
            )}

            {/* Instrucciones */}
            <div className="pt-4 border-t space-y-2">
              <h3 className="text-sm font-medium">¿Qué hacer?</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Haz clic en &quot;Solicitar Permisos de Drive&quot;</li>
                <li>Se abrirá una ventana de Google</li>
                <li>Acepta los permisos de Drive y Sheets</li>
                <li>Serás redirigido de vuelta a esta página</li>
                <li>Verifica que los permisos aparezcan como ✓</li>
              </ol>
            </div>

            {/* Botón para refrescar */}
            <Button 
              variant="outline" 
              onClick={checkTokenAndScopes}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar permisos nuevamente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
