import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  private baseUrl = environment.apiBaseUrl;  // ✅ Base API URL

  constructor(private http: HttpClient) {}

  // ✅ Function to attach Authorization header
  private getHeaders() {
    const token = sessionStorage.getItem('accessToken');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // ✅ Get all clients
  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/clients/`, this.getHeaders());
  }

  // ✅ Add a new client
  addClient(clientData: any): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/create-clients/`, clientData, this.getHeaders());
  }

  // ✅ Update client
  updateClient(id: number, clientData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/clients/${id}/update/`, clientData, this.getHeaders());
  }

  // ✅ Delete client
  deleteClient(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/clients/${id}/delete/`, this.getHeaders());
  }
}