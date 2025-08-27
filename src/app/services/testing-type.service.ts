import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestingTypeService {
  private baseUrl = 'http://127.0.0.1:8000'; // Django backend base URL

  constructor(private http: HttpClient) {}

  // ✅ Attach JWT token for authenticated requests
  private getHeaders() {
    const token = sessionStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // ✅ Get all testing types
  getTestingTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/testing-types/`, this.getHeaders());
  }

  // ✅ Add new testing type
  addTestingType(testingTypeData: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/testing-types/create/`,
      testingTypeData,
      this.getHeaders()
    );
  }

  // ✅ Update testing type
  updateTestingType(id: number, testingTypeData: any): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/testing-types/${id}/update/`,
      testingTypeData,
      this.getHeaders()
    );
  }

  // ✅ Delete testing type
  deleteTestingType(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.baseUrl}/testing-types/${id}/delete/`,
      this.getHeaders()
    );
  }
}
