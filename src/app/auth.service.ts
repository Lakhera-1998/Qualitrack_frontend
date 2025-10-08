import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000';  // Django backend URL

  constructor(private http: HttpClient) { }

  // 🔹 Login and store user + token in localStorage
  login(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login/`, { email, password }).pipe(
      tap(response => {
        if (response && response.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }),
      catchError(this.handleError)
    );
  }

  // 🔹 Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // 🔹 Check login status
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * 🔹 Updated getCurrentUser:
   * Returns the current logged-in user data (from localStorage).
   * Works for all existing components + Navbar username display.
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Ensure username or email is available for Navbar
        return {
          ...user,
          displayName: user.username || user.email || 'User'
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // 🔹 Generic error handler
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