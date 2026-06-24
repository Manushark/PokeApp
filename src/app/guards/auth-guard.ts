import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // vemos si hay sesion guardada
  const currentUser = localStorage.getItem('currentUser');

  if (currentUser) {
    // si esta logueado dejamos pasar
    return true;
  }

  // si no, mandamos al login
  router.navigate(['/login']);
  return false;
};
