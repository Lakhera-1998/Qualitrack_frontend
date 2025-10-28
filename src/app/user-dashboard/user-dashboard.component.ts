import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, UserDashboardData, UpcomingDeadline } from '../services/dashboard.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {

  // User-specific stats
  myProjectCount = 0;
  myClientCount = 0;
  activeMyProjects = 0;
  completedMyProjects = 0;
  pendingTasksCount = 0;
  overdueTasksCount = 0;
  upcomingTasksCount = 0;

  // Deadlines
  upcomingDeadlines: UpcomingDeadline[] = [];
  overdueProjects: UpcomingDeadline[] = [];
  recentActivities: any[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadUserDashboardData();
  }

  loadUserDashboardData(): void {
    this.dashboardService.getUserDashboardData().subscribe({
      next: (data: UserDashboardData) => {
        this.myProjectCount = data.my_projects.total;
        this.myClientCount = data.my_clients;
        this.activeMyProjects = data.my_projects.active;
        this.completedMyProjects = data.my_projects.completed;
        this.pendingTasksCount = data.tasks.pending;
        this.overdueTasksCount = data.tasks.overdue;
        this.upcomingTasksCount = data.tasks.upcoming;
        
        this.upcomingDeadlines = data.upcoming_deadlines;
        this.overdueProjects = data.overdue_projects;
        this.recentActivities = data.recent_activities;
      },
      error: (err) => console.error('Error loading user dashboard data:', err)
    });
  }

  getDaysUntilDeadline(dueDate: string): number {
    const today = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getOverdueDays(dueDate: string): number {
    const today = new Date();
    const deadline = new Date(dueDate);
    const diffTime = today.getTime() - deadline.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}