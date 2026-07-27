import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // 👈 Importar RouterLink

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink], // 👈 Agregar aquí
  templateUrl: './inicio.html',
})
export class InicioComponent {}
