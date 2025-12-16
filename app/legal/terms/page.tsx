import React from 'react';

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-12 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Términos y Condiciones de Uso de INFORIA</h1>
        <p className="text-lg text-muted-foreground">Fecha de entrada en vigor: 15 de diciembre de 2025</p>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p>Bienvenido a INFORIA. Al registrarte y acceder a nuestro software, aceptas vincularte legalmente a los presentes Términos y Condiciones. Por favor, léelos detenidamente.</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">1. Información Legal e Identificación</h2>
          <p>El servicio es operado por:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Titular:</strong> INFORIA (en adelante, &quot;La Plataforma&quot; o &quot;Nosotros&quot;).</li>
            <li><strong>NIF:</strong> 43726721H</li>
            <li><strong>Domicilio Social:</strong> Mayor, 11; 25560, SORT, Lleida.</li>
            <li><strong>Contacto:</strong> <a href="mailto:inforia@inforia.pro" className="text-primary hover:underline">inforia@inforia.pro</a></li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">2. Descripción del Servicio</h2>
          <p>INFORIA es un software como servicio (SaaS) diseñado como Asistente Clínico con Inteligencia Artificial para psicólogos y profesionales de la salud mental. Nuestra herramienta permite:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Transcribir sesiones de audio a texto de forma segura.</li>
            <li>Generar borradores de informes clínicos, resúmenes y sugerencias diagnósticas (basadas en CIE-10/DSM-5) mediante modelos de IA.</li>
            <li>Gestionar citas y expedientes básicos de pacientes.</li>
          </ul>
          
          <div className="bg-muted p-4 rounded-lg border border-border mt-4">
            <h3 className="font-semibold mb-2">Descargo de Responsabilidad (Disclaimer) sobre IA</h3>
            <p className="text-sm">INFORIA es una herramienta de apoyo administrativo y documental, no un sustituto del juicio clínico profesional.</p>
            <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
              <li>La IA genera sugerencias basadas en la información proporcionada.</li>
              <li>El Usuario (Profesional) es el único responsable de revisar, editar y validar el contenido de los informes antes de firmarlos o entregarlos.</li>
              <li>INFORIA no ofrece diagnósticos médicos automatizados ni tratamientos directos a pacientes.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">3. Arquitectura &quot;Zero-Knowledge&quot; y Responsabilidad de Datos</h2>
          <p>El Usuario reconoce y acepta que INFORIA opera bajo un modelo de &quot;Cero Conocimiento&quot;:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Almacenamiento:</strong> Los datos clínicos sensibles (informes, fichas de pacientes) se almacenan directamente en la cuenta de Google Drive del Usuario, no en los servidores de INFORIA.</li>
            <li><strong>Copias de Seguridad:</strong> Dado que INFORIA no custodia los archivos finales, es responsabilidad exclusiva del Usuario gestionar la seguridad, acceso y copias de seguridad de su propia cuenta de Google Drive.</li>
            <li><strong>Pérdida de Acceso:</strong> INFORIA no puede recuperar datos si el Usuario pierde el acceso a su cuenta de Google o elimina los archivos accidentalmente en su Drive.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">4. Registro y Requisitos Técnicos</h2>
          <p>Para utilizar el servicio, el Usuario debe:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ser un profesional de la salud o institución legalmente habilitada.</li>
            <li>Disponer de una cuenta de Google activa (necesaria para la autenticación y almacenamiento).</li>
            <li>Autorizar los permisos técnicos necesarios (scopes) para que la aplicación interactúe con su Google Drive y Calendario.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">5. Suscripciones, Pagos y Facturación</h2>
          <p>El acceso a INFORIA se rige por un modelo de suscripción (mensual o anual).</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cuotas de Informes:</strong> Cada plan incluye un límite de créditos/informes mensuales (ej. 100 informes en el Plan PRO). El servicio no es ilimitado a menos que se especifique lo contrario.</li>
            <li><strong>Renovación Automática:</strong> La suscripción se renueva automáticamente al final del periodo contratado. El cargo se procesa a través de nuestra pasarela de pagos segura (Stripe).</li>
            <li><strong>Cancelación:</strong> El Usuario puede cancelar su suscripción en cualquier momento desde su panel de control. La cancelación será efectiva al finalizar el periodo de facturación actual. No se realizan reembolsos parciales.</li>
            <li><strong>Renovación Anticipada:</strong> Si el Usuario agota sus créditos antes de tiempo, puede optar por renovar su plan inmediatamente, reiniciando su ciclo de facturación.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">6. Uso Aceptable</h2>
          <p>Queda estrictamente prohibido:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Utilizar la plataforma para fines ilícitos o no relacionados con la práctica clínica.</li>
            <li>Intentar realizar ingeniería inversa, descompilar o acceder al código fuente de la aplicación.</li>
            <li>Compartir las credenciales de acceso con terceros (salvo en planes diseñados para equipos con gestión de roles).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">7. Propiedad Intelectual</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Del Software:</strong> INFORIA retiene todos los derechos de propiedad intelectual sobre el código, diseño, algoritmos y marca &quot;iNFORiA&quot;.</li>
            <li><strong>De los Datos:</strong> El Usuario conserva la propiedad total e intelectual de los informes y datos de pacientes generados y almacenados en su Google Drive.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">8. Limitación de Responsabilidad</h2>
          <p>En la máxima medida permitida por la ley aplicable:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>INFORIA se proporciona &quot;tal cual&quot; (as-is). No garantizamos que el servicio sea ininterrumpido o libre de errores puntuales.</li>
            <li>INFORIA no será responsable por daños indirectos, lucro cesante o pérdida de datos derivada de fallos en servicios de terceros (Google API, OpenAI API, Stripe) o mal uso de la herramienta por parte del Usuario.</li>
            <li>La responsabilidad total de INFORIA ante cualquier reclamación no excederá el monto pagado por el Usuario en los últimos 3 meses de servicio.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">9. Modificaciones</h2>
          <p>Nos reservamos el derecho de modificar estos términos para reflejar cambios legislativos o mejoras en el producto. Notificaremos al Usuario sobre cambios sustanciales a través del correo electrónico asociado a la cuenta.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">10. Ley Aplicable y Jurisdicción</h2>
          <p>Estos términos se rigen por la legislación española. Para cualquier controversia, ambas partes se someten a los juzgados y tribunales de Lleida, renunciando a cualquier otro fuero que pudiera corresponderles.</p>
        </section>
      </div>
    </div>
  );
}
