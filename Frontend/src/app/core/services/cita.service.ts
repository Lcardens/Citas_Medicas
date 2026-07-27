import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Método auxiliar interno para obtener los headers con el Token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  obtenerCitas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/citas`, { headers: this.getHeaders() });
  }

  crearCita(citaData: any): Observable<any> {
    const token = localStorage.getItem('token') || '';

    // Aseguramos cabeceras limpias para application/json
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    // Limpiamos el objeto por seguridad antes de enviarlo
    const bodyLimpio = {
      paciente: typeof citaData.paciente === 'object' ? citaData.paciente._id : citaData.paciente,
      medico: typeof citaData.medico === 'object' ? citaData.medico._id : citaData.medico,
      fecha: citaData.fecha,
      hora: citaData.hora,
      motivo: citaData.motivo || 'Consulta general',
    };

    console.log('JSON exacto que sale hacia el backend:', JSON.stringify(bodyLimpio));

    return this.http.post<any>(`${this.apiUrl}/citas`, bodyLimpio, { headers });
  }

  // ✏️ Actualizar cita (PATCH)
  actualizarCita(id: string, cita: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/citas/${id}`, cita, { headers: this.getHeaders() });
  }

  //  Eliminar cita (DELETE)
  eliminarCita(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/citas/${id}`, { headers: this.getHeaders() });
  }
}
