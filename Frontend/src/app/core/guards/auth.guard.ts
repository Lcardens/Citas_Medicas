import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si el usuario está autenticado usando el AuthService
  if (authService.estaAutenticado()) {
    return true; // Le permite entrar a la ruta
  }

  // Si no está autenticado, lo redirige al login y bloquea la navegación
  console.warn('Acceso denegado: redirigiendo a /login');
  router.navigate(['/login']);
  return false;
};
