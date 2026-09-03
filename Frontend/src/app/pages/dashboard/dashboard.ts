import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { rolDesdeToken, normalizarRol } from '../../core/utils/auth.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);

  nombreUsuario: string = '';
  rolUsuario: string = '';
  rol: string = '';
  currentYear: number = new Date().getFullYear();

  ngOnInit(): void {
    const nombreGuardado = localStorage.getItem('nombreUsuario');

    this.rol = normalizarRol(rolDesdeToken() || localStorage.getItem('rol') || '');

    if (nombreGuardado) {
      this.nombreUsuario = nombreGuardado;
    } else {
      this.nombreUsuario = 'Usuario';
    }

    if (this.rol) {
      this.rolUsuario = this.rol.charAt(0).toUpperCase() + this.rol.slice(1);
    } else {
      this.rolUsuario = 'Sin rol';
    }
  }

  get esAdmin(): boolean {
    return this.rol === 'admin' || this.rol === 'administrador';
  }

  get esMedico(): boolean {
    return this.rol === 'medico';
  }

  get esPaciente(): boolean {
    return this.rol === 'paciente' || this.rol === 'usuario';
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
