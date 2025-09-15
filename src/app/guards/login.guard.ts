// src/app/guards/login.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true; // allow access to login page if not logged in
  } else {
    // redirect to /clients if already logged in
    router.navigate(['/clients']);
    return false;
  }
};
