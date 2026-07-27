import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';

  iniciarSesion(): void {
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        const token = res.token || res.datos?.token;

        // Normalizamos el rol a minúsculas para evitar problemas de Admin vs admin
        const rawRol = res.usuario?.rol || res.rol || 'paciente';
        const rol = rawRol.toLowerCase();

        // Guardamos las credenciales en el almacenamiento local
        localStorage.setItem('token', token);
        localStorage.setItem('rol', rol);

        // Redirección por defecto al inicio del dashboard
        this.router.navigate(['/dashboard/inicio']);
      },
      error: (err: any) => {
        console.error('Error al iniciar sesión:', err);
        this.error = err.error?.mensaje || 'Credenciales incorrectas o error de conexión';
      },
    });
  }
}
