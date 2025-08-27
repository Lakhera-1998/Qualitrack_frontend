import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestPlanService {
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

  getTestPlansByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects/${projectId}/test-plans/`, this.getHeaders());
  }

  addTestPlan(testPlanData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/test-plans/create/`, testPlanData, this.getHeaders());
  }

  updateTestPlan(id: number, testPlanData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/test-plans/${id}/update/`, testPlanData, this.getHeaders());
  }
}