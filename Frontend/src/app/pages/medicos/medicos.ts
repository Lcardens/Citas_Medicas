import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService } from '../../core/services/medico.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicos.html',
  styleUrls: ['./medicos.css'],
})
export class MedicosComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  medicos: any[] = [];
  cargando = true;
  mostrarModal = false;

  esPersonalMedico = false;

  nuevoMedico = {
    Registromedico: '',
    Nombre: '',
  };

  ngOnInit(): void {
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

  eliminarMedico(id: string, nombre: string): void {
    if (!confirm(
      `¿Eliminar al médico "${nombre || ''}"? Se borrará también su usuario y sus citas. Esta acción no se puede deshacer.`
    )) {
      return;
    }

    this.medicoService.eliminarMedico(id).subscribe({
      next: (res: any) => {
        alert(res?.mensaje || 'Médico eliminado.');
        this.obtenerMedicos();
      },
      error: (err) => {
        console.error('Error al eliminar médico:', err);
        alert(err.error?.mensaje || 'Ocurrió un error al eliminar el médico.');
      },
    });
  }
}
