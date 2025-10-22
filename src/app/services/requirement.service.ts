import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequirementService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = sessionStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Existing methods - URLs remain unchanged
  getRequirementsByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects/${projectId}/requirements/`, this.getHeaders());
  }

  addRequirement(requirementData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/requirements/create/`, requirementData, this.getHeaders());
  }

  updateRequirement(id: number, requirementData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/requirements/${id}/update/`, requirementData, this.getHeaders());
  }

  // ✅ CORRECTED: Get requirement with both projectId and requirementId
  getRequirement(projectId: number, id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/projects/${projectId}/requirements/${id}/`, this.getHeaders());
  }

  // ✅ NEW: Download Excel Template
  downloadTemplate(projectId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/requirements/download-template/${projectId}/`, {
      ...this.getHeaders(),
      responseType: 'blob'
    });
  }

  // ✅ NEW: Import Requirements from Excel
  importRequirements(projectId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('excel_file', file);
    
    const token = sessionStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.baseUrl}/requirements/import/${projectId}/`, formData, { headers });
  }
}