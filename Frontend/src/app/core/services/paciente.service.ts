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

  obtenerPacientes(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(`${this.apiUrl}/pacientes`, { headers });
  }

  // 👈 AGREGA ESTE MÉTODO SI NO LO TIENES
  crearPaciente(paciente: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.apiUrl}/pacientes`, paciente, { headers });
  }
}
