import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../core/services/cita.service';

@Component({
  selector: 'app-misturnos',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './misturnos.html',
  styleUrls: ['./misturnos.css'],
})
export class MisturnosComponent implements OnInit {
  private citaService = inject(CitaService);
  private cdr = inject(ChangeDetectorRef);

  citas: any[] = [];
  cargando = true;
  medicoId: string = '';
  mensaje = '';
  error = '';

  citaEditando: any = {
    _id: '',
    diagnostico: '',
    notasConsulta: '',
  };
  mostrarModal = false;
  guardando = false;

  ngOnInit(): void {
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.cargando = true;
    this.citaService.obtenerAgenda().subscribe({
      next: (res: any) => {
        const datos = res?.datos || [];
        this.citas = datos.slice().sort((a: any, b: any) => {
          const difFecha = String(a.fecha || '').localeCompare(String(b.fecha || ''));
          if (difFecha !== 0) return difFecha;
          return this.horaAMinutos(a.hora || '') - this.horaAMinutos(b.hora || '');
        });
        this.medicoId = res?.medicoId || '';
        if (res?.mensaje && this.citas.length === 0) {
          this.mensaje = res.mensaje;
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la agenda:', err);
        this.error = err?.error?.mensaje || 'No se pudo cargar tu agenda.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirModalAtender(cita: any): void {
    this.citaEditando = {
      _id: cita._id,
      diagnostico: cita.diagnostico || '',
      notasConsulta: cita.notasConsulta || '',
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.citaEditando = { _id: '', diagnostico: '', notasConsulta: '' };
  }

  marcarAtendida(): void {
    if (!this.citaEditando._id) return;

    const payload: any = { estado: 'Atendida' };
    if (this.citaEditando.diagnostico && this.citaEditando.diagnostico.trim()) {
      payload.diagnostico = this.citaEditando.diagnostico.trim();
    }
    if (this.citaEditando.notasConsulta && this.citaEditando.notasConsulta.trim()) {
      payload.notasConsulta = this.citaEditando.notasConsulta.trim();
    }

    this.guardando = true;
    this.citaService.actualizarCita(this.citaEditando._id, payload).subscribe({
      next: () => {
        this.guardando = false;
        this.mensaje = 'Cita marcada como atendida.';
        this.cerrarModal();
        this.cargarAgenda();
      },
      error: (err) => {
        this.guardando = false;
        this.error = err?.error?.mensaje || 'No se pudo actualizar la cita.';
        this.cdr.detectChanges();
      },
    });
  }

  nombrePaciente(cita: any): string {
    const p = cita?.paciente;
    if (typeof p === 'string') return 'ID: ' + p;
    return (
      p?.Nombre ||
      p?.nombre ||
      p?.nombres ||
      p?.nombreCompleto ||
      'Paciente'
    );
  }

  horaAMinutos(hora: string): number {
    const match = hora.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let horas = parseInt(match[1], 10);
    const minutos = parseInt(match[2], 10);
    const periodo = match[3].toUpperCase();
    if (periodo === 'PM' && horas !== 12) horas += 12;
    if (periodo === 'AM' && horas === 12) horas = 0;
    return horas * 60 + minutos;
  }
}
