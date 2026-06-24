import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Comprobamos si existe la sesión en el localStorage
  const currentUser = localStorage.getItem('currentUser');

  if (currentUser) {
    // Si existe el usuario, permitimos el acceso
    return true;
  }

  // Si no está logueado, lo redirigimos al Login
  router.navigate(['/login']);
  return false;
};
