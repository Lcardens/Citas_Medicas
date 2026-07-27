import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html', // 👈 Verifica que este sea el archivo donde pusiste el <router-outlet></router-outlet>
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent {
  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    window.location.href = '/login';
  }
}
