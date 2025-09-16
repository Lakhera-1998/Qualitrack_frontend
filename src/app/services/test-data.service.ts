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

  // Add this new method to get test data by project
  getTestDataByProject(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test-data/?project=${projectId}`, this.getHeaders());
  }

  // Keep existing methods but update the base URL if needed
  getAllTestData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test-data/`, this.getHeaders());
  }

  createTestData(testData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/test-data/`, testData, this.getHeadersForFormData());
  }

  updateTestData(id: number, testData: FormData): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/test-data/${id}/`, testData, this.getHeadersForFormData());
  }

  getTestData(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test-data/${id}/`, this.getHeaders());
  }

  deleteTestData(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/test-data/${id}/`, this.getHeaders());
  }
}