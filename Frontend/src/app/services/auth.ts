import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private API_URL = '/api/auth';

  // Iniciar Sesión
  login(credenciales: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, credenciales).pipe(
      tap((respuesta) => {
        if (respuesta.exitoso && respuesta.token) {
          localStorage.setItem('token', respuesta.token);
          localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
        }
      }),
    );
  }

  // Registrar Usuario
  registro(datosUsuario: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/registro`, datosUsuario);
  }

  // Cerrar Sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  // Saber si hay sesión activa
  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  // Obtener el rol del usuario actual ('admin' o 'usuario')
  obtenerRol(): string | null {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return null;
    const usuario = JSON.parse(usuarioStr);
    return usuario.rol || null;
  }
}
