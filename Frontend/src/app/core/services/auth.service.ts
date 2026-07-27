import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((respuesta) => {
          // Extraemos token y rol de la respuesta
          const token = respuesta?.token || respuesta?.datos?.token;
          const rol = respuesta?.usuario?.rol || respuesta?.rol || 'paciente';

          if (token) {
            this.guardarSesion(token, rol);
          }
        }),
      );
  }

  // Guardamos tanto token como rol en el localStorage
  guardarSesion(token: string, rol: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('rol', rol);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerRol(): string {
    return localStorage.getItem('rol') || 'paciente';
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  // 🔒 Método para saber si tiene permisos administrativos / médicos
  esPersonalMedico(): boolean {
    const rol = this.obtenerRol();
    return rol === 'admin' || rol === 'medico';
  }

  // 🔒 Método para saber si solo es un paciente o usuario común
  esPaciente(): boolean {
    return this.obtenerRol() === 'paciente';
  }
}
