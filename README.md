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

### 🏠 Página principal (Home)
- Página principal (Home) con varias secciones construidas como componentes Angular:
	- Hero (encabezado) y sección About.
	- Sección "Services": carrusel con 11 tarjetas, auto-scroll cada 5s, navegación manual y loop infinito (al llegar a la 11 vuelve a la 1 de forma suave).
	- CTA (llamada a la acción) bajo Services con una imagen que tiene efecto de zoom en hover contenido (overflow oculto en su contenedor para que no se desborde).
	- Sección "Our Team" (renombrada desde `user-types`): primera fila con 2 tarjetas de miembros del equipo y segunda fila con testimonios:
		- En pantallas pequeñas los testimonios funcionan como un carousel responsivo (auto-advance 5s, navegación manual).
		- En pantallas grandes (`lg+`) los testimonios se muestran en una grilla de 3 columnas; la grilla permite overflow visible para que el hover scale pueda sobresalir.

- Imágenes y recursos: las imágenes se alojan bajo `public/images/...` (por ejemplo `public/images/our-team/colmenarez_jose.png`). Algunas imágenes tenían fondo blanco y se optó por estilizar las imágenes como circulares vía CSS para mejorar la integración visual.

### 🔐 Sistema de Autenticación
- Login con validación de credenciales
- Registro de nuevos usuarios (solo para admins)
- Guard de autenticación para rutas protegidas
- Manejo de roles (Admin, Agent, Client)
- Interceptor HTTP para tokens JWT

### 📊 Dashboard (Panel de Control)
- **Sidebar responsivo** con navegación por roles
- **Estadísticas generales**: usuarios, admins, agentes, clientes, planillas pendientes/activas
- **Gestión de Usuarios**: crear, editar y listar usuarios con filtros por rol
- **Gestión de Clientes**: crear y administrar clientes asignados a agentes
- **Reporte de Agentes**: 
	- Vista expandible de agentes con sus clientes asignados
	- Listado de planillas de aplicación por cliente
	- Tooltips modernos con Tailwind CSS
	- Búsqueda y filtrado en tiempo real
	- Click en planillas para ver detalles y modificar estado

### 📋 Sistema de Planillas de Aplicación
- **Modal de Detalle de Planilla** (`FormDetailModalComponent`):
	- Vista completa de datos del aplicante, seguro, póliza y agente
	- Formulario para actualizar estado (pendiente, activo, inactivo, rechazado)
	- Skeleton loader durante carga
	- Manejo de errores con opción de reintentar
	- Notificaciones con snackbar
	- Solo admins pueden cambiar el estado
	
- **Modal de Listado de Planillas** (`FormsListModalComponent`):
	- Lista filtrada por estado (pendientes o activas)
	- Diseño accordion para fácil navegación
	- Click en cada planilla abre el modal de detalle
	- Skeleton loader y manejo de errores

