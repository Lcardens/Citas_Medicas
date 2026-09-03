import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  error = '';
  exito = '';
  mostrarRegistro = false;
  mostrarPassword = false;
  cargando = false;
  anioActual = new Date().getFullYear();

  registro = {
    nombre: '',
    email: '',
    password: '',
    rol: 'paciente',
    TipoDocumento: 'CC',
    Documento: '',
    Telefono: '',
    Registromedico: '',
  };

  iniciarSesion(): void {
    this.error = '';
    this.cargando = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        const token = res.token || res.datos?.token;
        const rawRol = res.usuario?.rol || res.rol || 'paciente';
        const rol = rawRol.toLowerCase();
        const userId = res.usuario?._id || res.usuario?.id || res.id;
        localStorage.setItem('usuarioId', userId);

        const nombreReal =
          res.usuario?.nombre ||
          res.nombre ||
          res.usuario?.nombres ||
          res.nombres ||
          'Usuario';

        localStorage.setItem('token', token);
        this.authService.sincronizarRolDesdeToken(token, rol);
        localStorage.setItem('nombreUsuario', nombreReal);
        localStorage.setItem('emailUsuario', this.email);

        this.cargando = false;
        this.router.navigate(['/dashboard/inicio']);
      },
      error: (err: any) => {
        console.error('Error al iniciar sesión:', err);
        this.cargando = false;
        this.error = err.error?.mensaje || 'Credenciales incorrectas o error de conexión';
        this.cdr.detectChanges();
      },
    });
  }

  registrar(): void {
    this.error = '';
    this.exito = '';

    if (!this.registro.nombre || !this.registro.email || !this.registro.password) {
      this.error = 'Nombre, email y contraseña son obligatorios';
      this.cdr.detectChanges();
      return;
    }

    if (this.registro.rol === 'medico' && !this.registro.Registromedico) {
      this.error = 'El registro médico es obligatorio';
      this.cdr.detectChanges();
      return;
    }

    const datosRegistro: any = {
      nombre: this.registro.nombre,
      email: this.registro.email,
      password: this.registro.password,
      rol: this.registro.rol,
    };

    if (this.registro.rol === 'paciente') {
      datosRegistro.TipoDocumento = this.registro.TipoDocumento;
      datosRegistro.Documento = this.registro.Documento;
      datosRegistro.Telefono = this.registro.Telefono;
    }

    if (this.registro.rol === 'medico') {
      datosRegistro.Registromedico = this.registro.Registromedico;
    }

    this.cargando = true;

    this.usuarioService.registrarUsuario(datosRegistro).subscribe({
      next: (res: any) => {
        this.cargando = false;
        this.exito = res.mensaje || 'Registro exitoso. Ahora puedes iniciar sesión.';
        this.mostrarRegistro = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al registrar:', err);
        this.cargando = false;
        this.error = err.error?.mensaje || 'Error al registrar usuario';
        this.cdr.detectChanges();
      },
    });
  }
}
