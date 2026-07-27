import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Leemos el rol guardado y lo pasamos a minúsculas para comparar de forma segura
  const rol = (localStorage.getItem('rol') || '').toLowerCase();

  // Lista de roles con permiso para ver rutas protegidas (Pacientes, Citas, Usuarios)
  const rolesPermitidos = ['admin', 'administrador', 'medico', 'médico'];

  if (rolesPermitidos.includes(rol)) {
    return true;
  }

  // Si es un paciente o rol no autorizado, se muestra alerta y regresa al inicio
  alert('No tienes permisos para acceder a esta sección.');
  router.navigate(['/dashboard/inicio']);
  return false;
};
