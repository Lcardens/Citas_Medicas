import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { decodificarToken, normalizarRol } from '../utils/auth.util';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

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

  // Guardamos token y rol en el localStorage (el rol se reconfirma desde el JWT)
  guardarSesion(token: string, rol: string): void {
    localStorage.setItem('token', token);
    this.sincronizarRolDesdeToken(token, rol);
  }

  sincronizarRolDesdeToken(token: string, rolRespaldo?: string): void {
    const datos = decodificarToken(token);
    let rol = datos?.rol || rolRespaldo || 'paciente';
    rol = normalizarRol(rol);
    localStorage.setItem('rol', rol);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerRol(): string {
    const token = this.obtenerToken();
    if (token) {
      this.sincronizarRolDesdeToken(token);
    }
    return localStorage.getItem('rol') || 'paciente';
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  // Indica si el usuario tiene permisos administrativos o médicos
  esPersonalMedico(): boolean {
    const rol = this.obtenerRol();
    return rol === 'admin' || rol === 'medico';
  }

  // Indica si el usuario es paciente o usuario común
  esPaciente(): boolean {
    return this.obtenerRol() === 'paciente';
  }

  // Obtiene el perfil del usuario logueado
  obtenerMiPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`, { headers: this.getHeaders() });
  }

  // Actualiza el perfil del usuario logueado
  actualizarMiPerfil(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/perfil`, datos, { headers: this.getHeaders() });
  }
}
