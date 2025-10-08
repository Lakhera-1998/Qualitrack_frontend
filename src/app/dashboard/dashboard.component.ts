import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { ClientsService } from '../clients.service';
import { ProjectService } from '../services/project.service';
import { UserService } from '../services/user.service';

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
  projectStatusLabels: string[] = ['Active Projects', 'Inactive Projects'];
  projectStatusData: ChartData<'pie'> = {
    labels: this.projectStatusLabels,
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
      },
      tooltip: { 
        enabled: true 
      }
    },
    maintainAspectRatio: false
  };

  // ===== Upcoming Deadlines =====
  upcomingDeadlines: any[] = [];

  constructor(
    private clientsService: ClientsService,
    private projectService: ProjectService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadCounts();
    this.loadUpcomingDeadlines();
  }

  // ===== Load Counts and Chart =====
  loadCounts(): void {
    this.clientsService.getClients().subscribe({
      next: (clients) => {
        this.clientCount = clients.filter(c => c.is_active !== false).length;
        this.inactiveClients = clients.filter(c => c.is_active === false).length;
      },
      error: (err) => console.error('Error loading clients:', err)
    });

    this.projectService.getProjects().subscribe({
      next: (projects) => {
        const active = projects.filter(p => p.is_active !== false).length;
        const inactive = projects.filter(p => p.is_active === false).length;
        this.projectCount = active;
        this.inactiveProjects = inactive;

        // Update chart data
        this.projectStatusData = {
          ...this.projectStatusData,
          datasets: [
            {
              ...this.projectStatusData.datasets[0],
              data: [active, inactive]
            }
          ]
        };
      },
      error: (err) => console.error('Error loading projects:', err)
    });

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.employeeCount = users.filter(u => u.is_active !== false).length;
        this.inactiveEmployees = users.filter(u => u.is_active === false).length;
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  // ===== Load Upcoming Deadlines =====
  loadUpcomingDeadlines(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        // Assuming each project has `end_date` and `client_name`
        const today = new Date();
        const next15Days = new Date();
        next15Days.setDate(today.getDate() + 15);

        this.upcomingDeadlines = projects
          .filter((p: any) => {
            if (!p.end_date) return false;
            const due = new Date(p.end_date);
            return due >= today && due <= next15Days;
          })
          .map((p: any) => ({
            project_name: p.name,
            client_name: p.client_name || 'N/A',
            due_date: p.end_date
          }))
          .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      },
      error: (err) => console.error('Error loading deadlines:', err)
    });
  }
}