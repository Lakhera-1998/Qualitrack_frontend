import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestDataService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  // Get all test data
  getAllTestData(): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/test-data/`);
  }

  // Get test data by ID
  getTestDataById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test-data/${id}/`);
  }

  // Create new test data
  createTestData(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/test-data/create/`, formData);
  }

  // Update test data
  updateTestData(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/test-data/${id}/update/`, formData);
  }

  // Delete test data
  deleteTestData(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/test-data/${id}/`);
  }
}