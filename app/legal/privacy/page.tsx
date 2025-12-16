import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Política de Privacidad de INFORIA</h1>
        <p className="text-lg text-muted-foreground">Última actualización: 15/12/2025</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p>En INFORIA, la privacidad no es una opción, es la base de nuestra arquitectura. Esta política describe cómo recopilamos, usamos y protegemos tu información y la de tus pacientes al utilizar nuestro software de asistencia clínica bajo el modelo de &quot;Zero-Knowledge&quot; (Cero Conocimiento).</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">1. Responsable del Tratamiento</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identidad:</strong> INFORIA</li>
            <li><strong>NIF:</strong> 43726721H</li>
            <li><strong>Dirección:</strong> Mayor, 11; 25560, SORT, Lleida</li>
            <li><strong>Email de contacto:</strong> <a href="mailto:inforia@inforia.pro" className="text-primary hover:underline">inforia@inforia.pro</a></li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">2. Qué datos recopilamos</h2>
          <p>Recopilamos únicamente la información necesaria para prestar el servicio técnico:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Datos de Cuenta (Profesional):</strong> Nombre, correo electrónico y credenciales de autenticación gestionadas de forma segura.</li>
            <li><strong>Datos de Facturación:</strong> Información necesaria para gestionar tu suscripción (procesada por Stripe). INFORIA no almacena números de tarjeta de crédito completos.</li>
            <li><strong>Datos de Google User:</strong> Para el funcionamiento de la integración, accedemos a tu email y perfil básico de Google para verificar tu identidad.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">3. Arquitectura &quot;Zero-Knowledge&quot; y Datos Clínicos</h2>
          <p>INFORIA se distingue por su arquitectura de privacidad por diseño:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Soberanía del Dato (Google Drive):</strong> Los informes clínicos (Google Docs) y las fichas de pacientes (Google Sheets) nunca se almacenan en las bases de datos de INFORIA. Estos archivos residen exclusivamente en tu cuenta de Google Drive.</li>
            <li><strong>INFORIA como Pasarela:</strong> Actuamos como un procesador transitorio. Cuando utilizas el motor de informes o el CRM, nuestra aplicación lee y escribe datos directamente en tu Google Drive sin retener copias permanentes en nuestros servidores.</li>
            <li><strong>Procesamiento de Audio y Texto:</strong> Los audios de las sesiones y las notas transcritas se procesan de forma encriptada y asíncrona para generar los informes. Una vez generado el documento en tu Drive, los datos temporales de procesamiento son eliminados. No utilizamos tus datos clínicos para entrenar modelos públicos de IA.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">4. Uso de APIs de Google (Cláusula de Uso Limitado)</h2>
          <p>El uso y la transferencia de la información recibida de las APIs de Google a cualquier otra aplicación cumplirán con la Política de Datos de Usuario de los Servicios de API de Google, incluidos los requisitos de &quot;Uso Limitado&quot;.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Alcance del Acceso:</strong> INFORIA solicita acceso a tu Google Drive (drive.file) únicamente para crear, editar y organizar los archivos generados por la aplicación (Informes y Hojas de Cálculo).</li>
            <li><strong>No Lectura General:</strong> No accedemos, leemos ni analizamos archivos de tu Google Drive que no hayan sido creados por o vinculados explícitamente a INFORIA.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">5. Finalidad del tratamiento</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Proveer el servicio de asistente clínico (transcripción, generación de informes y gestión de calendario).</li>
            <li>Gestionar el ciclo de vida de la suscripción y la facturación.</li>
            <li>Enviar notificaciones transaccionales importantes (ej. confirmaciones de alta, renovaciones).</li>
            <li>Proveer soporte técnico a través de nuestro Módulo de Soporte.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">6. Compartición con Terceros (Infraestructura Técnica)</h2>
          <p>Para garantizar la máxima seguridad y funcionalidad, utilizamos proveedores de infraestructura de primer nivel:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Supabase (AWS):</strong> Gestión de autenticación y base de datos de usuarios (no clínica).</li>
            <li><strong>Vercel:</strong> Alojamiento de la aplicación y funciones serverless.</li>
            <li><strong>OpenRouter / OpenAI:</strong> Procesamiento de lenguaje natural para transcripción (Whisper) y redacción (GPT-4o mini). Los datos se envían de forma anónima y no se usan para entrenamiento.</li>
            <li><strong>Stripe:</strong> Pasarela de pagos segura (PCI-DSS Nivel 1).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">7. Tus Derechos</h2>
          <p>De acuerdo con el RGPD, tienes derecho a acceder, rectificar, suprimir, limitar u oponerte al tratamiento de tus datos personales. Dado que los datos clínicos están en tu propio Google Drive, tienes control total e inmediato sobre ellos. Para ejercer derechos sobre tus datos de cuenta en INFORIA, escríbenos a <a href="mailto:inforia@inforia.pro" className="text-primary hover:underline">inforia@inforia.pro</a>.</p>
        </section>
      </div>
    </div>
  );
}
