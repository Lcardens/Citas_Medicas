import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService } from '../../core/services/medico.service';
import { AuthService } from '../../core/services/auth.service'; // 👈 1. Importar AuthService

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicos.html',
  styleUrls: ['./medicos.css'],
})
export class MedicosComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private authService = inject(AuthService); // 👈 2. Inyectar AuthService
  private cdr = inject(ChangeDetectorRef);

  medicos: any[] = [];
  cargando = true;
  mostrarModal = false;

  // 👈 3. Definir la variable que leerá el HTML
  esPersonalMedico = false;

  // Modelo con la estructura exacta que pide tu backend
  nuevoMedico = {
    Registromedico: '',
    Nombre: '',
  };

  ngOnInit(): void {
    // 👈 4. Comprobar si es admin o médico al cargar la vista
    this.esPersonalMedico = this.authService.esPersonalMedico();
    this.obtenerMedicos();
  }

  obtenerMedicos(): void {
    this.cargando = true;
    this.medicoService.obtenerMedicos().subscribe({
      next: (respuesta: any) => {
        this.medicos = respuesta?.datos || respuesta || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener médicos:', error);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirModal(): void {
    // Protección adicional por seguridad en el cliente
    if (!this.esPersonalMedico) return;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  guardarMedico(): void {
    if (!this.esPersonalMedico) return;

    this.medicoService.crearMedico(this.nuevoMedico).subscribe({
      next: (res) => {
        console.log('Médico registrado:', res);
        this.cerrarModal();
        this.obtenerMedicos();
      },
      error: (err) => console.error('Error al crear médico:', err),
    });
  }

  limpiarFormulario(): void {
    this.nuevoMedico = {
      Registromedico: '',
      Nombre: '',
    };
  }
}
