import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:8000'; // Remove /api from base URL

  constructor(private http: HttpClient) {}

  getDashboardCounts(): Observable<DashboardCounts> {
    return this.http.get<DashboardCounts>(`${this.baseUrl}/dashboard/counts/`);
  }

  getUpcomingDeadlines(): Observable<{deadlines: UpcomingDeadline[]}> {
    return this.http.get<{deadlines: UpcomingDeadline[]}>(`${this.baseUrl}/dashboard/upcoming-deadlines/`);
  }

  getProjectStatusOverview(): Observable<ProjectStatusOverview> {
    return this.http.get<ProjectStatusOverview>(`${this.baseUrl}/dashboard/project-status/`);
  }
}