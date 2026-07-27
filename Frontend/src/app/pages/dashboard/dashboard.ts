import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  nombreUsuario: string = '';
  rolUsuario: string = '';

  ngOnInit(): void {
    const nombreGuardado = localStorage.getItem('nombreUsuario');
    const rolGuardado = localStorage.getItem('rol');

    if (nombreGuardado) {
      this.nombreUsuario = nombreGuardado;
    } else {
      this.nombreUsuario = 'Dra. Maria Admin';
    }

    if (rolGuardado) {
      // Formateamos la primera letra del rol en mayúscula
      this.rolUsuario = rolGuardado.charAt(0).toUpperCase() + rolGuardado.slice(1);
    } else {
      this.rolUsuario = 'Administrador';
    }
  }

  cerrarSesion(): void {
    localStorage.clear();
    window.location.href = '/login';
  }
}
