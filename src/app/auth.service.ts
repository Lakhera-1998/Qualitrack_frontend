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

          // 🔹 Redirect to appropriate dashboard based on user role
          this.redirectBasedOnRole(response.user);
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

  // 🔹 Get user role based on backend flags
  getUserRole(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    
    if (user.is_superuser) {
      return 'admin';
    } else if (user.is_staff) {
      return 'staff';
    } else {
      return 'user';
    }
  }

  // 🔹 Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.is_superuser : false;
  }

  // 🔹 Check if user is staff
  isStaff(): boolean {
    const user = this.getCurrentUser();
    return user ? user.is_staff : false;
  }

  // 🔹 Check if user is regular user
  isRegularUser(): boolean {
    const user = this.getCurrentUser();
    return user ? (!user.is_superuser && !user.is_staff) : false;
  }

  // 🔹 Redirect based on user role using backend flags
  private redirectBasedOnRole(user: any): void {
    if (!user) {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (user.is_superuser || user.is_staff) {
      // For admin and staff users - redirect to admin dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // For regular users - redirect to user dashboard
      this.router.navigate(['/user-dashboard']);
    }
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