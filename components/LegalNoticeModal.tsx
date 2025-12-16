'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { acceptLegalTerms } from '@/app/actions/user';
import { toast } from '@/components/ui/use-toast';
// import { ExternalLink } from 'lucide-react';

const CURRENT_TERMS_VERSION = 'v1.0-2025-12-15';

export default function LegalNoticeModal() {
  const { user, profile, refreshProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  useEffect(() => {
    if (user && profile) {
      // Check if user has accepted the current terms
      const hasAccepted = profile.terms_version === CURRENT_TERMS_VERSION || profile.terms_accepted_at;
      if (!hasAccepted) {
        setIsOpen(true);
      }
    }
  }, [user, profile]);

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await acceptLegalTerms(CURRENT_TERMS_VERSION);
      await refreshProfile();
      setIsOpen(false);
      toast({
        title: "Términos aceptados",
        description: "Gracias por aceptar nuestras políticas.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al guardar tu aceptación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
       setHasScrolledToBottom(true);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0 [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-primary">Actualización Legal Importante</DialogTitle>
          <DialogDescription>
            Para continuar utilizando INFORIA, debes leer y aceptar nuestros nuevos Términos y Condiciones y Política de Privacidad.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6 pt-0" onScrollCapture={handleScroll}>
          <div className="space-y-6 text-sm text-muted-foreground pr-4">
            
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Política de Privacidad de INFORIA</h3>
              <p className="font-medium">Última actualización: 15/12/2025</p>
              
              <div className="space-y-2">
                <p>En INFORIA, la privacidad no es una opción, es la base de nuestra arquitectura. Esta política describe cómo recopilamos, usamos y protegemos tu información y la de tus pacientes al utilizar nuestro software de asistencia clínica bajo el modelo de &quot;Zero-Knowledge&quot; (Cero Conocimiento).</p>
                
                 <h4 className="text-foreground font-semibold mt-4">1. Responsable del Tratamiento</h4>
                 <ul className="list-disc pl-5">
                   <li><strong>Identidad:</strong> INFORIA</li>
                   <li><strong>NIF:</strong> 43726721H</li>
                   <li><strong>Dirección:</strong> Mayor, 11; 25560, SORT, Lleida</li>
                   <li><strong>Email de contacto:</strong> inforia@inforia.pro</li>
                 </ul>

                 <h4 className="text-foreground font-semibold mt-4">2. Qué datos recopilamos</h4>
                 <p>Recopilamos únicamente la información necesaria para prestar el servicio técnico:</p>
                 <ul className="list-disc pl-5">
                   <li><strong>Datos de Cuenta (Profesional):</strong> Nombre, correo electrónico y credenciales de autenticación gestionadas de forma segura.</li>
                   <li><strong>Datos de Facturación:</strong> Información necesaria para gestionar tu suscripción (procesada por Stripe). INFORIA no almacena números de tarjeta de crédito completos.</li>
                   <li><strong>Datos de Google User:</strong> Para el funcionamiento de la integración, accedemos a tu email y perfil básico de Google para verificar tu identidad.</li>
                 </ul>

                 <h4 className="text-foreground font-semibold mt-4">3. Arquitectura &quot;Zero-Knowledge&quot; y Datos Clínicos</h4>
                 <p>INFORIA se distingue por su arquitectura de privacidad por diseño:</p>
                 <ul className="list-disc pl-5">
                   <li><strong>Soberanía del Dato (Google Drive):</strong> Los informes clínicos (Google Docs) y las fichas de pacientes (Google Sheets) nunca se almacenan en las bases de datos de INFORIA. Estos archivos residen exclusivamente en tu cuenta de Google Drive.</li>
                   <li><strong>INFORIA como Pasarela:</strong> Actuamos como un procesador transitorio. Cuando utilizas el motor de informes o el CRM, nuestra aplicación lee y escribe datos directamente en tu Google Drive sin retener copias permanentes en nuestros servidores.</li>
                   <li><strong>Procesamiento de Audio y Texto:</strong> Los audios de las sesiones y las notas transcritas se procesan de forma encriptada y asíncrona para generar los informes. Una vez generado el documento en tu Drive, los datos temporales de procesamiento son eliminados. No utilizamos tus datos clínicos para entrenar modelos públicos de IA.</li>
                 </ul>

                 <h4 className="text-foreground font-semibold mt-4">4. Uso de APIs de Google (Cláusula de Uso Limitado)</h4>
                 <p>El uso y la transferencia de la información recibida de las APIs de Google a cualquier otra aplicación cumplirán con la Política de Datos de Usuario de los Servicios de API de Google, incluidos los requisitos de &quot;Uso Limitado&quot;.</p>
                 <ul className="list-disc pl-5">
                   <li><strong>Alcance del Acceso:</strong> INFORIA solicita acceso a tu Google Drive (drive.file) únicamente para crear, editar y organizar los archivos generados por la aplicación (Informes y Hojas de Cálculo).</li>
                   <li><strong>No Lectura General:</strong> No accedemos, leemos ni analizamos archivos de tu Google Drive que no hayan sido creados por o vinculados explícitamente a INFORIA.</li>
                 </ul>

                 <h4 className="text-foreground font-semibold mt-4">5. Finalidad del tratamiento</h4>
                 <ul className="list-disc pl-5">
                   <li>Proveer el servicio de asistente clínico (transcripción, generación de informes y gestión de calendario).</li>
                   <li>Gestionar el ciclo de vida de la suscripción y la facturación.</li>
                   <li>Enviar notificaciones transaccionales importantes (ej. confirmaciones de alta, renovaciones).</li>
                   <li>Proveer soporte técnico a través de nuestro Módulo de Soporte.</li>
                 </ul>

                 <h4 className="text-foreground font-semibold mt-4">6. Compartición con Terceros (Infraestructura Técnica)</h4>
                 <p>Para garantizar la máxima seguridad y funcionalidad, utilizamos proveedores de infraestructura de primer nivel:</p>
                 <ul className="list-disc pl-5">
                   <li><strong>Supabase (AWS):</strong> Gestión de autenticación y base de datos de usuarios (no clínica).</li>
                   <li><strong>Vercel:</strong> Alojamiento de la aplicación y funciones serverless.</li>
                   <li><strong>OpenRouter / OpenAI:</strong> Procesamiento de lenguaje natural para transcripción (Whisper) y redacción (GPT-4o mini). Los datos se envían de forma anónima y no se usan para entrenamiento.</li>
                   <li><strong>Stripe:</strong> Pasarela de pagos segura (PCI-DSS Nivel 1).</li>
                 </ul>

                 <h4 className="text-foreground font-semibold mt-4">7. Tus Derechos</h4>
                 <p>De acuerdo con el RGPD, tienes derecho a acceder, rectificar, suprimir, limitar u oponerte al tratamiento de tus datos personales. Dado que los datos clínicos están en tu propio Google Drive, tienes control total e inmediato sobre ellos. Para ejercer derechos sobre tus datos de cuenta en INFORIA, escríbenos a inforia@inforia.pro.</p>
              </div>
            </section>

            <div className="h-px bg-border my-6" />

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Términos y Condiciones de Uso de INFORIA</h3>
              <p className="font-medium">Fecha de entrada en vigor: 15 de diciembre de 2025</p>
              
              <div className="space-y-2">
                <p>Bienvenido a INFORIA. Al registrarte y acceder a nuestro software, aceptas vincularte legalmente a los presentes Términos y Condiciones. Por favor, léelos detenidamente.</p>

                <h4 className="text-foreground font-semibold mt-4">1. Información Legal e Identificación</h4>
                <p>El servicio es operado por:</p>
                <ul className="list-disc pl-5">
                  <li><strong>Titular:</strong> INFORIA (en adelante, &quot;La Plataforma&quot; o &quot;Nosotros&quot;).</li>
                  <li><strong>NIF:</strong> 43726721H</li>
                  <li><strong>Domicilio Social:</strong> Mayor, 11; 25560, SORT, Lleida.</li>
                  <li><strong>Contacto:</strong> inforia@inforia.pro</li>
                </ul>

                <h4 className="text-foreground font-semibold mt-4">2. Descripción del Servicio</h4>
                <p>INFORIA es un software como servicio (SaaS) diseñado como Asistente Clínico con Inteligencia Artificial para psicólogos y profesionales de la salud mental. Nuestra herramienta permite:</p>
                <ul className="list-disc pl-5">
                  <li>Transcribir sesiones de audio a texto de forma segura.</li>
                  <li>Generar borradores de informes clínicos, resúmenes y sugerencias diagnósticas (basadas en CIE-10/DSM-5) mediante modelos de IA.</li>
                  <li>Gestionar citas y expedientes básicos de pacientes.</li>
                </ul>
                <p className="mt-2 bg-muted p-2 rounded text-xs border border-muted-foreground/20">
                  <strong>Descargo de Responsabilidad (Disclaimer) sobre IA:</strong> INFORIA es una herramienta de apoyo administrativo y documental, no un sustituto del juicio clínico profesional.<br/>
                  - La IA genera sugerencias basadas en la información proporcionada.<br/>
                  - El Usuario (Profesional) es el único responsable de revisar, editar y validar el contenido de los informes antes de firmarlos o entregarlos.<br/>
                  - INFORIA no ofrece diagnósticos médicos automatizados ni tratamientos directos a pacientes.
                </p>

                <h4 className="text-foreground font-semibold mt-4">3. Arquitectura &quot;Zero-Knowledge&quot; y Responsabilidad de Datos</h4>
                <p>El Usuario reconoce y acepta que INFORIA opera bajo un modelo de &quot;Cero Conocimiento&quot;:</p>
                <ul className="list-disc pl-5">
                  <li><strong>Almacenamiento:</strong> Los datos clínicos sensibles (informes, fichas de pacientes) se almacenan directamente en la cuenta de Google Drive del Usuario, no en los servidores de INFORIA.</li>
                  <li><strong>Copias de Seguridad:</strong> Dado que INFORIA no custodia los archivos finales, es responsabilidad exclusiva del Usuario gestionar la seguridad, acceso y copias de seguridad de su propia cuenta de Google Drive.</li>
                  <li><strong>Pérdida de Acceso:</strong> INFORIA no puede recuperar datos si el Usuario pierde el acceso a su cuenta de Google o elimina los archivos accidentalmente en su Drive.</li>
                </ul>

                <h4 className="text-foreground font-semibold mt-4">4. Registro y Requisitos Técnicos</h4>
                <p>Para utilizar el servicio, el Usuario debe:</p>
                <ul className="list-disc pl-5">
                  <li>Ser un profesional de la salud o institución legalmente habilitada.</li>
                  <li>Disponer de una cuenta de Google activa (necesaria para la autenticación y almacenamiento).</li>
                  <li>Autorizar los permisos técnicos necesarios (scopes) para que la aplicación interactúe con su Google Drive y Calendario.</li>
                </ul>

                <h4 className="text-foreground font-semibold mt-4">5. Suscripciones, Pagos y Facturación</h4>
                <p>El acceso a INFORIA se rige por un modelo de suscripción (mensual o anual).</p>
                <ul className="list-disc pl-5">
                  <li><strong>Cuotas de Informes:</strong> Cada plan incluye un límite de créditos/informes mensuales (ej. 100 informes en el Plan PRO). El servicio no es ilimitado a menos que se especifique lo contrario.</li>
                  <li><strong>Renovación Automática:</strong> La suscripción se renueva automáticamente al final del periodo contratado. El cargo se procesa a través de nuestra pasarela de pagos segura (Stripe).</li>
                  <li><strong>Cancelación:</strong> El Usuario puede cancelar su suscripción en cualquier momento desde su panel de control. La cancelación será efectiva al finalizar el periodo de facturación actual. No se realizan reembolsos parciales.</li>
                  <li><strong>Renovación Anticipada:</strong> Si el Usuario agota sus créditos antes de tiempo, puede optar por renovar su plan inmediatamente, reiniciando su ciclo de facturación.</li>
                </ul>

                <h4 className="text-foreground font-semibold mt-4">6. Uso Aceptable</h4>
                <p>Queda estrictamente prohibido:</p>
                <ul className="list-disc pl-5">
                  <li>Utilizar la plataforma para fines ilícitos o no relacionados con la práctica clínica.</li>
                  <li>Intentar realizar ingeniería inversa, descompilar o acceder al código fuente de la aplicación.</li>
                  <li>Compartir las credenciales de acceso con terceros (salvo en planes diseñados para equipos con gestión de roles).</li>
                </ul>

                <h4 className="text-foreground font-semibold mt-4">7. Propiedad Intelectual</h4>
                <ul className="list-disc pl-5">
                  <li><strong>Del Software:</strong> INFORIA retiene todos los derechos de propiedad intelectual sobre el código, diseño, algoritmos y marca &quot;iNFORiA&quot;.</li>
                  <li><strong>De los Datos:</strong> El Usuario conserva la propiedad total e intelectual de los informes y datos de pacientes generados y almacenados en su Google Drive.</li>
                </ul>

                <h4 className="text-foreground font-semibold mt-4">8. Limitación de Responsabilidad</h4>
                <p>En la máxima medida permitida por la ley aplicable:</p>
                <ul className="list-disc pl-5">
                  <li>INFORIA se proporciona &quot;tal cual&quot; (as-is). No garantizamos que el servicio sea ininterrumpido o libre de errores puntuales.</li>
                  <li>INFORIA no será responsable por daños indirectos, lucro cesante o pérdida de datos derivada de fallos en servicios de terceros (Google API, OpenAI API, Stripe) o mal uso de la herramienta por parte del Usuario.</li>
                  <li>La responsabilidad total de INFORIA ante cualquier reclamación no excederá el monto pagado por el Usuario en los últimos 3 meses de servicio.</li>
                </ul>

                <h4 className="text-foreground font-semibold mt-4">9. Modificaciones</h4>
                <p>Nos reservamos el derecho de modificar estos términos para reflejar cambios legislativos o mejoras en el producto. Notificaremos al Usuario sobre cambios sustanciales a través del correo electrónico asociado a la cuenta.</p>

                <h4 className="text-foreground font-semibold mt-4">10. Ley Aplicable y Jurisdicción</h4>
                <p>Estos términos se rigen por la legislación española. Para cualquier controversia, ambas partes se someten a los juzgados y tribunales de Lleida, renunciando a cualquier otro fuero que pudiera corresponderles.</p>
              </div>
            </section>
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-2 space-y-2 sm:space-y-0 flex-col sm:flex-row bg-background border-t mt-auto">
          <div className="flex-1 text-xs text-muted-foreground mr-4 flex items-center">
            <p>
              Debes leer hasta el final para aceptar. <br/>
              Haciendo clic en &quot;Aceptar y Continuar&quot;, confirmas que has leído y aceptas nuestra Política de Privacidad y Términos de Uso.
            </p>
          </div>
          <Button 
            onClick={handleAccept} 
            disabled={!hasScrolledToBottom || isSubmitting}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isSubmitting ? "Guardando..." : "Aceptar y Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
