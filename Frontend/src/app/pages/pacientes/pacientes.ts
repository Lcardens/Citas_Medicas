import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../core/services/paciente.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.html',
  styleUrls: ['./pacientes.css'],
})
export class PacientesComponent implements OnInit {
  private pacienteService = inject(PacienteService);
  private cdr = inject(ChangeDetectorRef);

  pacientes: any[] = [];
  cargando = true;
  mostrarModal = false;

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
        this.cerrarModal();
        this.obtenerPacientes();
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

  eliminarPaciente(id: string, nombre: string): void {
    if (!confirm(
      `Â¿Eliminar al paciente "${nombre || ''}"? Se borrarÃ¡ tambiÃ©n su usuario y sus citas. Esta acciÃ³n no se puede deshacer.`
    )) {
      return;
    }

    this.pacienteService.eliminarPaciente(id).subscribe({
      next: (res: any) => {
        alert(res?.mensaje || 'Paciente eliminado.');
        this.obtenerPacientes();
      },
      error: (err) => {
        console.error('Error al eliminar paciente:', err);
        alert(err.error?.mensaje || 'OcurriÃ³ un error al eliminar el paciente.');
      },
    });
  }
}
