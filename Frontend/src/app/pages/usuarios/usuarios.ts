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

  private cdr = inject(ChangeDetectorRef); // 👈 Inyectamos el detector de cambios

  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    rol: 'paciente',
  };

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (res: any) => {
        console.log('Respuesta cruda de la API:', res);

        // Asignamos los datos y forzamos el renderizado en pantalla
        const datosCrudos = res?.datos || res?.usuarios || (Array.isArray(res) ? res : []);
        this.usuarios = [...datosCrudos];

        console.log('Usuarios asignados al array:', this.usuarios);

        // 🟢 FUERZA A ANGULAR A ACTUALIZAR LA VISTA AL INSTANTE
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
}
