import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'],
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  mostrarModalCrear: boolean = false;
  mensajeError: string = '';
  usuarioIdActual: string = '';
  rolFiltro: string = '';
  private cdr = inject(ChangeDetectorRef);

  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    rol: 'paciente',
  };

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.usuarioIdActual = localStorage.getItem('usuarioId') || '';
    this.obtenerUsuarios();
  }

  get usuariosFiltrados(): any[] {
    if (!this.rolFiltro) return this.usuarios;

    return this.usuarios.filter((u) => {
      const rol = String(u.rol || '').toLowerCase().trim();
      if (this.rolFiltro === 'usuario') {
        return rol === 'usuario' || rol === 'paciente';
      }
      if (this.rolFiltro === 'administrador') {
        return rol === 'administrador' || rol === 'admin';
      }
      return rol === this.rolFiltro;
    });
  }

  obtenerUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (res: any) => {
        const datosRespuesta = res?.datos || res?.usuarios || (Array.isArray(res) ? res : []);
        this.usuarios = [...datosRespuesta];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al obtener usuarios:', err);
      },
    });
  }

  abrirModal(): void {
    this.mensajeError = '';
    this.mostrarModalCrear = true;
  }

  cerrarModal(): void {
    this.mostrarModalCrear = false;
    this.mensajeError = '';
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.nuevoUsuario = {
      nombre: '',
      email: '',
      password: '',
      rol: 'paciente',
    };
  }

  crearUsuario(): void {
    this.mensajeError = '';

    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email || !this.nuevoUsuario.password) {
      this.mensajeError = 'Por favor completa todos los campos requeridos.';
      return;
    }

    if (this.nuevoUsuario.password.length < 6) {
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.usuarioService.registrarUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.cerrarModal();
        this.obtenerUsuarios();
      },
      error: (err: any) => {
        console.error('Error al registrar usuario:', err);
        this.mensajeError = err.error?.mensaje || 'Error al guardar el usuario.';
      },
    });
  }

  esUsuarioActual(id: string): boolean {
    return this.usuarioIdActual === id;
  }

  eliminarUsuario(id: string, nombre: string): void {
    if (!confirm(
      `¿Eliminar al usuario "${nombre || ''}"? Se borrará también su perfil y sus citas. Esta acción no se puede deshacer.`
    )) {
      return;
    }

    this.usuarioService.eliminarUsuario(id).subscribe({
      next: (res: any) => {
        alert(res?.mensaje || 'Usuario eliminado.');
        this.obtenerUsuarios();
      },
      error: (err: any) => {
        console.error('Error al eliminar usuario:', err);
        alert(err.error?.mensaje || 'Ocurrió un error al eliminar el usuario.');
      },
    });
  }
}
