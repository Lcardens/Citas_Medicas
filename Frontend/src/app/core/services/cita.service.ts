import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private apiUrl = environment.apiUrl + '/citas';

  constructor(private http: HttpClient) {}

  private obtenerHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.obtenerToken()}`,
    });
  }

  private obtenerToken(): string {
    return localStorage.getItem('token') || '';
  }

  obtenerAgendaMedico(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/agenda`, {
      headers: this.obtenerHeaders(),
    });
  }

  obtenerHistorialClinico(pacienteId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/historial/${pacienteId}`, {
      headers: this.obtenerHeaders(),
    });
  }

  asignarCita(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asignar`, datos, {
      headers: this.obtenerHeaders(),
    });
  }

  obtenerCitasPorMedico(medicoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medico/${medicoId}`, {
      headers: this.obtenerHeaders(),
    });
  }

  obtenerCitasDisponiblesPorMedico(medicoId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/disponibles/${medicoId}`,
      { headers: this.obtenerHeaders() },
    );
  }

  obtenerHorasDisponibles(medicoId: string, fecha: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/disponibles/${medicoId}/${fecha}`,
      { headers: this.obtenerHeaders() },
    );
  }

  obtenerDisponibilidadRango(
    medicoId: string,
    inicio: string,
    fin: string,
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/disponibilidad/${medicoId}?inicio=${inicio}&fin=${fin}`,
      { headers: this.obtenerHeaders() },
    );
  }

  asignarCitaRapida(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asignar-rapido`, datos, {
      headers: this.obtenerHeaders(),
    });
  }

  obtenerCitas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`, {
      headers: this.obtenerHeaders(),
    });
  }

  crearCita(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, datos, {
      headers: this.obtenerHeaders(),
    });
  }

  actualizarCita(id: string, datos: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, datos, {
      headers: this.obtenerHeaders(),
    });
  }

  eliminarCita(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.obtenerHeaders(),
    });
  }
}
