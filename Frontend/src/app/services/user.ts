import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private API_AUTH_URL = '/api/auth';
  private API_PACIENTES_URL = '/api/pacientes';
  private API_MEDICOS_URL = '/api/medicos';

  obtenerUsuariosPorRol(rol: string): Observable<any[]> {
    const endpoint = rol === 'paciente' ? this.API_PACIENTES_URL : this.API_MEDICOS_URL;
    return this.http.get<any>(endpoint).pipe(map((respuesta) => respuesta.datos ?? respuesta));
  }

  crearUsuario(datosUsuario: any): Observable<any> {
    return this.http.post<any>(`${this.API_AUTH_URL}/registro`, datosUsuario);
  }
}
