import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SidebarComponent, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Verificar si hay parámetros de Google OAuth en la URL
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        console.log('🎉 Callback de Google recibido!');
        console.log('🔑 Token:', params['token']);
        console.log('👤 User Type:', params['user_type']);
        console.log('🆔 User ID:', params['user_id']);

        // Construir el objeto de usuario
        const user = {
          id: params['user_id'],
          type: params['user_type'],
          // Los demás datos se obtendrán del token o del backend
        };

        // Guardar el token y usuario en localStorage
        this.authService.handleGoogleCallback(params['token'], user);

        // Limpiar los parámetros de la URL
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        });

        console.log('✅ Sesión establecida correctamente con Google');
      } else if (params['error']) {
        console.error('❌ Error en Google login:', params['error']);
        console.error('📋 Mensaje:', params['message']);

        // Redirigir al login con mensaje de error
        this.router.navigate(['/login']);
      }
    });
  }

}
