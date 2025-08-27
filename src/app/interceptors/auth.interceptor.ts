import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('accessToken');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        // Token expired or invalid
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};