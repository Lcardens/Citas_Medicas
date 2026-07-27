import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Leemos el rol del localStorage
  const rol = (localStorage.getItem('rol') || '').toLowerCase();

  // 🔒 Solo permitimos administradores reales
  if (rol === 'admin' || rol === 'administrador') {
    return true;
  }

  // Si un paciente intenta entrar, lo bloqueamos y lo mandamos al inicio
  alert('Acceso restringido solo para administradores.');
  router.navigate(['/dashboard/inicio']);
  return false;
};
