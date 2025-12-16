"use client"; // Necesario para los componentes interactivos (Accordion)

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Contenido de src/pages/FAQs.tsx
// No se requieren cambios de hooks, solo se copia el contenido

const FAQs = () => {
  const faqData = [
    {
      question: "¿Cómo se gestiona la seguridad de los datos de mis pacientes?",
      answer: "En INFORIA, la seguridad es nuestra máxima prioridad. Utilizamos un modelo de \"conocimiento cero\", lo que significa que no almacenamos los datos de tus pacientes en nuestros servidores. Toda la información se lee y escribe directamente en tu propio Google Workspace."
    },
    {
      question: "¿Qué pasa si consumo todos los informes de mi plan mensual?",
      answer: "Si agotas tu cuota de informes, tendrás la opción de \"Renovación Anticipada\" en la sección \"Mi Cuenta\". Esto te permite reiniciar tu cuota y tu ciclo de facturación de inmediato para que puedas seguir trabajando sin interrupciones."
    },
    {
      question: "¿Puedo cancelar mi suscripción en cualquier momento?",
      answer: "Sí, puedes cancelar tu suscripción en cualquier momento desde la sección \"Mi Cuenta > Suscripción y Facturación\". Tu acceso permanecerá activo hasta el final del ciclo de facturación que ya has pagado."
    }
  ];

  const videoTutorials = [
    {
      title: "Cómo crear tu primer informe en 5 minutos",
      description: "Un recorrido rápido por el Espacio de Trabajo de Sesión, desde la grabación de audio hasta la generación del informe."
    },
    {
      title: "Gestionando tu suscripción y facturas",
      description: "Aprende a cambiar de plan y a descargar tus facturas desde la sección 'Mi Cuenta'."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* NavigationHeader removed to avoid duplication */}
      
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-semibold text-foreground mb-4">
            Ayuda y Preguntas Frecuentes (FAQs)
          </h1>
        </div>

        {/* Section 1: Preguntas Frecuentes */}
        <section className="mb-16">
          {/* Header removed as per user request */}
          
          <Accordion type="single" collapsible className="space-y-2">
            {faqData.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-module-border rounded-lg bg-card px-6"
              >
                <AccordionTrigger className="font-sans text-left text-foreground hover:text-primary hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-sans text-muted-foreground pb-6 pt-0 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Section 2: Vídeos Tutoriales */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-medium text-foreground mb-6">
            Vídeos Tutoriales
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {videoTutorials.map((video, index) => (
              <Card key={index} className="border-module-border hover:shadow-md transition-calm">
                <CardHeader className="p-6">
                  {/* Video Thumbnail Placeholder */}
                  <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg mb-4">
                    <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-muted-foreground text-sm font-sans">
                        Thumbnail del Video
                      </div>
                    </div>
                  </AspectRatio>
                  
                  <CardTitle className="font-serif text-lg text-foreground">
                    {video.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="px-6 pb-6 pt-0">
                  <CardDescription className="font-sans text-muted-foreground leading-relaxed">
                    {video.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 3: Contacto */}
        <section className="text-center">
          <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
            ¿Aún necesitas ayuda?
          </h2>
          
          <p className="font-sans text-muted-foreground mb-4 leading-relaxed">
            Si no has encontrado la respuesta que buscabas, nuestro equipo de soporte está aquí para ayudarte. Escríbenos a:
          </p>
          
          <a 
            href="mailto:soporte@inforia.app"
            className="font-sans text-lg text-primary hover:text-primary/80 underline transition-calm"
          >
            soporte@inforia.app
          </a>
        </section>
      </main>
    </div>
  );
};

export default FAQs;