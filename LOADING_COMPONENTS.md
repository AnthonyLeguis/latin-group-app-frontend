# Componentes de Loading Implementados

## 1. **Spinner Global** (`spinner-global`)
### Ubicación:
`src/app/shared/components/spinner-global/`

### Uso:
```typescript
import { SpinnerGlobalComponent } from '../../shared/components/spinner-global/spinner-global';

@Component({
  imports: [SpinnerGlobalComponent]
})
```

```html
<!-- Tamaños disponibles: small, medium, large -->
<app-spinner-global size="medium"></app-spinner-global>

<!-- Colores disponibles: primary, white, red -->
<app-spinner-global color="primary"></app-spinner-global>

<!-- Ejemplo combinado -->
<app-spinner-global size="large" color="red"></app-spinner-global>
```

### Ejemplos de uso común:
```html
<!-- En un botón -->
<button [disabled]="isLoading">
  <app-spinner-global *ngIf="isLoading" size="small" color="white"></app-spinner-global>
  <span *ngIf="!isLoading">Guardar</span>
</button>

<!-- Centro de pantalla -->
<div *ngIf="isLoading" class="flex items-center justify-center min-h-screen">
  <app-spinner-global size="large"></app-spinner-global>
</div>

<!-- En una card -->
<div class="card">
  <app-spinner-global *ngIf="loading" color="primary"></app-spinner-global>
  <div *ngIf="!loading">Contenido...</div>
</div>
```

## 2. **Route Loading** (Logo Bounce)
### Ubicación:
`src/app/shared/components/route-loading/`

### Características:
- ✅ Se muestra automáticamente en cada cambio de ruta
- ✅ Logo con animación bounce suave
- ✅ Fondo gradiente rojo (red-800 to red-600)
- ✅ Se oculta cuando la ruta termina de cargar
- ✅ Transición suave de 500ms

### Configuración:
Ya está configurado globalmente en `app.ts` y se activa automáticamente.

### Flujo:
1. Usuario hace clic en enlace o navega
2. Se muestra el loading con logo bounce
3. La ruta se carga
4. Después de 500ms, el loading desaparece con fade out

## 3. **RouteLoadingService**
### Ubicación:
`src/app/core/services/route-loading.service.ts`

### Uso manual (opcional):
```typescript
constructor(private routeLoadingService: RouteLoadingService) {}

// Mostrar loading manualmente
this.routeLoadingService.show();

// Ocultar loading manualmente
this.routeLoadingService.hide();
```

## Ventajas de esta implementación:

1. **Spinner Global**: Reutilizable en cualquier parte de la app
2. **Route Loading**: Mejora la UX en transiciones de rutas
3. **Automático**: No requiere código adicional para funcionar
4. **Personalizable**: Tamaños y colores configurables
5. **Moderno**: Animaciones suaves y profesionales
6. **Performance**: Optimizado para no afectar la carga
