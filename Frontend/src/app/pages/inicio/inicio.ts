import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { rolDesdeToken, normalizarRol } from '../../core/utils/auth.util';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
})
export class InicioComponent implements OnInit {
  rol: string = '';

  ngOnInit(): void {
    this.rol = normalizarRol(rolDesdeToken() || localStorage.getItem('rol') || 'paciente');
  }

  get esAdmin(): boolean {
    return this.rol === 'admin';
  }

  get esMedico(): boolean {
    return this.rol === 'medico';
  }

  get esPaciente(): boolean {
    return this.rol === 'paciente';
  }
}
