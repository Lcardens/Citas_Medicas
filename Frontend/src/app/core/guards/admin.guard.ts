import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { rolDesdeToken, normalizarRol } from '../utils/auth.util';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const rol = normalizarRol(rolDesdeToken());

  if (rol === 'admin') {
    return true;
  }

  alert('Acceso restringido solo para administradores.');
  router.navigate(['/dashboard/inicio']);
  return false;
};
