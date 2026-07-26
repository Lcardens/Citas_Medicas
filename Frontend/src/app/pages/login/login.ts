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

  iniciarSesion() {
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (respuesta: any) => {
        this.authService.guardarToken(respuesta.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error = 'Correo o contraseña incorrectos';
      },
    });
  }
}
