import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://127.0.0.1:8000';  // 🔹 Change to your Django backend URL

  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login/`, { email, password })
      .pipe(
        catchError(this.handleError)
      );
  }

   private handleError(error: HttpErrorResponse) {
    let errorMsg = 'Something went wrong!';
    if (error.error && error.error.detail) {
      errorMsg = error.error.detail; // Django APIException response
    } else if (error.error && typeof error.error === 'string') {
      errorMsg = error.error;
    }
    return throwError(() => errorMsg);
  }
}
