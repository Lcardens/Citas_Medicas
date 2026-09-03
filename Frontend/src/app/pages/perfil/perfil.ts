import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timeout, catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  perfil: any = {};
  nombre: string = '';
  email: string = '';
  rol: string = '';
  telefono: string = '';
  tipoDocumento: string = '';
  documento: string = '';
  registroMedico: string = '';

  passwordActual: string = '';
  passwordNueva: string = '';
  confirmarPassword: string = '';
  mostrarCambioPassword: boolean = false;
  errorPassword: string = '';

  cargando: boolean = false;
  guardando: boolean = false;
  mensaje: string = '';
  error: string = '';

  abrirCambioPassword(): void {
    this.errorPassword = '';
    this.mostrarCambioPassword = true;
  }

  cancelarCambioPassword(): void {
    this.mostrarCambioPassword = false;
    this.passwordActual = '';
    this.passwordNueva = '';
    this.confirmarPassword = '';
    this.error = '';
    this.errorPassword = '';
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.error = '';
    this.authService
      .obtenerMiPerfil()
      .pipe(
        timeout(15000),
        catchError((err) => {
          this.cargando = false;
          this.error =
            err?.name === 'TimeoutError'
              ? 'El servidor tardó demasiado en responder. Intenta recargar la página.'
              : err?.error?.mensaje || 'No se pudo cargar tu perfil.';
          return of(null);
        }),
      )
      .subscribe({
        next: (res) => {
          if (!res) return;
          const d = res?.datos || res;
          this.perfil = d;
          this.nombre = d?.nombre || '';
          this.email = d?.email || '';
          this.rol = d?.rol || '';
          this.telefono = d?.telefono || '';
          this.tipoDocumento = d?.tipoDocumento || '';
          this.documento = d?.documento || '';
          this.registroMedico = d?.registroMedico || '';
          this.cargando = false;
          this.cdr.detectChanges();
        },
        complete: () => this.cdr.detectChanges(),
      });
  }

  guardarPerfil(): void {
    this.error = '';
    this.mensaje = '';
    this.guardando = true;

    const datos: any = {};

    if (this.nombre && this.nombre.trim()) {
      datos.nombre = this.nombre.trim();
    }

    if (this.telefono && this.telefono.trim()) {
      datos.telefono = this.telefono.trim();
    }

    if (this.passwordNueva) {
      if (!this.passwordActual) {
        this.errorPassword = 'Ingresa tu contraseña actual para cambiar la contraseña.';
        this.guardando = false;
        return;
      }
      if (this.passwordNueva.length < 6) {
        this.errorPassword = 'La nueva contraseña debe tener al menos 6 caracteres.';
        this.guardando = false;
        return;
      }
      if (this.passwordNueva !== this.confirmarPassword) {
        this.errorPassword = 'Las contraseñas nuevas no coinciden.';
        this.guardando = false;
        return;
      }
      datos.password = this.passwordNueva;
      datos.passwordActual = this.passwordActual;
    }

    if (Object.keys(datos).length === 0) {
      this.error = 'No hay datos para actualizar.';
      this.guardando = false;
      return;
    }

    this.authService.actualizarMiPerfil(datos).pipe(timeout(15000)).subscribe({
      next: (res) => {
        this.guardando = false;
        this.mensaje = res?.mensaje || 'Perfil actualizado correctamente.';
        localStorage.setItem('nombreUsuario', this.nombre.trim());
        this.passwordActual = '';
        this.passwordNueva = '';
        this.confirmarPassword = '';
        this.errorPassword = '';
        this.mostrarCambioPassword = false;
        this.cargarPerfil();
      },
      error: (err) => {
        this.guardando = false;
        const mensaje = err?.name === 'TimeoutError'
          ? 'El servidor tardó demasiado en responder. Intenta de nuevo.'
          : err?.error?.mensaje || 'Error al actualizar el perfil.';
        if (this.passwordNueva) {
          this.errorPassword = mensaje;
          this.error = '';
        } else {
          this.error = mensaje;
        }
      },
    });
  }

  get puedeActualizarTelefono(): boolean {
    return this.rol === 'paciente' || this.rol === 'usuario';
  }

  get rolLegible(): string {
    if (!this.rol) return '';
    return this.rol.charAt(0).toUpperCase() + this.rol.slice(1);
  }
}
