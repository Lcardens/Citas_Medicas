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

  private authService = inject(AuthService);
  private router = inject(Router);
  private timer: any;
  private readonly TIMEOUT_MS = 5 * 60 * 1000;

  private handlers: { evento: string; fn: EventListener }[] = [];

  ngOnInit(): void {
    this.handlers = [
      { evento: 'keydown', fn: () => this.reiniciarTimer() },
      { evento: 'click', fn: () => this.reiniciarTimer() },
      { evento: 'touchstart', fn: () => this.reiniciarTimer() },
      { evento: 'mousemove', fn: () => this.reiniciarTimer() },
      { evento: 'scroll', fn: () => this.reiniciarTimer() },
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
    clearTimeout(this.timer);
    if (!this.authService.estaAutenticado()) return;
    this.timer = setTimeout(() => {
      this.authService.cerrarSesion();
      this.router.navigate(['/login']);
    }, this.TIMEOUT_MS);
  }
}