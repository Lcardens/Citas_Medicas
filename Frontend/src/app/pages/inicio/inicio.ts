import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { rolDesdeToken, normalizarRol } from '../../core/utils/auth.util';
import { CitaService } from '../../core/services/cita.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './inicio.html',
})
export class InicioComponent implements OnInit {
  private citaService = inject(CitaService);
  private cdr = inject(ChangeDetectorRef);

  rol: string = '';
  cargando = false;

  // Médico
  citasHoy = 0;
  citasPendientes = 0;
  citasAtendidas = 0;
  proximasCitas: any[] = [];

  // Paciente
  misProximasCitas: any[] = [];
  totalMisCitas = 0;
  citasActivas = 0;

  ngOnInit(): void {
    this.rol = normalizarRol(rolDesdeToken() || localStorage.getItem('rol') || 'paciente');
    if (this.esMedico) {
      this.cargarResumenMedico();
    } else if (this.esPaciente) {
      this.cargarResumenPaciente();
    }
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

  hoyStr(): string {
    const now = new Date();
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const dia = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${mes}-${dia}`;
  }

  nombrePaciente(cita: any): string {
    const p = cita?.paciente;
    if (typeof p === 'string') return 'Paciente';
    return (
      p?.Nombre || p?.nombre || p?.nombres || p?.nombreCompleto || 'Paciente'
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

  cargarResumenMedico(): void {
    this.cargando = true;
    this.citaService.obtenerAgendaMedico().subscribe({
      next: (res: any) => {
        const citas = res?.datos || [];
        const hoy = this.hoyStr();

        this.citasHoy = citas.filter((c: any) => String(c.fecha) === hoy).length;
        this.citasAtendidas = citas.filter(
          (c: any) => c.estado === 'Atendida',
        ).length;
        this.citasPendientes = citas.filter(
          (c: any) => c.estado === 'Confirmada' && String(c.fecha) >= hoy,
        ).length;

        this.proximasCitas = citas
          .filter(
            (c: any) => c.estado === 'Confirmada' && String(c.fecha) >= hoy,
          )
          .sort((a: any, b: any) => {
            const difFecha = String(a.fecha).localeCompare(String(b.fecha));
            if (difFecha !== 0) return difFecha;
            return this.horaAMinutos(a.hora || '') - this.horaAMinutos(b.hora || '');
          })
          .slice(0, 5);

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarResumenPaciente(): void {
    this.cargando = true;
    this.citaService.obtenerCitas().subscribe({
      next: (res: any) => {
        const raw = res?.datos || res || [];
        const hoy = this.hoyStr();

        const misCitas = raw.filter((c: any) => {
          const p = c.paciente;
          const id = typeof p === 'object' && p ? p._id || p.id : p;
          return id ? true : false;
        });

        this.totalMisCitas = misCitas.length;
        this.citasActivas = misCitas.filter(
          (c: any) => c.estado === 'Confirmada' && String(c.fecha) >= hoy,
        ).length;

        this.misProximasCitas = misCitas
          .filter(
            (c: any) =>
              c.estado === 'Confirmada' && String(c.fecha) >= hoy,
          )
          .sort((a: any, b: any) => {
            const difFecha = String(a.fecha).localeCompare(String(b.fecha));
            if (difFecha !== 0) return difFecha;
            return this.horaAMinutos(a.hora || '') - this.horaAMinutos(b.hora || '');
          })
          .slice(0, 5);

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
