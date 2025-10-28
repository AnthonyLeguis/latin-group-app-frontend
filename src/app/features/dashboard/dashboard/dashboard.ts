import { Component, OnInit, HostBinding } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarService } from '../services/sidebar.service';
import { SidebarComponent } from '../sidebar/sidebar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SidebarComponent, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  @HostBinding('class.sidebar-expanded') sidebarExpanded = true;
  @HostBinding('class.sidebar-collapsed') sidebarCollapsed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
    // Escuchar cambios en el estado del sidebar
    this.sidebarService.isExpanded$.subscribe(isExpanded => {
      this.sidebarExpanded = isExpanded;
      this.sidebarCollapsed = !isExpanded;
    });

    // Verificar si hay parámetros de Google OAuth en la URL
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        console.log('🎉 Callback de Google recibido!');
        console.log('🔑 Token:', params['token']);
        console.log('👤 User Type:', params['user_type']);
        console.log('🆔 User ID:', params['user_id']);

        // Construir el objeto de usuario completo con todos los datos necesarios
        const user = {
          id: parseInt(params['user_id']),
          type: params['user_type'],
          name: params['user_name'] || '',
          email: params['user_email'] || ''
        };

        // Guardar el token y usuario en localStorage
        this.authService.handleGoogleCallback(params['token'], user);

        console.log('✅ Sesión establecida correctamente con Google');
        console.log('📋 Usuario guardado:', user);

        // Obtener la ruta específica para el tipo de usuario y redirigir
        const redirectUrl = this.authService.getDashboardRoute();
        console.log('🚀 Redirigiendo a:', redirectUrl);

        this.router.navigate([redirectUrl], {
          replaceUrl: true
        });
      } else if (params['error']) {
        console.error('❌ Error en Google login:', params['error']);
        console.error('📋 Mensaje:', params['message']);

        // Redirigir al login con mensaje de error
        this.router.navigate(['/auth/login']);
      } else {
        // Si no hay parámetros de Google, verificar si estamos en la ruta raíz del dashboard
        // y redirigir según el tipo de usuario
        this.router.events.subscribe(() => {
          const currentUrl = this.router.url;
          // Si estamos exactamente en /dashboard sin rutas hijas, redirigir
          if (currentUrl === '/dashboard' || currentUrl === '/dashboard/') {
            const redirectUrl = this.authService.getDashboardRoute();
            console.log('🔀 Redirigiendo desde dashboard raíz a:', redirectUrl);
            this.router.navigate([redirectUrl], { replaceUrl: true });
          }
        });
      }
    });
  }

}
