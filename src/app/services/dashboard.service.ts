import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardCounts {
  employees: {
    active: number;
    inactive: number;
  };
  clients: {
    active: number;
    inactive: number;
  };
  projects: {
    active: number;
    inactive: number;
  };
}

export interface UpcomingDeadline {
  project_name: string;
  client_name: string;
  due_date: string;
}

export interface ProjectStatusOverview {
  active_projects: number;
  inactive_projects: number;
}

export interface UserDashboardData {
  my_projects: {
    total: number;
    active: number;
    completed: number;
  };
  my_clients: number;
  tasks: {
    pending: number;
    overdue: number;
    upcoming: number;
  };
  upcoming_deadlines: UpcomingDeadline[];
  overdue_projects: UpcomingDeadline[];
  recent_activities: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Helper method to get headers with authentication token
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getDashboardCounts(): Observable<DashboardCounts> {
    return this.http.get<DashboardCounts>(`${this.baseUrl}/dashboard/counts/`, {
      headers: this.getAuthHeaders()
    });
  }

  getUpcomingDeadlines(): Observable<{deadlines: UpcomingDeadline[]}> {
    return this.http.get<{deadlines: UpcomingDeadline[]}>(`${this.baseUrl}/dashboard/upcoming-deadlines/`, {
      headers: this.getAuthHeaders()
    });
  }

  getProjectStatusOverview(): Observable<ProjectStatusOverview> {
    return this.http.get<ProjectStatusOverview>(`${this.baseUrl}/dashboard/project-status/`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserDashboardData(): Observable<UserDashboardData> {
    return this.http.get<UserDashboardData>(`${this.baseUrl}/user-dashboard/`, {
      headers: this.getAuthHeaders()
    });
  }
}