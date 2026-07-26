import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink], // 👈 Esto hace que los botones "Ir a..." funcionen
  templateUrl: './inicio.html',
})
export class InicioComponent {}
