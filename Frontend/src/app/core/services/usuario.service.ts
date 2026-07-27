import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; // http://localhost:3000/api

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Llama a: GET http://localhost:3000/api/auth/usuarios
  obtenerUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/usuarios`, { headers: this.getHeaders() });
  }

  // Llama a: POST http://localhost:3000/api/auth/registro
  registrarUsuario(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro`, usuario, { headers: this.getHeaders() });
  }
}
