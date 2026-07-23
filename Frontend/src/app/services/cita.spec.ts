import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3000/api/citas';

  // Obtener todas las citas
  obtenerCitas(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }

  // Asignar cita (Solo funcionará si el usuario logueado es 'admin')
  asignarCita(citaId: string, pacienteId: string): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/asignar`, {
      citaId,
      pacienteId,
    });
  }
}
