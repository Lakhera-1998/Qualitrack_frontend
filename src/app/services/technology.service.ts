import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TechnologyService {
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

  getTechnologies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/technologies/`, this.getHeaders());
  }

  addTechnology(technologyData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/technologies/create/`, technologyData, this.getHeaders());
  }

  updateTechnology(id: number, technologyData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/technologies/${id}/update/`, technologyData, this.getHeaders());
  }

  deleteTechnology(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/technologies/${id}/delete/`, this.getHeaders());
  }
}
