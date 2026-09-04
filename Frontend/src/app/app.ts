import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
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

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly TIMEOUT_MS = 5 * 60 * 1000;

  private timer: any;
  private ultimaActividad = Date.now();
  private handlers: { evento: string; fn: EventListener }[] = [];

  ngOnInit(): void {
    this.handlers = [
      { evento: 'keydown', fn: () => this.reiniciarTimer() },
      { evento: 'keyup', fn: () => this.reiniciarTimer() },
      { evento: 'click', fn: () => this.reiniciarTimer() },
      { evento: 'touchstart', fn: () => this.reiniciarTimer() },
      { evento: 'touchmove', fn: () => this.reiniciarTimer() },
      { evento: 'mousemove', fn: () => this.reiniciarTimer() },
      { evento: 'wheel', fn: () => this.reiniciarTimer() },
      { evento: 'focus', fn: () => this.verificarInactividad() },
      { evento: 'visibilitychange', fn: () => this.verificarInactividad() },
    ];
    this.handlers.forEach((h) =>
      document.addEventListener(h.evento, h.fn),
    );
    this.reiniciarTimer();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    this.handlers.forEach((h) =>
      document.removeEventListener(h.evento, h.fn),
    );
  }

  private reiniciarTimer(): void {
    if (!this.authService.estaAutenticado()) return;
    this.ultimaActividad = Date.now();
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.cerrarPorInactividad(), this.TIMEOUT_MS);
  }

  private verificarInactividad(): void {
    if (!this.authService.estaAutenticado()) return;
    const inactivoMs = Date.now() - this.ultimaActividad;
    if (inactivoMs >= this.TIMEOUT_MS) {
      this.cerrarPorInactividad();
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(
      () => this.cerrarPorInactividad(),
      this.TIMEOUT_MS - inactivoMs,
    );
  }

  private cerrarPorInactividad(): void {
    clearTimeout(this.timer);
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}