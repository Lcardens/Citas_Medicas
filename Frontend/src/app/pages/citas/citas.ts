import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../core/services/cita.service';
import { PacienteService } from '../../core/services/paciente.service';
import { MedicoService } from '../../core/services/medico.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './citas.html',
  styleUrls: ['./citas.css'],
})
export class CitasComponent implements OnInit {
  private citaService = inject(CitaService);
  private pacienteService = inject(PacienteService);
  private medicoService = inject(MedicoService);
  private cdr = inject(ChangeDetectorRef);

  citas: any[] = [];
  pacientes: any[] = [];
  medicos: any[] = [];
  cargando = true;
  mostrarModal = false;

  // Variable para almacenar el ID del médico seleccionado en el filtro
  medicoFiltro: string = '';

  nuevaCita = {
    paciente: '',
    medico: '',
    fecha: '',
    hora: '',
    motivo: '',
  };

  ngOnInit(): void {
    this.obtenerCitas();
    this.cargarSelects();
  }

  // Getter que filtra las citas en tiempo real
  get citasFiltradas(): any[] {
    if (!this.medicoFiltro) {
      return this.citas; // Si no hay filtro, muestra todas las citas
    }
    return this.citas.filter((cita) => {
      // Maneja si cita.medico es el objeto populado o solo el ID
      const medicoId = cita.medico?._id || cita.medico;
      return medicoId === this.medicoFiltro;
    });
  }

  obtenerCitas(): void {
    this.cargando = true;
    this.citaService.obtenerCitas().subscribe({
      next: (respuesta: any) => {
        this.citas = respuesta?.datos || respuesta || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener citas:', error);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarSelects(): void {
    this.pacienteService.obtenerPacientes().subscribe({
      next: (res: any) => (this.pacientes = res?.datos || res || []),
    });
    this.medicoService.obtenerMedicos().subscribe({
      next: (res: any) => (this.medicos = res?.datos || res || []),
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  guardarCita(): void {
    this.citaService.crearCita(this.nuevaCita).subscribe({
      next: (res) => {
        this.cerrarModal();
        this.obtenerCitas();
      },
      error: (err) => console.error('Error al agendar cita:', err),
    });
  }

  limpiarFormulario(): void {
    this.nuevaCita = {
      paciente: '',
      medico: '',
      fecha: '',
      hora: '',
      motivo: '',
    };
  }
}
