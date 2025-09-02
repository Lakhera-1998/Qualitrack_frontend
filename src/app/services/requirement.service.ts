import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequirementService {
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

  getRequirementsByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects/${projectId}/requirements/`, this.getHeaders());
  }

  addRequirement(requirementData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/requirements/create/`, requirementData, this.getHeaders());
  }

  updateRequirement(id: number, requirementData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/requirements/${id}/update/`, requirementData, this.getHeaders());
  }

  getRequirement(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/projects/1/requirements/${id}/`, this.getHeaders());
  }

  // getRequirement(projectId: number, id: number): Observable<any> {
  // return this.http.get<any>(`${this.baseUrl}/projects/${projectId}/requirements/${id}/`, this.getHeaders());
  // }
}