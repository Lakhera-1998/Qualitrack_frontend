import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ✅ Attach Authorization header with token
  private getHeaders() {
    const token = sessionStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // ✅ NEW: Get all projects
  getAllProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects/`, this.getHeaders());
  }

  // ✅ List all projects (existing - keep for backward compatibility)
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects/`, this.getHeaders());
  }

  // ✅ List projects by client
  getProjectsByClient(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/clients/${clientId}/projects/`, this.getHeaders());
  }

  // ✅ Create a new project
  addProject(projectData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/projects/create/`, projectData, this.getHeaders());
  }

  // ✅ Retrieve single project by ID
  getProject(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/projects/${id}/`, this.getHeaders());
  }

  // ✅ Update project
  updateProject(id: number, projectData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/projects/${id}/update/`, projectData, this.getHeaders());
  }

  // ✅ Load users for dropdowns
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/`, this.getHeaders());
  }

  // ✅ Load technologies for dropdowns
  getTechnologies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/technologies/`, this.getHeaders());
  }

  // ✅ UPDATED: Use path param instead of query param
  getProjectDevelopers(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects/${projectId}/developers/`, this.getHeaders());
  }
}