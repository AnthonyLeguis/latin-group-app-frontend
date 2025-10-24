import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { RouteLoadingService } from './core/services/route-loading.service';
import { RouteLoadingComponent } from './shared/components/route-loading/route-loading';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouteLoadingComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('latin-group-app');
  private navigationStartTime: number = 0;

  // Rutas protegidas que requieren loading
  private protectedRoutes = ['/dashboard', '/application-forms', '/users', '/clients'];

  constructor(
    private router: Router,
    public routeLoadingService: RouteLoadingService
  ) {
    // Escuchar eventos de navegación para mostrar/ocultar loading
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Solo mostrar loading si se navega a una ruta protegida
        const isNavigatingToProtectedRoute = this.protectedRoutes.some(route =>
          event.url.startsWith(route)
        );

        if (isNavigatingToProtectedRoute) {
          // Mostrar loading al iniciar navegación y guardar el tiempo de inicio
          this.navigationStartTime = Date.now();
          this.routeLoadingService.show();
        }
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Solo ocultar si el loading está activo
        if (this.routeLoadingService.isShowing()) {
          // Calcular el tiempo transcurrido
          const elapsedTime = Date.now() - this.navigationStartTime;
          const minimumLoadingTime = 3000; // 3 segundos mínimo

          // Si el tiempo transcurrido es menor a 3 segundos, esperar el resto
          const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

          setTimeout(() => {
            this.routeLoadingService.hide();
          }, remainingTime);
        }
      }
    });
  }
}
