import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

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
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
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
      // Aquí iría la lógica de autenticación con el backend
      console.log('Formulario de login:', this.loginForm.value);

      // Simulación de llamada al backend
      setTimeout(() => {
        this.isLoading = false;
        // this.router.navigate(['/dashboard']);
      }, 2000);
    }
  }

  onLoginWithGoogle(): void {
    // Aquí iría la lógica de autenticación con Google
    console.log('Ingresando con Google...');
    // this.router.navigate(['/dashboard']);
  }

  onForgotPassword(): void {
    // Implementar lógica de recuperación de contraseña
    console.log('Recuperar contraseña');
  }

  onBackToHome(): void {
    this.router.navigate(['/']);
  }
}
