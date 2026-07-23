import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Buscamos el token guardado en el navegador
  const token = localStorage.getItem('token');

  // 2. Si existe el token, clonamos la petición y le pegamos el Header
  if (token) {
    const reqConToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(reqConToken);
  }

  // 3. Si no hay token (ej. petición de login/registro), pasa normal
  return next(req);
};
