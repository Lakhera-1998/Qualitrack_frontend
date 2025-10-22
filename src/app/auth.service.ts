import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiBaseUrl;  // Django backend URL

  constructor(private http: HttpClient, private router: Router) {}

  // 🔹 Login and store user + token in sessionStorage
  login(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login/`, { email, password }).pipe(
      tap(response => {
        if (response && response.user && response.token) {
          sessionStorage.setItem('accessToken', response.token);
          sessionStorage.setItem('user', JSON.stringify(response.user));

          // 🔹 Redirect to dashboard after successful login
          this.router.navigate(['/dashboard']);
        }
      }),
      catchError(this.handleError)
    );
  }

  // 🔹 Logout user
  logout() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']); // optional redirect on logout
  }

  // 🔹 Check login status
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('accessToken');
  }

  // 🔹 Get current user info
  getCurrentUser(): any {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          ...user,
          displayName: user.username || user.email || 'User'
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  // 🔹 Error handler
  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'Something went wrong!';
    if (error.error && error.error.detail) {
      errorMsg = error.error.detail;
    } else if (error.error && typeof error.error === 'string') {
      errorMsg = error.error;
    }
    return throwError(() => errorMsg);
  }
}