import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestCaseService {
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

  getTestCasesByRequirement(requirementId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/requirements/${requirementId}/test-cases/`, this.getHeaders());
  }

  addTestCase(testCaseData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/test-cases/create/`, testCaseData, this.getHeaders());
  }

  updateTestCase(id: number, testCaseData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/test-cases/${id}/update/`, testCaseData, this.getHeaders());
  }

  getTestCase(requirementId: number, testCaseId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/requirements/${requirementId}/test-cases/${testCaseId}/`, this.getHeaders());
  }
}