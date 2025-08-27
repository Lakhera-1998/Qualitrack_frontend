// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class ClientsService {

//   private baseUrl = 'http://127.0.0.1:8000';

//   constructor(private http: HttpClient) {}

//   private getHeaders() {
//     const token = sessionStorage.getItem('accessToken');
//     return {
//       headers: new HttpHeaders({
//         'Authorization': `Bearer ${token}`
//       })
//     };
//   }

//   getClients(): Observable<any[]> {
//     return this.http.get<any[]>(`${this.baseUrl}/clients/`, this.getHeaders());
//   }

//   addClient(clientData: any): Observable<any> {
//     return this.http.post<any>(`${this.baseUrl}/create-clients/`, clientData, this.getHeaders());
//   }

//   // ✅ Update client
//   updateClient(id: number, clientData: any): Observable<any> {
//     return this.http.put<any>(`${this.baseUrl}/update-clients/${id}/`, clientData, this.getHeaders());
//   }

//    // ✅ Delete client
//   deleteClient(id: number): Observable<any> {
//     return this.http.delete<any>(`${this.baseUrl}/delete-clients/${id}/`, this.getHeaders());
//   }
// }


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  private baseUrl = 'http://127.0.0.1:8000';  // ✅ Base API URL

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

  // ✅ Update client (fixed URL)
  updateClient(id: number, clientData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/clients/${id}/update/`, clientData, this.getHeaders());
  }

  // ✅ Delete client
  deleteClient(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete-clients/${id}/`, this.getHeaders());
  }
}
