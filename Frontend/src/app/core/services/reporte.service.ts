import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  citasPorMes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/citas-por-mes`, {
      headers: this.getHeaders(),
    });
  }

  pacientesFrecuentes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/pacientes-frecuentes`, {
      headers: this.getHeaders(),
    });
  }

  citasPorEstado(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reportes/estados`, {
      headers: this.getHeaders(),
    });
  }
}
