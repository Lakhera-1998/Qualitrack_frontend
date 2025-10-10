import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType, Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import { DashboardService, DashboardCounts, UpcomingDeadline, ProjectStatusOverview } from '../services/dashboard.service';

// ✅ Register the required components for pie chart
Chart.register(ArcElement, Tooltip, Legend, PieController);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  projectCount = 0;
  clientCount = 0;
  employeeCount = 0;

  inactiveProjects = 0;
  inactiveClients = 0;
  inactiveEmployees = 0;

  // ===== Chart Data =====
  projectStatusData: ChartData<'pie'> = {
    labels: ['Active Projects', 'Inactive Projects'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#3f51b5', '#c5cae9'],
        hoverBackgroundColor: ['#283593', '#9fa8da'],
        borderWidth: 1,
      }
    ]
  };
  projectStatusType: ChartType = 'pie';
  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          usePointStyle: true,
        }
      }
    },
    maintainAspectRatio: false
  };

  // ===== Upcoming Deadlines =====
  upcomingDeadlines: UpcomingDeadline[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // ===== Load All Dashboard Data =====
  loadDashboardData(): void {
    this.loadCounts();
    this.loadUpcomingDeadlines();
    this.loadProjectStatusChart();
  }

  loadCounts(): void {
    this.dashboardService.getDashboardCounts().subscribe({
      next: (data: DashboardCounts) => {
        this.employeeCount = data.employees.active;
        this.inactiveEmployees = data.employees.inactive;
        this.clientCount = data.clients.active;
        this.inactiveClients = data.clients.inactive;
        this.projectCount = data.projects.active;
        this.inactiveProjects = data.projects.inactive;
      },
      error: (err) => console.error('Error loading dashboard counts:', err)
    });
  }

  loadProjectStatusChart(): void {
    this.dashboardService.getProjectStatusOverview().subscribe({
      next: (data: ProjectStatusOverview) => {
        this.projectStatusData = {
          labels: ['Active Projects', 'Inactive Projects'],
          datasets: [
            {
              data: [data.active_projects, data.inactive_projects],
              backgroundColor: ['#3f51b5', '#c5cae9'],
              hoverBackgroundColor: ['#283593', '#9fa8da'],
              borderWidth: 1,
            }
          ]
        };
      },
      error: (err) => console.error('Error loading project status:', err)
    });
  }

  loadUpcomingDeadlines(): void {
    this.dashboardService.getUpcomingDeadlines().subscribe({
      next: (data) => {
        this.upcomingDeadlines = data.deadlines;
      },
      error: (err) => console.error('Error loading upcoming deadlines:', err)
    });
  }
}