import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestingTypeService {
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

  getTestingTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/testing-types/`, this.getHeaders());
  }

  addTestingType(testingTypeData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/testing-types/create/`, testingTypeData, this.getHeaders());
  }

  updateTestingType(id: number, testingTypeData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/testing-types/${id}/update/`, testingTypeData, this.getHeaders());
  }
}