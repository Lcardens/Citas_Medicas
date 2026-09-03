import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Frontend';

  private authService = inject(AuthService);
  private router = inject(Router);
  private timer: any;
  private readonly TIMEOUT_MS = 10 * 60 * 1000;

  private eventos = [
    'mousemove', 'keydown', 'click', 'scroll', 'touchstart',
  ];

  ngOnInit(): void {
    this.eventos.forEach((evento) =>
      document.addEventListener(evento, this.reiniciarTimer.bind(this)),
    );
    this.reiniciarTimer();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    this.eventos.forEach((evento) =>
      document.removeEventListener(evento, this.reiniciarTimer.bind(this)),
    );
  }

  private reiniciarTimer(): void {
    clearTimeout(this.timer);
    if (!this.authService.estaAutenticado()) return;
    this.timer = setTimeout(() => {
      this.authService.cerrarSesion();
      this.router.navigate(['/login']);
    }, this.TIMEOUT_MS);
  }
}
