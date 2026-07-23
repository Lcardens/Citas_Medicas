import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private http = inject(HttpClient);
  private API_URL = '/api/citas';

  // Método para obtener todas las citas
  obtenerCitas(): Observable<any[]> {
    return this.http.get<any>(this.API_URL).pipe(map((respuesta) => respuesta.datos ?? respuesta));
  }

  // Método para asignar cita (que ya tenías)
  asignarCita(citaId: string, pacienteId: string): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/asignar`, { citaId, pacienteId });
  }
}
