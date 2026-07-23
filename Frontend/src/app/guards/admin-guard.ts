import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.obtenerRol() === 'admin') {
    return true; // Es Admin, puede pasar
  } else {
    alert('Acceso denegado: Se requieren permisos de Administrador.');
    router.navigate(['/dashboard']);
    return false;
  }
};
