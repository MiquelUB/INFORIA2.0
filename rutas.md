1. Conceptos Fundamentales de Estructura
El App Router opera bajo el principio de que las carpetas definen los segmentos de la URL y los archivos definen la UI (Interfaz de Usuario) que se muestra para esos segmentos.
• Segmentos de URL: Se definen mediante carpetas anidadas dentro del directorio app. Por ejemplo, crear una carpeta llamada blog dentro de app crea el segmento de ruta /blog.
• Ruta Pública: Una ruta se vuelve accesible públicamente cuando existe un archivo page.js/.tsx o route.js/.ts dentro de ese segmento de carpeta.
2. Archivos Especiales de Enrutamiento
Next.js utiliza nombres de archivos específicos para definir el comportamiento y la estructura de la UI de las rutas. Solo los archivos con estos nombres especiales se convierten en rutas de la aplicación.
Archivo
Función Principal
page.js/.tsx
Define una página que se renderiza en una ruta específica y es el punto de entrada para que una ruta sea pública. Recibe parámetros (params) y devuelve la UI.
layout.js/.tsx
Define la UI que es compartida entre múltiples páginas (o layouts anidados). Actúa como un skeleton o envoltorio (wrapper) alrededor de la aplicación o una sección de ella. El root layout (en app/layout.tsx) es requerido y debe contener las etiquetas <html> y <body>.
loading.js/.tsx
Permite definir una pantalla de carga (UI de esqueletos) que se muestra mientras una página o segmento está suspendido (mientras se cargan datos). Está construido sobre React Suspense.
error.js/.tsx
Define una página de error que se muestra en caso de fallos del lado del servidor o en un layout. Los componentes de error deben ser Client Components (por defecto) ya que manejan interacciones como el reinicio (reset) del error boundary.
route.js/.ts
Define un Route Handler (un endpoint de API) que se ejecuta en el servidor y devuelve datos usando un objeto Response.
not-found.js/.tsx
Define la UI que se muestra cuando una ruta no se encuentra (404).
template.js/.tsx
Similar a un layout, pero su contenido se re-renderiza en la navegación, a diferencia de los layouts que persisten el estado.
3. Tipos de Rutas
Rutas Anidadas (Nested Routes)
Las rutas anidadas se crean al anidar carpetas. Los layouts en la jerarquía de carpetas también se anidan, envolviendo los layouts o páginas hijas a través de la prop children.
Ejemplo de anidación: Si tienes la ruta /blog/authors, la estructura de archivos será app/blog/authors/page.tsx.
Rutas Dinámicas (Dynamic Routes)
Las rutas dinámicas permiten generar múltiples páginas a partir de datos (ej: páginas de productos o publicaciones de blog).
• Definición: Se crean envolviendo el nombre del segmento (carpeta) en corchetes.
• Acceso a Parámetros: La página o layout dentro del segmento dinámico recibirá una prop llamada params que contiene los valores de los parámetros de la URL.
Patrón de Ruta
Uso
Ejemplo de URL
[segment]
Parámetro simple (ej: ID de un restaurante o slug de un post).
/blog/mi-primer-post (si el archivo es app/blog/[slug]/page.tsx).
[...segment]
Catch-all (Captura todos los segmentos posteriores).
/shop/ropa/camisas (si el archivo es app/shop/[...slug]/page.tsx).
[[...segment]]
Optional Catch-all (Captura todos los segmentos, opcionalmente).
/docs o /docs/layouts-y-pages (si el archivo es app/docs/[[...slug]]/page.tsx).
4. Organización de Proyectos
Next.js es flexible respecto a cómo organizar los archivos del proyecto.
Colocación de Archivos (Colocation)
Puedes colocar archivos de código (como componentes, utilidades o lógica de datos) dentro de los segmentos de ruta en el directorio app. Estos archivos son seguros de colocar ahí porque una ruta solo es accesible públicamente si contiene un archivo page.js o route.js.
• Uso: Si un componente (ej: RestaurantCard) solo es relevante para una página específica, puedes colocarlo cerca de esa página, aunque todavía esté dentro del directorio app.
Carpetas Privadas (Private Folders)
Se definen anteponiendo un guion bajo (_) al nombre de la carpeta (ej: _components).
• Propósito: Indican que la carpeta es un detalle de implementación privada y no debe ser considerada por el sistema de enrutamiento. Son útiles para organizar lógica de UI o evitar conflictos con futuras convenciones de nombres de Next.js.
Grupos de Rutas (Route Groups)
Se definen envolviendo una carpeta entre paréntesis (ej: (marketing) o (shop)).
• Propósito: Permiten organizar las rutas por secciones o equipos sin que el nombre de la carpeta se incluya en la URL.
• Beneficios: Facilitan la aplicación de layouts anidados a un subconjunto de rutas, o incluso crear múltiples root layouts. Por ejemplo, puedes definir un layout específico solo para las rutas dentro de (marketing).
Rutas Paralelas (Parallel Routes)
Se utilizan para patrones de UI específicos, como layouts basados en slots, y se definen usando el patrón @slot (ej: @analytics). Estas ranuras son renderizadas por un layout padre.

--------------------------------------------------------------------------------
Analogía: Puedes pensar en la estructura de rutas de Next.js como la organización de una biblioteca:
• Carpetas: Son las estanterías (como "Ficción", "Ciencia"). Definen el camino para encontrar un libro.
• Archivo page.js: Es el libro real. Una estantería no se considera completa y accesible hasta que hay un libro (page.js) dentro.
• Archivo layout.js: Es el diseño de la estantería (o la sala de lectura) que envuelve el contenido, asegurando que todos los libros en esa sección compartan el mismo estilo o cubierta.
• Rutas Dinámicas ([slug]): Son etiquetas flexibles que indican que en esa sección caben muchos libros similares (ej: "Novelas de [Autor]").
• Grupos de Rutas ((marketing)): Son áreas organizativas internas de la biblioteca que no aparecen en el mapa oficial que ve el público, pero ayudan al personal a mantener las secciones separadas y ordenadas.