- **Nueva Cotización** (`NewQuoteComponent`) - ✨ **NUEVO**:
	- Ruta: `/dashboard/new-quote`
	- Formulario multi-paso usando Material Stepper
	- **Paso 1**: Selección de cliente (solo clientes sin planilla)
		- Admins ven todos los clientes disponibles
		- Agentes solo ven sus propios clientes
	- **Paso 2**: Información del Aplicante
	- **Paso 3**: Información del Seguro
	- **Paso 4**: Información de la Póliza
	- **Paso 5**: Personas Adicionales (hasta 4 personas)
	- **Paso 6**: Información de Pago
	- **Paso 7**: Revisión y Confirmación
	- Diseño moderno y responsive con paleta roja (#dc2626)
	- Validaciones en tiempo real
	- Skeleton loader durante envío
	- Navegación entre pasos con stepper visual

### 🎨 Diseño y UX
- **Paleta de colores corporativa**: Rojo (#dc2626) como color principal
- **Tooltips personalizados**: Implementados con Tailwind CSS (reemplazo de matTooltip)
- **Diseño profesional y compacto**: Espaciado reducido, tipografía clara
- **Responsive**: Grid auto-fit para estadísticas, diseño adaptable a móviles
- **Estados de carga**: Skeleton loaders en todas las vistas críticas
- **Manejo de errores**: Mensajes claros con opciones de reintento

## Tecnologías principales

- Angular 20.x (standalone components)
- Tailwind CSS para utilidades de diseño
- SCSS para estilos de componentes
- Angular Material (uso mínimo: `MatIcon`, `MatButton` en algunos lugares)
- Git (repositorio local y push a GitHub)

## Estructura relevante del proyecto

Ubicación principal del frontend: `frontend/`

Rutas de interés dentro de `src/app` (ejemplos):

### 📁 Features (Funcionalidades principales)
```
src/app/features/
├── home/                           # Página de inicio pública
│   ├── home/                       # Componente principal del home
│   └── components/
│       ├── services/               # Carrusel de servicios
│       └── our-team/               # Equipo y testimonios
│
├── auth/                           # Autenticación
│   ├── login/                      # Página de login
│   └── register/                   # Registro de usuarios
│
└── dashboard/                      # Panel de control (protegido)
    ├── dashboard/                  # Layout principal del dashboard
    ├── components/
    │   ├── agents-report/          # Reporte de agentes y planillas
    │   ├── create-client/          # Formulario crear cliente
    │   ├── create-user/            # Formulario crear usuario
    │   ├── form-detail-modal/      # Modal detalle de planilla
    │   ├── forms-list-modal/       # Modal lista de planillas
    │   ├── new-quote/              # ✨ Nueva cotización (multi-paso)
    │   └── users-list/             # Listado de usuarios
    └── sidebar/                    # Navegación lateral
```

### 🔧 Core (Servicios y utilidades)
```
src/app/core/
├── guards/
│   └── auth.guard.ts               # Protección de rutas
├── interceptors/
│   └── auth.interceptor.ts         # Inyección de tokens JWT
├── interfaces/
│   ├── user.interface.ts           # Interfaz de Usuario
│   └── application-form.interface.ts # Interfaz de Planilla (100+ campos)
└── services/
    ├── auth.service.ts             # Autenticación y sesión
    ├── user.service.ts             # CRUD de usuarios
    ├── client.service.ts           # Gestión de clientes
    └── application-form.service.ts # CRUD de planillas
```

### 🧩 Shared (Componentes compartidos)
```
src/app/shared/
├── components/
│   └── form-skeleton/              # Skeleton loader reutilizable
└── ...
```

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

### 🎠 Carrusel de "Services"
- Implementado con un track que se desplaza vía `transform: translateX(...)` y control JS/TS del índice activo.
- Auto-scroll cada 5 segundos usando `setInterval`, con lógica que permite un loop infinito simulando duplicación de elementos y un ``reset`` del índice sin transición para evitar saltos visibles.

### 💬 Testimonios en `Our Team`
- En mobile (< lg) funcionan como carrusel (overflow oculto en el contenedor para evitar que las tarjetas laterales sean visibles durante la animación).
- En pantallas grandes se muestran en una grilla de 3 columnas; en esta vista el contenedor permite overflow visible para que el scale on hover pueda sobresalir visualmente usando `z-index` y `position: relative`.

### 👤 Imágenes del equipo
- Se usó CSS para dar forma circular (`border-radius: 9999px`) y ajustar tamaños responsivos; también se aplicó `image-rendering` y ajustes para reducir artefactos de borde.

### 📋 Sistema de Planillas (Application Forms)
- **Interfaz TypeScript completa**: 100+ propiedades incluyendo:
	- Datos del aplicante (nombre, apellido, SSN, licencia, etc.)
	- Información del seguro (compañía, cobertura, límites, etc.)
	- Información de la póliza (número, fechas, estado, etc.)
	- Hasta 4 personas adicionales con datos completos
	- Métodos de pago (efectivo, cheque, tarjeta de crédito/débito)
	- Historial de cambios de estado

- **Backend Integration**:
	- Endpoint: `POST /api/v1/application-forms`
	- Validación: Solo agentes pueden crear planillas
	- Verificación automática: El cliente no debe tener ya una planilla activa
	- Estados disponibles: `pendiente`, `activo`, `inactivo`, `rechazado`
	- Permisos: Solo admins pueden cambiar el estado de las planillas

### 🎨 Diseño y Estilos
- **Paleta de colores**: Rojo corporativo `#dc2626` como color principal
- **Tooltips custom**: Implementados con Tailwind CSS usando:
	- `group` y `group-hover` para interactividad
	- Posicionamiento absoluto con `absolute`, `bottom-full`, `left-1/2`
	- Transformaciones para centrado: `-translate-x-1/2`
	- Flechas decorativas con pseudo-elementos y bordes CSS
	- `z-index: 50` para asegurar visibilidad sobre otros elementos
	- Transiciones suaves con `transition-opacity duration-200`

- **Grid responsivo**: 
	- `grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))`
	- Permite distribución equitativa de tarjetas estadísticas

### ⚡ Optimizaciones y Buenas Prácticas
- **ExpressionChangedAfterItHasBeenCheckedError**: Resuelto usando `ngOnInit()` con `setTimeout(() => {...}, 0)` para cargas de datos
- **Skeleton loaders**: Implementados con `width: 100%` para evitar anchos inconsistentes
- **Manejo de errores**: 
	- Try-catch en todas las llamadas HTTP
	- Mensajes de error amigables con opción de reintentar
	- Logging en consola para debugging
- **RxJS Patterns**: Uso correcto de observables con manejo de errores y completado
- **Material Design Overrides**: Uso de `::ng-deep` para personalizar componentes Material con overflow visible (tooltips)

## Estado del repositorio y Git

- El frontend fue inicializado como repositorio Git local en `frontend/` y se subió (push) a GitHub al repositorio `AnthonyLeguis/latin-group-app-frontend` (operación realizada fuera de este script por el autor).

## Qué falta / TODOs recomendados

### 🔄 Funcionalidades pendientes
- [ ] Completar implementación del formulario de "Nueva Cotización"
- [ ] Agregar validaciones avanzadas en formularios multi-paso
- [ ] Implementar vista de "Mis Cotizaciones" para agentes
- [ ] Dashboard de métricas y reportes visuales (gráficos)
- [ ] Sistema de notificaciones en tiempo real
- [ ] Exportación de planillas a PDF
- [ ] Búsqueda avanzada con filtros múltiples
- [ ] Historial de cambios en planillas

### 🧪 Testing
- [ ] Agregar pruebas unitarias para servicios críticos
- [ ] Pruebas de integración para componentes de formularios
- [ ] Pruebas E2E para flujos principales (login, crear planilla, etc.)
- [ ] Cobertura de código >80%

### ♿ Accesibilidad
- [ ] Revisiones WCAG 2.1 AA compliance
- [ ] Navegación completa por teclado en carruseles y modales
- [ ] Screen reader optimization
- [ ] ARIA labels en todos los componentes interactivos

### 🚀 Optimización y Performance
- [ ] Lazy loading de módulos por feature
- [ ] Optimización de imágenes (webp, lazy-loading)
- [ ] Bundle size analysis y reducción
- [ ] Service Workers para PWA
- [ ] Caché strategies para datos frecuentes

### 🔧 DevOps y CI/CD
- [ ] GitHub Actions para build automático
- [ ] Tests automáticos en CI
- [ ] Linting y formatting en pre-commit hooks
- [ ] Deploy automático a staging/production
- [ ] Monitoring y error tracking (Sentry, etc.)

### 📝 Documentación
- [ ] Documentación de componentes con ejemplos
- [ ] Guía de contribución
- [ ] Decidir y añadir licencia (MIT u otra)
- [ ] Storybook para componentes compartidos

## Notas finales

Este proyecto está en desarrollo activo. Se han implementado las piezas principales de la aplicación incluyendo:
- ✅ Sistema completo de autenticación y autorización
- ✅ Dashboard profesional con gestión de usuarios y clientes
- ✅ Sistema de planillas de aplicación con modales y reportes
- ✅ Nueva funcionalidad de cotización multi-paso
- ✅ Diseño moderno, responsive y profesional

### 👨‍💻 Equipo
- **Desarrollo Frontend**: Anthony Leguisamo
- **Arquitectura Backend**: Laravel 11 API REST
- **Diseño UX/UI**: Paleta corporativa roja, Tailwind CSS + Material Design

### 📞 Contacto
Para preguntas sobre el proyecto, contacta al equipo de desarrollo.

### 📄 Licencia
Por definir (sugerencia: MIT para proyectos open-source)

---

**Última actualización**: 28 de octubre de 2025  
**Versión Angular**: 20.3.6  
**Estado**: 🚧 En desarrollo activo
