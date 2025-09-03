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

  private getHeadersForFormData() {
    const token = sessionStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
        // Note: Don't set Content-Type for FormData, let browser set it automatically
      })
    };
  }

  getTestCasesByRequirement(requirementId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/requirements/${requirementId}/test-cases/`, this.getHeaders());
  }

  addTestCase(testCaseData: any): Observable<any> {
    // Check if we have file data (bug_screenshot)
    if (testCaseData.bug_screenshot instanceof File) {
      return this.addTestCaseWithFormData(testCaseData);
    } else {
      return this.http.post<any>(`${this.baseUrl}/test-cases/create/`, testCaseData, this.getHeaders());
    }
  }

  updateTestCase(id: number, testCaseData: any): Observable<any> {
    // Check if we have file data (bug_screenshot)
    if (testCaseData.bug_screenshot instanceof File) {
      return this.updateTestCaseWithFormData(id, testCaseData);
    } else {
      return this.http.put<any>(`${this.baseUrl}/test-cases/${id}/update/`, testCaseData, this.getHeaders());
    }
  }

  private addTestCaseWithFormData(testCaseData: any): Observable<any> {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(testCaseData).forEach(key => {
      if (key === 'bug_screenshot' && testCaseData[key] instanceof File) {
        formData.append(key, testCaseData[key]);
      } else if (testCaseData[key] !== null && testCaseData[key] !== undefined) {
        formData.append(key, testCaseData[key]);
      }
    });

    return this.http.post<any>(`${this.baseUrl}/test-cases/create/`, formData, this.getHeadersForFormData());
  }

  private updateTestCaseWithFormData(id: number, testCaseData: any): Observable<any> {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.keys(testCaseData).forEach(key => {
      if (key === 'bug_screenshot' && testCaseData[key] instanceof File) {
        formData.append(key, testCaseData[key]);
      } else if (testCaseData[key] !== null && testCaseData[key] !== undefined) {
        formData.append(key, testCaseData[key]);
      }
    });

    return this.http.put<any>(`${this.baseUrl}/test-cases/${id}/update/`, formData, this.getHeadersForFormData());
  }

  getTestCase(requirementId: number, testCaseId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/requirements/${requirementId}/test-cases/${testCaseId}/`, this.getHeaders());
  }
}