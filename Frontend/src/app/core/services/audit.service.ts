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
    if (filtros.usuario) params.push(`usuario=${filtros.usuario}`);
    params.push(`pagina=${filtros.pagina || 1}`);
    params.push(`limite=${filtros.limite || 20}`);

    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<any>(`${this.apiUrl}${query}`, {
      headers: this.obtenerHeaders(),
    });
  }
}
