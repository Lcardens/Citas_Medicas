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
  mostrarModalEditar = false; // 👈 Controla el modal de edición

  rolUsuario: string = '';
  medicoFiltro: string = '';

  nuevaCita = {
    paciente: '',
    medico: '',
    fecha: '',
    hora: '',
    motivo: '',
  };

  // 👈 Objeto para capturar y modificar la cita elegida
  citaEditando: any = {
    _id: '',
    motivo: '',
    estado: 'Disponible',
    fecha: '',
  };

  ngOnInit(): void {
    this.rolUsuario = localStorage.getItem('rol') || 'paciente';
    this.obtenerCitas();
    this.cargarSelects();
  }

  get esAdmin(): boolean {
    return this.rolUsuario === 'admin';
  }

  get esPersonalMedico(): boolean {
    return this.rolUsuario === 'admin' || this.rolUsuario === 'medico';
  }

  get citasFiltradas(): any[] {
    if (!this.medicoFiltro) {
      return this.citas;
    }
    return this.citas.filter((cita) => {
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
    if (this.esPersonalMedico) {
      this.pacienteService.obtenerPacientes().subscribe({
        next: (res: any) => (this.pacientes = res?.datos || res || []),
      });
      this.medicoService.obtenerMedicos().subscribe({
        next: (res: any) => (this.medicos = res?.datos || res || []),
      });
    }
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
      next: () => {
        this.cerrarModal();
        this.obtenerCitas();
      },
      error: (err) => console.error('Error al agendar cita:', err),
    });
  }

  // ✏️ ABRIR Y PREPARAR EDICIÓN
  abrirModalEditar(cita: any): void {
    // Clonamos la cita para evitar modificar la tabla antes de guardar
    this.citaEditando = {
      _id: cita._id,
      motivo: cita.motivo,
      estado: cita.estado,
      fecha: cita.fecha,
    };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.citaEditando = { _id: '', motivo: '', estado: 'Disponible', fecha: '' };
  }

  // 💾 GUARDAR CAMBIOS (PATCH)
  actualizarCita(): void {
    if (!this.citaEditando._id) return;

    const { _id, ...datosAActualizar } = this.citaEditando;

    this.citaService.actualizarCita(_id, datosAActualizar).subscribe({
      next: () => {
        this.cerrarModalEditar();
        this.obtenerCitas();
      },
      error: (err) => console.error('Error al actualizar cita:', err),
    });
  }

  //  ELIMINAR CITA (DELETE)
  eliminarCita(id: string): void {
    if (!id) {
      alert('Error: No se encontró el ID de la cita.');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      this.citaService.eliminarCita(id).subscribe({
        next: () => {
          alert('Cita eliminada exitosamente');
          this.obtenerCitas(); // Recargar la lista limpia
        },
        error: (err) => {
          console.error('Error al eliminar cita:', err);
          if (err.status === 404) {
            alert('La cita no existe o ya fue eliminada previamente.');
            this.obtenerCitas(); // Recargar la lista para actualizar la vista
          } else {
            alert('Ocurrió un error al intentar eliminar la cita.');
          }
        },
      });
    }
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
