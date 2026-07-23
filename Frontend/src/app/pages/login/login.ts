import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div
      style="max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;"
    >
      <h2>Iniciar Sesión</h2>
      <form (ngSubmit)="alEnviar()">
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            required
            style="width: 100%; margin-bottom: 10px;"
          />
        </div>
        <div>
          <label>Contraseña:</label><br />
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            required
            style="width: 100%; margin-bottom: 10px;"
          />
        </div>
        <button type="submit" style="padding: 10px 20px; cursor: pointer;">Ingresar</button>
      </form>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  alEnviar() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        alert('¡Bienvenido!');
        this.router.navigate(['/citas']);
      },
      error: (err) => {
        alert('Error en las credenciales: ' + (err.error?.mensaje || 'Error del servidor'));
      },
    });
  }
}
