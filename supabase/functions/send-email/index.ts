/// <reference lib="deno.window" />
// Usamos Deno.serve nativo en lugar de importar desde std
import { corsHeaders } from "../_shared/cors.ts";

interface EmailRequest {
  to: string;
  subject: string;
  templateName?: string;
  html?: string;
  variables?: Record<string, unknown>;
}

const generateLowCreditsEmailHTML = (creditsRemaining: number, renewalUrl: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #ff9500;
            margin: 0;
            font-size: 24px;
          }
          .content {
            margin-bottom: 30px;
          }
          .content p {
            margin: 12px 0;
            font-size: 16px;
          }
          .highlight {
            background-color: #fff3cd;
            padding: 20px;
            border-left: 4px solid #ff9500;
            margin: 20px 0;
            border-radius: 4px;
          }
          .credits-info {
            font-size: 24px;
            font-weight: bold;
            color: #ff9500;
            text-align: center;
          }
          .cta-button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-top: 20px;
          }
          .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            font-size: 14px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Alerta: Créditos Bajos</h1>
          </div>
          
          <div class="content">
            <p>Hola,</p>
            
            <p>Te escribimos para informarte que <strong>este mes has trabajado a tope</strong> con iNFORiA. ¡Felicidades por tu productividad! 🎉</p>
            
            <div class="highlight">
              <div class="credits-info">Te quedan ${creditsRemaining} informes</div>
              <p style="margin: 10px 0 0 0; text-align: center; font-size: 14px;">
                Antes de que se acaben tus créditos, considera renovar tu plan.
              </p>
            </div>
            
            <p>Puedes renovar tu plan en cualquier momento accediendo a la sección <strong>"Mi Cuenta"</strong> en la zona de <strong>"Suscripción y Facturación"</strong>.</p>
            
            <p>Si tienes dudas o necesitas ayuda, no dudes en contactarnos.</p>
            
            <a href="${renewalUrl}" class="cta-button">Renovar Plan Ahora</a>
          </div>
          
          <div class="footer">
            <p>© 2025 iNFORiA. Todos los derechos reservados.</p>
            <p>Este es un mensaje automatizado. Por favor, no respondas a este correo.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

Deno.serve(async (req) => {
  // Manejo de CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    const { to, subject, templateName, html, variables } = body;

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let emailContent = html;

    // Si se especifica un template, generarlo
    if (templateName === "low-credits-alert" && variables) {
      const creditsRemaining = typeof variables.creditsRemaining === 'number' 
        ? variables.creditsRemaining 
        : 0;
      const renewalUrl = typeof variables.renewalUrl === 'string' 
        ? variables.renewalUrl 
        : '#';
      emailContent = generateLowCreditsEmailHTML(
        creditsRemaining,
        renewalUrl
      );
    }

    if (!emailContent) {
      return new Response(
        JSON.stringify({ error: "No email content provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Obtener configuración de email
    const emailProvider = Deno.env.get("EMAIL_PROVIDER") || "smtp";
    const fromEmail = Deno.env.get("EMAIL_FROM_ADDRESS");
    
    if (!fromEmail) {
      throw new Error("EMAIL_FROM_ADDRESS no está configurada");
    }

    let result;

    if (emailProvider === "smtp") {
      // Usar SMTP directo (recomendado para tu dominio personalizado)
      result = await sendWithSMTP(to, subject, emailContent, fromEmail);
    } else {
      // Fallback a Resend si está configurado
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        throw new Error("No email provider configured");
      }
      result = await sendWithResend(to, subject, emailContent, fromEmail, resendApiKey);
    }

    console.log("✅ Email enviado exitosamente:", result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId || result.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error en send-email function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Función para enviar con SMTP directo
async function sendWithSMTP(
  to: string,
  subject: string,
  html: string,
  from: string
) {
  const smtpHost = Deno.env.get("SMTP_HOST");
  const _smtpPort = Deno.env.get("SMTP_PORT") || "587";
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");

  if (!smtpHost || !smtpUser || !smtpPassword) {
    throw new Error("SMTP credentials no están configuradas (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)");
  }

  // Usar SendGrid API como alternativa si prefieres API REST
  const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
  
  if (sendgridApiKey) {
    // SendGrid permite enviar desde tu dominio personalizado
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: { email: from },
        content: [
          {
            type: "text/html",
            value: html,
          },
        ],
      }),
    });

    if (response.status !== 202) {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }

    const messageId = response.headers.get("X-Message-Id") || "unknown";
    return { messageId, provider: "sendgrid" };
  }

  // Si no está SendGrid, informar al usuario
  throw new Error("SMTP directo requiere configuración manual. Use SendGrid API en su lugar.");
}

// Función para enviar con Resend
async function sendWithResend(
  to: string,
  subject: string,
  html: string,
  from: string,
  resendApiKey: string
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  return result;
}
