import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = 'http://127.0.0.1:8000';

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

  // ✅ List all projects
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects/`, this.getHeaders());
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
}
