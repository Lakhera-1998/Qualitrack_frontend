import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestDataService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = sessionStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  private getHeadersForFormData() {
    const token = sessionStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Get test data by project - FIXED URL
  getTestDataByProject(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test-data/?project=${projectId}`, this.getHeaders());
  }

  // Create test data - FIXED URL (changed from /test-data/ to /test-data/create/)
  createTestData(testData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/test-data/create/`, testData, this.getHeadersForFormData());
  }

  // Update test data - FIXED URL (changed from /test-data/{id}/ to /test-data/{id}/update/)
  updateTestData(id: number, testData: FormData): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/test-data/${id}/update/`, testData, this.getHeadersForFormData());
  }

  // Get specific test data - FIXED URL
  getTestData(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test-data/${id}/`, this.getHeaders());
  }

  // Delete test data - FIXED URL
  deleteTestData(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/test-data/${id}/`, this.getHeaders());
  }
}