import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerGlobalComponent } from '../../../shared/components/spinner-global/spinner-global';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    SpinnerGlobalComponent
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = ''; // Limpiar mensaje de error previo

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      console.log('🔐 Enviando credenciales de login:', credentials);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('✅ Login exitoso:', response);
          console.log('👤 Usuario:', response.user);
          console.log('🔑 Token:', response.token);
          console.log('🔒 Token Type:', response.token_type);

          this.isLoading = false;

          // Redirigir según el tipo de usuario usando el servicio
          const redirectUrl = this.authService.getDashboardRoute();
          console.log(`🚀 Redirigiendo ${response.user.type} a: ${redirectUrl}`);

          this.router.navigate([redirectUrl]);
        },
        error: (error) => {
          console.error('❌ Error en login:', error);
          console.error('📋 Detalles del error:', {
            status: error.status,
            statusText: error.statusText,
            message: error.error?.error || error.message,
            errors: error.error?.errors || {}
          });

          this.isLoading = false;

          // Determinar el tipo de error basado en el mensaje del backend
          const errorMsg = error.error?.error || '';

          if (errorMsg.toLowerCase().includes('contraseña inválida')) {
            // Error de contraseña incorrecta
            this.errorMessage = 'Contraseña inválida.';

            // Resetear solo la contraseña
            this.loginForm.patchValue({ password: '' });
          } else if (errorMsg.toLowerCase().includes('usuario no encontrado') ||
            errorMsg.toLowerCase().includes('no autorizado')) {
            // Error de usuario no encontrado
            this.errorMessage = 'Usuario no encontrado o no autorizado.';

            // Resetear todo el formulario
            this.loginForm.reset();
          } else {
            // Error genérico
            this.errorMessage = 'Error al iniciar sesión. Intente nuevamente.';
          }
        }
      });
    }
  }

  onLoginWithGoogle(): void {
    console.log('🔍 Iniciando login con Google...');
    console.log('🌐 Redirigiendo a Google OAuth...');

    // Obtener la URL de autenticación de Google desde el backend
    const googleAuthUrl = this.authService.getGoogleAuthUrl();
    console.log('� URL de Google Auth:', googleAuthUrl);

    // Redirigir al usuario a Google para autenticación
    // El backend manejará el callback y redirigirá de vuelta al frontend
    window.location.href = googleAuthUrl;
  }

  onForgotPassword(): void {
    // Implementar lógica de recuperación de contraseña
    console.log('Recuperar contraseña');
  }

  onBackToHome(): void {
    this.router.navigate(['/']);
  }
}
