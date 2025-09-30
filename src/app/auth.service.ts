import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://127.0.0.1:8000';  // Django backend URL

  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login/`, { email, password })
      .pipe(
        catchError(this.handleError)
      );
  }

  logout() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('accessToken');
  }

  getCurrentUser(): any {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 🔹 FIXED: use response.token instead of response.access
  loginAndStoreUser(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login/`, { email, password })
      .pipe(
        catchError(this.handleError)
      ).subscribe({
        next: (response) => {
          if (response.user && response.token) {
            sessionStorage.setItem('accessToken', response.token);
            sessionStorage.setItem('user', JSON.stringify(response.user));
          }
        },
        error: (error) => {
          console.error('Login error:', error);
        }
      });
  }

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