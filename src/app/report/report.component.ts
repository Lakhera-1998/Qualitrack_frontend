import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../services/report.service';
import { ClientsService } from '../clients.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-reports',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ReportComponent implements OnInit {
  clients: any[] = [];
  filteredProjects: any[] = [];
  selectedClientId: number | null = null;
  selectedProjectId: number | null = null;

  // Report data
  projectReport: any = null;
  detailedReport: any[] = [];

  // UI states
  isLoading = false;
  activeTab: 'summary' | 'detailed' = 'summary';
  expandedRequirements: Set<number> = new Set();

  // Charts data (simplified - you can integrate with Chart.js or similar)
  priorityChartData: any = null;
  testStatusChartData: any = null;
  bugStatusChartData: any = null;
  dailyExecutionChartData: any = null;

  constructor(
    private reportService: ReportService,
    private clientsService: ClientsService,
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientsService.getClients().subscribe({
      next: (data: any[]) => {
        this.clients = data;
      },
      error: (error: any) => {
        console.error('Error fetching clients:', error);
        this.showError('Error loading clients: ' + (error.error?.message || error.message));
      }
    });
  }

  onClientChange(): void {
    this.selectedProjectId = null;
    this.projectReport = null;
    this.detailedReport = [];
    this.filteredProjects = [];

    if (this.selectedClientId) {
      this.loadProjectsByClient(this.selectedClientId);
    }
  }

  loadProjectsByClient(clientId: number): void {
    this.projectService.getProjectsByClient(clientId).subscribe({
      next: (data: any[]) => {
        this.filteredProjects = data;
      },
      error: (error: any) => {
        console.error('Error fetching projects by client:', error);
        this.showError('Error loading projects: ' + (error.error?.message || error.message));
      }
    });
  }

  onProjectChange(): void {
    this.projectReport = null;
    this.detailedReport = [];
    this.expandedRequirements.clear();

    if (this.selectedProjectId) {
      this.loadProjectReport();
    }
  }

  loadProjectReport(): void {
    if (!this.selectedProjectId) return;

    this.isLoading = true;
    this.reportService.getProjectReport(this.selectedProjectId).subscribe({
      next: (data: any) => {
        this.projectReport = data;
        this.prepareChartData();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching project report:', error);
        this.showError('Error loading project report: ' + (error.error?.message || error.message));
        this.isLoading = false;
      }
    });
  }

  loadDetailedReport(): void {
    if (!this.selectedProjectId) return;

    this.isLoading = true;
    this.reportService.getDetailedTestCaseReport(this.selectedProjectId).subscribe({
      next: (data: any[]) => {
        this.detailedReport = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching detailed report:', error);
        this.showError('Error loading detailed report: ' + (error.error?.message || error.message));
        this.isLoading = false;
      }
    });
  }

  switchTab(tab: 'summary' | 'detailed'): void {
    this.activeTab = tab;
    if (tab === 'detailed' && this.detailedReport.length === 0 && this.selectedProjectId) {
      this.loadDetailedReport();
    }
  }

  toggleRequirementExpansion(requirementId: number): void {
    if (this.expandedRequirements.has(requirementId)) {
      this.expandedRequirements.delete(requirementId);
    } else {
      this.expandedRequirements.add(requirementId);
    }
  }

  isRequirementExpanded(requirementId: number): boolean {
    return this.expandedRequirements.has(requirementId);
  }

  prepareChartData(): void {
    if (!this.projectReport) return;

    // Priority Chart Data
    this.priorityChartData = {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{
        data: [
          this.projectReport.critical_priority_requirements,
          this.projectReport.high_priority_requirements,
          this.projectReport.medium_priority_requirements,
          this.projectReport.low_priority_requirements
        ],
        backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745']
      }]
    };

    // Test Status Chart Data
    this.testStatusChartData = {
      labels: ['Passed', 'Failed', 'Not Tested'],
      datasets: [{
        data: [
          this.projectReport.passed_test_cases,
          this.projectReport.failed_test_cases,
          this.projectReport.not_tested_cases
        ],
        backgroundColor: ['#28a745', '#dc3545', '#6c757d']
      }]
    };

    // Bug Status Chart Data
    this.bugStatusChartData = {
      labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
      datasets: [{
        data: [
          this.projectReport.open_bugs,
          this.projectReport.in_progress_bugs,
          this.projectReport.resolved_bugs,
          this.projectReport.closed_bugs
        ],
        backgroundColor: ['#dc3545', '#fd7e14', '#17a2b8', '#28a745']
      }]
    };

    // Daily Execution Chart Data
    const dailyStats = this.projectReport.daily_execution_stats;
    const dates = Object.keys(dailyStats).sort();
    this.dailyExecutionChartData = {
      labels: dates.map(date => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: 'Passed',
          data: dates.map(date => dailyStats[date].passed),
          backgroundColor: '#28a745',
          borderColor: '#28a745'
        },
        {
          label: 'Failed',
          data: dates.map(date => dailyStats[date].failed),
          backgroundColor: '#dc3545',
          borderColor: '#dc3545'
        },
        {
          label: 'Total Executed',
          data: dates.map(date => dailyStats[date].total_executed),
          backgroundColor: '#007bff',
          borderColor: '#007bff'
        }
      ]
    };
  }

  getProgressBarClass(percentage: number): string {
    if (percentage >= 80) return 'progress-high';
    if (percentage >= 60) return 'progress-medium';
    if (percentage >= 40) return 'progress-low';
    return 'progress-very-low';
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pass': return 'status-badge pass';
      case 'fail': return 'status-badge fail';
      case 'not tested yet': return 'status-badge not-tested';
      case 'open': return 'status-badge open';
      case 'in progress': return 'status-badge in-progress';
      case 'resolved': return 'status-badge resolved';
      case 'closed': return 'status-badge closed';
      default: return 'status-badge unknown';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'priority-badge critical';
      case 'high': return 'priority-badge high';
      case 'medium': return 'priority-badge medium';
      case 'low': return 'priority-badge low';
      default: return 'priority-badge unknown';
    }
  }

  getDailyStatsDates(): string[] {
    if (!this.projectReport?.daily_execution_stats) return [];
    return Object.keys(this.projectReport.daily_execution_stats).sort();
  }

  get currentDate(): Date {
      return new Date();
  }

  showError(message: string): void {
    // You can implement a toast notification system here
    alert(message);
  }

  exportToPDF(): void {
    // Implement PDF export functionality
    console.log('Exporting to PDF...');
  }

  exportToExcel(): void {
    // Implement Excel export functionality
    console.log('Exporting to Excel...');
  }
}