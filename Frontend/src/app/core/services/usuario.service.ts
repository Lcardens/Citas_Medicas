import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
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

  obtenerUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/usuarios`, { headers: this.getHeaders() });
  }

  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro`, usuario, { headers: this.getHeaders() });
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/auth/usuarios/${id}`, { headers: this.getHeaders() });
  }

  editarUsuario(id: string, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/usuarios/${id}`, datos, { headers: this.getHeaders() });
  }
}
