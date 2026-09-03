import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private apiUrl = environment.apiUrl + '/audit';

  constructor(private http: HttpClient) {}

  private obtenerHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    });
  }

  listarLogs(filtros: any = {}): Observable<any> {
    const params: string[] = [];
    if (filtros.accion) params.push(`accion=${filtros.accion}`);
    if (filtros.entidad) params.push(`entidad=${filtros.entidad}`);
    if (filtros.email) params.push(`email=${filtros.email}`);
    if (filtros.fechaInicio) params.push(`fechaInicio=${filtros.fechaInicio}`);
    if (filtros.fechaFin) params.push(`fechaFin=${filtros.fechaFin}`);
    params.push(`pagina=${filtros.pagina || 1}`);
    params.push(`limite=${filtros.limite || 20}`);

    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<any>(`${this.apiUrl}${query}`, {
      headers: this.obtenerHeaders(),
    });
  }
}
