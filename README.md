# LatinGroupApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

# LatinGroup App — Frontend

Estado: Trabajo en progreso — No listo para producción

Este repositorio contiene la aplicación frontend de la plataforma LatinGroup. Está desarrollado con Angular (standalone components) y Tailwind CSS, y actualmente se encuentra en desarrollo activo. El objetivo de este README es documentar qué se ha implementado hasta ahora, cómo ejecutar la aplicación en desarrollo (Windows PowerShell), estructura relevante del proyecto y próximos pasos recomendados.

## Resumen de lo implementado (hasta la fecha)

- Página principal (Home) con varias secciones construidas como componentes Angular:
	- Hero (encabezado) y sección About.
	- Sección "Services": carrusel con 11 tarjetas, auto-scroll cada 5s, navegación manual y loop infinito (al llegar a la 11 vuelve a la 1 de forma suave).
	- CTA (llamada a la acción) bajo Services con una imagen que tiene efecto de zoom en hover contenido (overflow oculto en su contenedor para que no se desborde).
	- Sección "Our Team" (renombrada desde `user-types`): primera fila con 2 tarjetas de miembros del equipo y segunda fila con testimonios:
		- En pantallas pequeñas los testimonios funcionan como un carousel responsivo (auto-advance 5s, navegación manual).
		- En pantallas grandes (`lg+`) los testimonios se muestran en una grilla de 3 columnas; la grilla permite overflow visible para que el hover scale pueda sobresalir.

- Imágenes y recursos: las imágenes se alojan bajo `public/images/...` (por ejemplo `public/images/our-team/colmenarez_jose.png`). Algunas imágenes tenían fondo blanco y se optó por estilizar las imágenes como circulares vía CSS para mejorar la integración visual.

## Tecnologías principales

- Angular 20.x (standalone components)
- Tailwind CSS para utilidades de diseño
- SCSS para estilos de componentes
- Angular Material (uso mínimo: `MatIcon`, `MatButton` en algunos lugares)
- Git (repositorio local y push a GitHub)

## Estructura relevante del proyecto

Ubicación principal del frontend: `frontend/`

Rutas de interés dentro de `src/app` (ejemplos):

- `src/app/features/home/home/` — página Home y su módulo/componentes asociados
- `src/app/features/home/components/services/` — lógica y estilos del carrusel de servicios y CTA
- `src/app/features/home/components/our-team/` — tarjetas de equipo y testimonios

Además, existen carpetas típicas de una app Angular: `app/`, `assets/`, `environments/`, etc.

## Cómo ejecutar en desarrollo (Windows PowerShell)

Requisitos mínimos (previos):

- Node.js instalado (recomendado: versión LTS actual)
- Angular CLI (opcional, se puede usar `npx`)

Pasos para ejecutar la aplicación en tu entorno de desarrollo (ejecutar en PowerShell dentro de `frontend`):

```powershell
# instalar dependencias
npm install

# arrancar en modo de desarrollo (hot-reload)
npm run start
# ó
ng serve --open
```

La aplicación por defecto escucha en `http://localhost:4200/`.

Notas:
- Si aparece un error relacionado con decoradores (p. ej. `DecoratorFactory` / NG0201) o problemas de caché, prueba a limpiar la caché de Angular y reiniciar el servidor:

```powershell
ng cache clean
ng serve
```

o reinstala dependencias (a veces ayuda):

```powershell
rm -Recurse node_modules; npm install
```

## Comandos útiles

- Instalar dependencias: `npm install`
- Desarrollo: `npm run start` o `ng serve --open`
- Build producción: `ng build --configuration production`
- Tests unitarios (si están configurados): `ng test`
- Ejecutar linter (si está configurado): `ng lint`

## Detalles técnicos y decisiones de implementación

- Carrusel de "Services":
	- Implementado con un track que se desplaza vía `transform: translateX(...)` y control JS/TS del índice activo.
	- Auto-scroll cada 5 segundos usando `setInterval`, con lógica que permite un loop infinito simulando duplicación de elementos y un ``reset`` del índice sin transición para evitar saltos visibles.

- Testimonios en `Our Team`:
	- En mobile (< lg) funcionan como carrusel (overflow oculto en el contenedor para evitar que las tarjetas laterales sean visibles durante la animación).
	- En pantallas grandes se muestran en una grilla de 3 columnas; en esta vista el contenedor permite overflow visible para que el scale on hover pueda sobresalir visualmente usando `z-index` y `position: relative`.

- Imágenes del equipo: se usó CSS para dar forma circular (`border-radius: 9999px`) y ajustar tamaños responsivos; también se aplicó `image-rendering` y ajustes para reducir artefactos de borde.

## Estado del repositorio y Git

- El frontend fue inicializado como repositorio Git local en `frontend/` y se subió (push) a GitHub al repositorio `AnthonyLeguis/latin-group-app-frontend` (operación realizada fuera de este script por el autor).

## Qué falta / TODOs recomendados

- Agregar pruebas unitarias y de integración para componentes críticos (carrusel, Our Team).
- Revisiones de accesibilidad (WCAG): foco y navegación por teclado en carruseles y modales.
- Optimización de imágenes (webp, lazy-loading) para producción.
- Añadir CI (GitHub Actions) para build y tests automáticos.
- Decidir y añadir una licencia (ej. MIT) si se quiere abrir el proyecto públicamente.

## Notas finales

Este proyecto está en desarrollo activo y las piezas principales del home han sido implementadas para facilitar la iteración de diseño y UX.

Autores: Anthony Leguisamo (implementación del frontend).

Licencia: por definir (indica si quieres MIT u otra).
