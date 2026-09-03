import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  return next(authReq).pipe(
    catchError((err) => {
      if (err?.status === 401 && router.url !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioId');
        localStorage.removeItem('rol');
        localStorage.removeItem('nombreUsuario');
        localStorage.removeItem('emailUsuario');
        localStorage.removeItem('usuario');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
