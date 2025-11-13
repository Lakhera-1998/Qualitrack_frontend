import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TestCaseService {
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

  // ✅ ADDED: Get single test case by ID (without requirement ID)
  getTestCase(testCaseId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test-cases/${testCaseId}/`, this.getHeaders());
  }

  // ✅ KEEP: Get test case by requirement ID and test case ID (for backward compatibility)
  getTestCaseByRequirement(requirementId: number, testCaseId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/requirements/${requirementId}/test-cases/${testCaseId}/`, this.getHeaders());
  }

  addTestCase(testCaseData: any): Observable<any> {
    // Check if we have file data (bug_screenshot)
    if (testCaseData.bug_screenshot instanceof File) {
      return this.addTestCaseWithFormDataFromObject(testCaseData);
    } else {
      return this.http.post<any>(`${this.baseUrl}/test-cases/create/`, testCaseData, this.getHeaders());
    }
  }

  updateTestCase(id: number, testCaseData: any): Observable<any> {
    // Check if we have file data (bug_screenshot)
    if (testCaseData.bug_screenshot instanceof File) {
      return this.updateTestCaseWithFormDataFromObject(id, testCaseData);
    } else {
      return this.http.put<any>(`${this.baseUrl}/test-cases/${id}/update/`, testCaseData, this.getHeaders());
    }
  }

  // ✅ RENAMED: Private method that converts object to FormData
  private addTestCaseWithFormDataFromObject(testCaseData: any): Observable<any> {
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

  // ✅ RENAMED: Private method that converts object to FormData
  private updateTestCaseWithFormDataFromObject(id: number, testCaseData: any): Observable<any> {
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

  // ✅ PUBLIC METHODS FOR FORM DATA - These are the ones your component calls
  updateTestCaseWithFormData(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/test-cases/${id}/update/`, formData, this.getHeadersForFormData());
  }

  addTestCaseWithFormData(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/test-cases/create/`, formData, this.getHeadersForFormData());
  }

  // ✅ CORRECTED method to get proper bug screenshot URL
  getBugScreenshotUrl(screenshotPath: string): string {
    if (!screenshotPath) return '';
    
    // Check if it's already a full URL
    if (screenshotPath.startsWith('http')) {
      return screenshotPath;
    }
    
    // If the path already starts with /media/, use it as is
    if (screenshotPath.startsWith('/media/')) {
      return `${this.baseUrl}${screenshotPath}`;
    }
    
    // If it's just a filename or relative path, prepend with /media/
    const cleanPath = screenshotPath.startsWith('/') ? screenshotPath : `/${screenshotPath}`;
    return `${this.baseUrl}/media${cleanPath}`;
  }

  // ✅ New methods for template download and bulk import
  downloadTemplate(projectId?: number): Observable<any> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('project_id', projectId.toString());
    }
    
    return this.http.get(`${this.baseUrl}/test-cases/download-template/`, {
      ...this.getHeaders(),
      params: params,
      responseType: 'blob'
    });
  }

  bulkImportTestCases(requirementId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('requirement_id', requirementId.toString());
    
    return this.http.post<any>(`${this.baseUrl}/test-cases/bulk-import/`, formData, this.getHeadersForFormData());
  }
}