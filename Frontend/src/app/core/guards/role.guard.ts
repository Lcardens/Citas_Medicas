import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Leemos el rol guardado y lo pasamos a minúsculas para comparar de forma segura
  const rol = (localStorage.getItem('rol') || '').toLowerCase();

  // Roles permitidos para vistas generales (citas, inicio, etc.)
  const rolesPermitidos = ['admin', 'administrador', 'medico', 'médico', 'paciente', 'usuario'];

  if (rolesPermitidos.includes(rol)) {
    return true;
  }

  // Si no está autorizado
  alert('No tienes permisos para acceder a esta sección.');
  router.navigate(['/dashboard/inicio']);
  return false;
};
