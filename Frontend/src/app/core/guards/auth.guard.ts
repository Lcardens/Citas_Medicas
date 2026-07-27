import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token'); // O la clave donde guardes el JWT

  if (token && token.trim() !== '') {
    return true; // 🔓 Permite el acceso a la ruta
  }

  // 🔒 Si no hay token, redirige al Login
  router.navigate(['/login']);
  return false;
};
