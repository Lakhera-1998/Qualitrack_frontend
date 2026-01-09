import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
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
        // Do NOT set Content-Type for FormData, browser will handle boundary
      })
    };
  }

  // --- Basic test-case endpoints ---
  getTestCasesByRequirement(requirementId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/requirements/${requirementId}/test-cases/`, this.getHeaders());
  }

  getTestCase(testCaseId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test-cases/${testCaseId}/`, this.getHeaders());
  }

  getTestCaseByRequirement(requirementId: number, testCaseId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/requirements/${requirementId}/test-cases/${testCaseId}/`, this.getHeaders());
  }

  addTestCase(testCaseData: any): Observable<any> {
    if (testCaseData.bug_screenshot instanceof File) {
      return this.addTestCaseWithFormDataFromObject(testCaseData);
    } else {
      return this.http.post<any>(`${this.baseUrl}/test-cases/create/`, testCaseData, this.getHeaders());
    }
  }

  updateTestCase(id: number, testCaseData: any): Observable<any> {
    if (testCaseData.bug_screenshot instanceof File) {
      return this.updateTestCaseWithFormDataFromObject(id, testCaseData);
    } else {
      return this.http.put<any>(`${this.baseUrl}/test-cases/${id}/update/`, testCaseData, this.getHeaders());
    }
  }

  private addTestCaseWithFormDataFromObject(testCaseData: any): Observable<any> {
    const formData = new FormData();
    Object.keys(testCaseData).forEach(key => {
      if (key === 'bug_screenshot' && testCaseData[key] instanceof File) {
        formData.append(key, testCaseData[key]);
      } else if (testCaseData[key] !== null && testCaseData[key] !== undefined) {
        formData.append(key, testCaseData[key]);
      }
    });

    return this.http.post<any>(`${this.baseUrl}/test-cases/create/`, formData, this.getHeadersForFormData());
  }

  private updateTestCaseWithFormDataFromObject(id: number, testCaseData: any): Observable<any> {
    const formData = new FormData();
    Object.keys(testCaseData).forEach(key => {
      if (key === 'bug_screenshot' && testCaseData[key] instanceof File) {
        formData.append(key, testCaseData[key]);
      } else if (testCaseData[key] !== null && testCaseData[key] !== undefined) {
        formData.append(key, testCaseData[key]);
      }
    });

    return this.http.put<any>(`${this.baseUrl}/test-cases/${id}/update/`, formData, this.getHeadersForFormData());
  }

  // Public methods that accept FormData directly
  updateTestCaseWithFormData(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/test-cases/${id}/update/`, formData, this.getHeadersForFormData());
  }

  addTestCaseWithFormData(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/test-cases/create/`, formData, this.getHeadersForFormData());
  }

  // Multiple screenshots endpoints
  addTestCaseWithMultipleScreenshots(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/test-cases/create/`, formData, this.getHeadersForFormData());
  }

  updateTestCaseWithMultipleScreenshots(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/test-cases/${id}/update/`, formData, this.getHeadersForFormData());
  }

  // Screenshots management
  getBugScreenshots(testCaseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/test-cases/${testCaseId}/screenshots/`, this.getHeaders());
  }

  // ✅ ADDED: Video management methods
  getBugVideos(testCaseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/test-cases/${testCaseId}/videos/`, this.getHeaders());
  }

  uploadBugVideos(testCaseId: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/test-cases/${testCaseId}/upload-videos/`, formData, this.getHeadersForFormData());
  }

  deleteBugVideo(videoId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/videos/${videoId}/delete/`, this.getHeaders());
  }

  uploadBugScreenshots(testCaseId: number, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/test-cases/${testCaseId}/upload-screenshots/`, formData, this.getHeadersForFormData());
  }

  deleteBugScreenshot(screenshotId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/screenshots/${screenshotId}/delete/`, this.getHeaders());
  }

  getTestCaseHistory(testCaseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/test-cases/${testCaseId}/history/`, this.getHeaders());
  }

  // Get test cases by project
  getTestCasesByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/project/${projectId}/test-cases/`, this.getHeaders());
  }

  getBugScreenshotUrl(screenshotPath: string): string {
    if (!screenshotPath) return '';
    if (screenshotPath.startsWith('http')) {
      return screenshotPath;
    }
    if (screenshotPath.startsWith('/media/')) {
      return `${this.baseUrl}${screenshotPath}`;
    }
    const cleanPath = screenshotPath.startsWith('/') ? screenshotPath : `/${screenshotPath}`;
    return `${this.baseUrl}/media${cleanPath}`;
  }

  // ✅ ADDED: Get bug video URL
  getBugVideoUrl(videoPath: string): string {
    if (!videoPath) return '';
    if (videoPath.startsWith('http')) {
      return videoPath;
    }
    if (videoPath.startsWith('/media/')) {
      return `${this.baseUrl}${videoPath}`;
    }
    const cleanPath = videoPath.startsWith('/') ? videoPath : `/${videoPath}`;
    return `${this.baseUrl}/media${cleanPath}`;
  }

  // -----------------------------
  // Template download & bulk import - UPDATED WITH CORRECT ENDPOINTS
  // -----------------------------

  /**
   * Download test-case template - UPDATED WITH CORRECT ENDPOINT
   * Now requires project_id as query parameter
   */
  downloadTemplate(projectId: number): Observable<Blob> {
    if (!projectId) {
      throw new Error('Project ID is required to download template');
    }

    const params = new HttpParams().set('project_id', projectId.toString());

    return this.http.get(`${this.baseUrl}/test-cases/download-template/`, {
      ...this.getHeaders(),
      params,
      responseType: 'blob'
    });
  }

  /**
   * Bulk import endpoint - UPDATED WITH CORRECT ENDPOINT
   * Now requires project_id in form data along with the file
   */
  bulkImportTestCases(projectId: number, file: File): Observable<any> {
    if (!projectId) {
      throw new Error('Project ID is required for import');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId.toString());

    return this.http.post<any>(`${this.baseUrl}/testcases/template/import/`, formData, this.getHeadersForFormData());
  }
}