import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MedicoService {
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

  obtenerMedicos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/medicos`, { headers: this.getHeaders() });
  }

  crearMedico(medico: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/medicos`, medico, { headers: this.getHeaders() });
  }

  eliminarMedico(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/medicos/${id}`, { headers: this.getHeaders() });
  }

  actualizarDisponibilidad(id: string, config: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/medicos/${id}/disponibilidad`, config, {
      headers: this.getHeaders(),
    });
  }
}
