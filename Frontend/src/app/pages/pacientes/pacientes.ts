import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 Resuelve los errores NG8002 de ngModel
import { PacienteService } from '../../core/services/paciente.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 FormsModule es OBLIGATORIO
  templateUrl: './pacientes.html',
  styleUrls: ['./pacientes.css'],
})
export class PacientesComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private cdr = inject(ChangeDetectorRef);

  pacientes: any[] = [];
  cargando = true;
  mostrarModal = false;

  // Modelo de datos para el nuevo paciente
  nuevoPaciente = {
    TipoDocumento: 'CC',
    Documento: '',
    Nombre: '',
    Correo: '',
    Telefono: '',
  };

  ngOnInit(): void {
    this.obtenerPacientes();
  }

  obtenerPacientes(): void {
    this.cargando = true;
    this.pacienteService.obtenerPacientes().subscribe({
      next: (respuesta: any) => {
        this.pacientes = respuesta?.datos || respuesta || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error del backend:', error);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Métodos que el HTML estaba reclamando (TS2339)
  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  guardarPaciente(): void {
    this.pacienteService.crearPaciente(this.nuevoPaciente).subscribe({
      next: (res) => {
        console.log('Paciente creado exitosamente:', res);
        this.cerrarModal();
        this.obtenerPacientes(); // Recarga la lista automáticamente
      },
      error: (err) => {
        console.error('Error al guardar paciente:', err);
      },
    });
  }

  limpiarFormulario(): void {
    this.nuevoPaciente = {
      TipoDocumento: 'CC',
      Documento: '',
      Nombre: '',
      Correo: '',
      Telefono: '',
    };
  }
}
