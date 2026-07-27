import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
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

  obtenerPacientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pacientes`, { headers: this.getHeaders() });
  }

  crearPaciente(paciente: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pacientes`, paciente, { headers: this.getHeaders() });
  }
}
