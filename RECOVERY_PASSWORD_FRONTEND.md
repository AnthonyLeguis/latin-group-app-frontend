# Recuperación de Contraseña - Frontend

## 📁 Estructura de Componentes

```
frontend/src/app/features/auth/
├── login/
│   ├── login.html
│   ├── login.scss
│   └── login.ts
├── forgot-password/          ✨ NUEVO
│   ├── forgot-password.html
│   ├── forgot-password.scss
│   └── forgot-password.ts
├── reset-password/            ✨ NUEVO
│   ├── reset-password.html
│   ├── reset-password.scss
│   └── reset-password.ts
├── access-denied/
│   └── ...
└── auth.routes.ts            ✨ ACTUALIZADO
```

## 🚀 Implementación

### 1. **Componente Forgot Password** (`/auth/forgot-password`)

**Características:**
- ✅ Formulario con validación de email
- ✅ Spinner de carga durante el envío
- ✅ Mensaje de éxito con instrucciones claras
- ✅ Manejo de errores del backend
- ✅ Animación de entrada suave
- ✅ Diseño responsive
- ✅ Link para volver al login

**Flujo:**
1. Usuario ingresa su email
2. Click en "Enviar correo de recuperación"
3. Frontend llama a `AuthService.forgotPassword(email)`
4. Backend envía email con token
5. Se muestra mensaje de éxito
6. Usuario puede volver al login

---

### 2. **Componente Reset Password** (`/auth/reset-password`)

**Características:**
- ✅ Lee token y email de query params
- ✅ Dos campos de contraseña con validación
- ✅ Toggle de visibilidad de contraseñas
- ✅ Indicador de fortaleza de contraseña en tiempo real
- ✅ Validación de coincidencia de contraseñas
- ✅ Mensaje de éxito al completar
- ✅ Redirección automática al login
- ✅ Manejo de errores (token inválido, expirado, etc.)

**Indicador de Fortaleza:**
- 🔴 **Débil** (1/3): Solo cumple longitud mínima
- 🟡 **Media** (2/3): Longitud + letras y números
- 🟢 **Fuerte** (3/3): Longitud + letras/números + mayúsculas/minúsculas o caracteres especiales

**Flujo:**
1. Usuario recibe email con enlace
2. Click en enlace: `/auth/reset-password?token=abc123&email=user@example.com`
3. Componente extrae token y email de URL
4. Usuario ingresa nueva contraseña (2 veces)
5. Se muestra indicador de fortaleza
6. Click en "Restablecer contraseña"
7. Frontend llama a `AuthService.resetPassword(data)`
8. Se muestra mensaje de éxito
9. Usuario puede ir al login

---

### 3. **Actualización en Login Component**

**Cambio en `login.ts`:**
```typescript
onForgotPassword(): void {
    console.log('🔑 Navegando a recuperación de contraseña');
    this.router.navigate(['/auth/forgot-password']);
}
```

El link "Olvidé contraseña" ahora navega correctamente a la nueva página.

---

### 4. **Métodos Agregados en AuthService**

```typescript
// Solicitar recuperación
forgotPassword(email: string): Observable<{ message: string }>

// Restablecer con token
resetPassword(resetData: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string
}): Observable<{ message: string }>

// Cambiar contraseña autenticado (para futuro)
changePassword(changeData: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string
}): Observable<{ message: string }>
```

---

## 🎨 Diseño y UX

### Animaciones:
- **fadeInScale**: Entrada suave de las tarjetas
- **shake**: Sacudida para mensajes de error
- **Transiciones**: Todos los botones y campos tienen transiciones suaves

### Colores:
- **Primario**: Gris oscuro (#1f2937) para botones principales
- **Acento**: Rojo (#dc2626) para links y focus
- **Éxito**: Verde (#10b981) para mensajes de confirmación
- **Error**: Rojo (#ef4444) para mensajes de error
- **Advertencia**: Amarillo (#f59e0b) para contraseñas débiles

### Responsive:
- ✅ Mobile-first
- ✅ Breakpoint en 768px (md)
- ✅ Padding adaptativo
- ✅ Fuentes adaptativas

---

## 🔐 Seguridad Frontend

### Validaciones:
- ✅ Email válido (formato correcto)
- ✅ Contraseña mínimo 8 caracteres
- ✅ Coincidencia de contraseñas
- ✅ Token y email requeridos en URL
- ✅ Feedback visual inmediato

### Manejo de Errores:
- ✅ Errores del backend mostrados al usuario
- ✅ Animación de shake para llamar la atención
- ✅ Mensajes claros y específicos
- ✅ Logging en consola para debugging

---

## 📱 Rutas Configuradas

```typescript
/auth/login              → LoginComponent
/auth/forgot-password    → ForgotPasswordComponent (NUEVO)
/auth/reset-password     → ResetPasswordComponent (NUEVO)
/auth/access-denied      → AccessDeniedComponent
/auth                    → Redirect a /auth/login
```

---

## 🧪 Testing Manual

### Test 1: Forgot Password
1. Ir a `/auth/login`
2. Click en "Olvidé contraseña"
3. Verificar navegación a `/auth/forgot-password`
4. Ingresar email válido
5. Click en "Enviar correo de recuperación"
6. Verificar mensaje de éxito
7. Verificar que no se puede enviar nuevamente (o esperar)

### Test 2: Reset Password
1. Copiar URL del email (o simular): 
   `/auth/reset-password?token=abc123&email=test@example.com`
2. Verificar que se cargan token y email
3. Ingresar contraseña nueva
4. Verificar indicador de fortaleza
5. Ingresar confirmación de contraseña
6. Click en "Restablecer contraseña"
7. Verificar mensaje de éxito
8. Click en "Ir al inicio de sesión"

### Test 3: Validaciones
- ✅ Email inválido en forgot-password
- ✅ Contraseña menor a 8 caracteres
- ✅ Contraseñas no coinciden
- ✅ Token inválido o expirado
- ✅ URL sin parámetros

---

## 📝 Mensajes de Error Posibles

### Forgot Password:
- "No se encontró ninguna cuenta con ese correo electrónico"
- "Error al enviar el correo. Intente nuevamente."

### Reset Password:
- "Enlace inválido. Por favor solicita uno nuevo."
- "Token inválido o expirado"
- "El token ha expirado. Solicita uno nuevo"
- "Las contraseñas no coinciden"
- "La contraseña debe tener al menos 8 caracteres"
- "Error al restablecer la contraseña. Intente nuevamente."

---

## 🔄 Flujo Completo

```
1. Usuario → /auth/login
2. Click "Olvidé contraseña"
3. → /auth/forgot-password
4. Ingresa email → Submit
5. Backend envía email
6. ✅ Mensaje "Correo enviado"
7. Usuario revisa email
8. Click en enlace del email
9. → /auth/reset-password?token=xxx&email=yyy
10. Ingresa nueva contraseña (x2)
11. Verifica fortaleza
12. Submit → Backend valida y actualiza
13. ✅ Mensaje "Contraseña restablecida"
14. Click "Ir al inicio de sesión"
15. → /auth/login
16. Login con nueva contraseña ✅
```

---

## 🚀 Próximos Pasos

- [ ] Pruebas con email real (configurar SMTP)
- [ ] Implementar change-password en perfil de usuario
- [ ] Agregar rate limiting visual (intentos restantes)
- [ ] Implementar reCAPTCHA en forgot-password
- [ ] Tests unitarios con Jasmine/Karma
- [ ] Tests E2E con Cypress
