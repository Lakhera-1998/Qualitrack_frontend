import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TestDataService {
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
      })
    };
  }

  getTestDataByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/test-data/?project=${projectId}`, this.getHeaders());
  }

  getTestDataByTestCase(testCaseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/test-data/?test_case=${testCaseId}`, this.getHeaders());
  }

  createTestData(testData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/test-data/create/`, testData, this.getHeadersForFormData());
  }

  updateTestData(id: number, testData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/test-data/${id}/update/`, testData, this.getHeadersForFormData());
  }

  // ✅ ADDED: Method to get file URL
  getFileUrl(filePath: string): string {
    if (!filePath) return '';
    
    // Check if it's already a full URL
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    // If the path already starts with /media/, use it as is
    if (filePath.startsWith('/media/')) {
      return `${this.baseUrl}${filePath}`;
    }
    
    // If it's just a filename or relative path, prepend with /media/
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${this.baseUrl}/media${cleanPath}`;
  }

  // ✅ ADDED: Method to get image URL
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // Check if it's already a full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If the path already starts with /media/, use it as is
    if (imagePath.startsWith('/media/')) {
      return `${this.baseUrl}${imagePath}`;
    }
    
    // If it's just a filename or relative path, prepend with /media/
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${this.baseUrl}/media${cleanPath}`;
  }
}