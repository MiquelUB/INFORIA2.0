Efectos Neumórficos Clave El sistema define tres efectos base, creados mediante
sombras CSS específicas, que dictan el aspecto y la función de los elementos de
la interfaz:

1. neu-flat (Plano): Se utiliza para botones y elementos normales. Este efecto
   genera una sombra que da una apariencia plana o ligeramente elevada.
2. neu-pressed (Hundido): Este efecto crea una apariencia hundida o activa
   mediante sombras interiores (inset). Se utiliza típicamente para campos de
   entrada (NeuInput) y elementos activos.
3. neu-convex (Convexo/Destacado): Se usa para tarjetas o contenedores que se
   quieren destacar. Ejemplos de su aplicación incluyen las tarjetas de planes
   de precios o el formulario del Lead Magnet. Componentes de Interfaz
   Neumórficos Para mantener la coherencia visual, se desarrollaron tres
   Componentes UI Base Reutilizables que aplican estos efectos: • NeuCard: Es el
   contenedor neumórfico con bordes redondeados (30px por defecto) que puede
   adoptar los tres estilos (flat, pressed o convex). • NeuButton: Botones que
   incorporan transiciones suaves y efectos de presión realistas, disponibles en
   5 variantes (como primary, accent o ghost) y 4 tamaños. • NeuInput: Campos de
   entrada diseñados con el estilo hundido (shadow-neu-pressed) para mejorar la
   accesibilidad. El uso del diseño neumórfico, junto con los colores cálidos,
   contribuye a la identidad de marca de INFORIA, la cual busca ser empática,
   fiable, sencilla y potente, reflejando la dualidad del arquetipo "Mentor". El
   diseño neumórfico (Neumorphism) se aplica en el proyecto INFORIA como el
   "Neumorfismo Orgánico", el cual forma parte de la identidad visual de la
   plataforma. Características y Aplicación del Diseño Neumórfico en INFORIA:
4. Estilo Visual y Tangibilidad: El neumorfismo combina el skeuomorphism con el
   minimalismo. Se caracteriza por el uso de sombras suaves (como neu-flat,
   neu-pressed y neu-convex) y paletas de colores de bajo contraste para crear
   un efecto táctil tridimensional. Los elementos de la interfaz parecen
   hundirse o elevarse suavemente del fondo. El objetivo es ofrecer una interfaz
   moderna, limpia y tangible.
5. Paleta de Colores: La paleta de colores premium de INFORIA está diseñada para
   soportar esta estética, utilizando el color Blanco Hueso (#FBF9F6) como base,
   con acentos en verde, burdeos y dorado.
6. Experiencia de Usuario (UX): La aplicación incluye interacciones con
   retroalimentación visual que utilizan cambios en la profundidad neumórfica
   para los estados hover y active.
7. Componentes Específicos: Este estilo se aplica a elementos cruciales de la
   interfaz, como los botones neumórficos de alta visibilidad utilizados en la
   estrategia de Call to Action (CTA) y ubicados en puntos clave como el
   encabezado, la sección Hero, el Pricing y el pie de página (Footer). Cabe
   destacar que, aunque el neumorfismo ofrece un aspecto moderno y calmante, las
   tendencias de diseño señalan que puede presentar desafíos de accesibilidad
   debido a su inherente bajo contraste. Implementación Técnica: Este estilo
   visual se implementa usando herramientas modernas, donde se utiliza Tailwind
   CSS v4 junto con PostCSS v4, lo que permite una configuración avanzada de
   sombras y temas. También se han definido componentes base reutilizables
   (NeuButton, NeuCard, NeuInput) para mantener la coherencia del diseño
   neumórfico en toda la aplicación.
