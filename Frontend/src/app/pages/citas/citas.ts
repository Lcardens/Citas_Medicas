import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  mostrarModalEditar = false;

  horariosDisponibles: string[] = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
  ];

  rolUsuario: string = '';
  usuarioId: string = '';
  medicoFiltro: string = '';

  nuevaCita = {
    paciente: '',
    medico: '',
    fecha: '',
    hora: '',
    motivo: '',
  };

  citaEditando: any = {
    _id: '',
    motivo: '',
    estado: 'Disponible',
    fecha: '',
  };

  ngOnInit(): void {
    this.rolUsuario = (localStorage.getItem('rol') || 'paciente').toLowerCase().trim();
    if (this.rolUsuario === 'usuario') {
      this.rolUsuario = 'paciente';
    }

    const datosUsuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.usuarioId = localStorage.getItem('usuarioId') || datosUsuario._id || datosUsuario.id || '';

    this.cargarDatosGlobales();
  }

  get esAdmin(): boolean {
    return this.rolUsuario === 'admin' || this.rolUsuario === 'administrador';
  }

  get esPersonalMedico(): boolean {
    return this.esAdmin || this.rolUsuario === 'medico' || this.rolUsuario === 'médico';
  }

  get citasFiltradas(): any[] {
    let lista = this.citas;

    if (this.rolUsuario === 'paciente') {
      const emailUsuario = localStorage.getItem('emailUsuario');
      lista = lista.filter((cita) => cita.paciente?.Correo === emailUsuario);
    }

    if (this.medicoFiltro) {
      lista = lista.filter((cita) => {
        const medicoId = cita.medico?._id || cita.medico;
        return medicoId === this.medicoFiltro;
      });
    }

    return lista;
  }

  // Carga unificada y segura en paralelo para pacientes, médicos y citas
  cargarDatosGlobales(): void {
    this.cargando = true;

    const obsPacientes = this.esPersonalMedico
      ? this.pacienteService.obtenerPacientes().pipe(catchError(() => of([])))
      : of([]);

    const obsMedicos = this.medicoService.obtenerMedicos().pipe(catchError(() => of([])));
    const obsCitas = this.citaService.obtenerCitas().pipe(catchError(() => of([])));

    forkJoin({
      pacientesRes: obsPacientes,
      medicosRes: obsMedicos,
      citasRes: obsCitas,
    }).subscribe({
      next: (res: any) => {
        const pData = res.pacientesRes;
        this.pacientes = pData?.datos || pData || [];

        const mData = res.medicosRes;
        this.medicos = mData?.datos || mData || [];

        const rawCitas = res.citasRes?.datos || res.citasRes || [];

        // Mapeo defensivo robusto para cruzar IDs o referencias con los catálogos cargados
        this.citas = rawCitas.map((cita: any) => {
          // Extraer ID o referencia de paciente de forma segura
          const idPacienteEval =
            typeof cita.paciente === 'object' && cita.paciente !== null
              ? cita.paciente._id || cita.paciente.id
              : cita.paciente;

          if (idPacienteEval && this.pacientes.length > 0) {
            const encontrado = this.pacientes.find((p) => String(p._id) === String(idPacienteEval));
            if (encontrado) {
              cita.paciente = encontrado;
            }
          }

          // Extraer ID o referencia de médico de forma segura
          const idMedicoEval =
            typeof cita.medico === 'object' && cita.medico !== null
              ? cita.medico._id || cita.medico.id
              : cita.medico;

          if (idMedicoEval && this.medicos.length > 0) {
            const encontrado = this.medicos.find((m) => String(m._id) === String(idMedicoEval));
            if (encontrado) {
              cita.medico = encontrado;
            }
          }

          return cita;
        });

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error crítico al cargar los datos de la vista:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
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
    // Si el usuario logueado es un paciente, se asigna su propio ID
    if (this.rolUsuario === 'paciente') {
      this.nuevaCita.paciente = this.usuarioId;
    }

    // Validaciones antes de enviar
    if (!this.nuevaCita.paciente) {
      alert('Por favor seleccione un paciente.');
      return;
    }

    if (!this.nuevaCita.medico || !this.nuevaCita.fecha || !this.nuevaCita.hora) {
      alert('Por favor complete todos los campos obligatorios (médico, fecha, hora).');
      return;
    }

    // --- AQUÍ ESTÁ LA CLAVE ---
    // Envías exactamente el mismo objeto 'nuevaCita' que ya funciona perfecto en Postman
    this.citaService.crearCita(this.nuevaCita).subscribe({
      next: () => {
        alert('Cita agendada exitosamente');
        this.cerrarModal();
        this.cargarDatosGlobales(); // Esto recargará la lista y mostrará el nombre
      },
      error: (err) => {
        console.error('Error al agendar cita:', err);
        alert('Ocurrió un error al agendar la cita');
      },
    });
  }

  abrirModalEditar(cita: any): void {
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

  actualizarCita(): void {
    if (!this.citaEditando._id) return;

    const { _id, ...datosAActualizar } = this.citaEditando;

    this.citaService.actualizarCita(_id, datosAActualizar).subscribe({
      next: () => {
        this.cerrarModalEditar();
        this.cargarDatosGlobales();
      },
      error: (err) => console.error('Error al actualizar cita:', err),
    });
  }

  eliminarCita(id: string): void {
    if (!id) return;

    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      this.citaService.eliminarCita(id).subscribe({
        next: () => {
          alert('Cita eliminada exitosamente');
          this.cargarDatosGlobales();
        },
        error: (err) => {
          console.error('Error al eliminar cita:', err);
          alert('Ocurrió un error al intentar eliminar la cita.');
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
