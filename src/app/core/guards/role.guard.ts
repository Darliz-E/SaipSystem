import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import Swal from 'sweetalert2';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const currentUserStr = localStorage.getItem('currentUser');

  if (!currentUserStr) {
    router.navigate(['/login']);
    return false;
  }

  const currentUser = JSON.parse(currentUserStr);
  const requiredRoles = route.data['roles'] as string[];

  // Si no hay roles requeridos, permitir acceso
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Verificar si el usuario tiene uno de los roles requeridos
  const hasRole = requiredRoles.includes(currentUser.rol);

  if (!hasRole) {
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: 'No tienes permisos para acceder a esta sección',
      confirmButtonColor: '#1b263b',
    });
    router.navigate(['/private/dashboard']);
    return false;
  }

  return true;
};
