import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, CheckCircle } from 'lucide-react';
export function LoginForm() {
  const {
    signInWithGoogle,
    loading
  } = useAuth();
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in failed:', error);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-inforia-cream p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            
            <span className="text-3xl font-serif font-semibold text-primary">
              iNFORiA
            </span>
          </div>
          <CardTitle className="text-2xl font-serif text-primary">
            Puesto de Mando Clínico
          </CardTitle>
          <CardDescription className="text-inforia-graphite text-base">
            para Psicólogos Profesionales
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Explicación de por qué solo Google */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Acceso Seguro Requerido</span>
            </div>
            <p className="text-sm text-inforia-graphite">
              INFORIA necesita permisos de Google Drive para guardar tus informes de forma segura 
              en tu propia cuenta. Solo Google OAuth permite este acceso protegido.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-inforia-graphite">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Tus datos permanecen en tu Google Drive</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-inforia-graphite">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Modelo Zero-Knowledge para máxima privacidad</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-inforia-graphite">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Cumplimiento LOPD y secreto profesional</span>
              </div>
            </div>
          </div>

          {/* Google Sign In */}
          <Button onClick={handleGoogleSignIn} disabled={loading} variant="outline" size="lg" className="w-full border-2 border-primary hover:bg-primary hover:text-primary-foreground text-base py-6">
            {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>}
            Continuar con Google
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-2">
            <p>
              Al continuar, aceptas nuestros{' '}
              <a href="/legal/terms" className="underline hover:text-primary">
                Términos de Servicio
              </a>{' '}
              y{' '}
              <a href="/legal/privacy" className="underline hover:text-primary">
                Política de Privacidad
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
}