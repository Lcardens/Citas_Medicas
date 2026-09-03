import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { rolDesdeToken, normalizarRol } from '../utils/auth.util';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const rol = normalizarRol(rolDesdeToken());

  // El médico usa "Mi agenda" para agendar sus citas
  if (rol === 'medico') {
    router.navigate(['/dashboard/misturnos']);
    return false;
  }

  const rolesPermitidos = ['admin', 'paciente'];

  if (rolesPermitidos.includes(rol)) {
    return true;
  }

  alert('No tienes permisos para acceder a esta sección.');
  router.navigate(['/dashboard/inicio']);
  return false;
};
