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

  crearCita(cita: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas`, cita, { headers: this.getHeaders() });
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
