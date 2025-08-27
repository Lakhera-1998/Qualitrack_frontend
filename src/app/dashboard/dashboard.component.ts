import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsService } from '../clients.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  projectCount: number = 0;
  clientCount: number = 0;
  employeeCount: number = 5; // Hardcoded for now

  recentActivities = [
    { message: 'New project "E-commerce Platform" created', time: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { message: 'Client "ABC Corp" added', time: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    { message: 'Test case for login functionality updated', time: new Date(Date.now() - 1000 * 60 * 60 * 8) },
    { message: 'Requirement analysis completed for Project X', time: new Date(Date.now() - 1000 * 60 * 60 * 12) }
  ];

  constructor(
    private clientsService: ClientsService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadCounts();
  }

  loadCounts(): void {
    this.clientsService.getClients().subscribe({
      next: (clients) => {
        this.clientCount = clients.length;
      },
      error: (err) => {
        console.error('Error loading clients:', err);
      }
    });

    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projectCount = projects.length;
      },
      error: (err) => {
        console.error('Error loading projects:', err);
      }
    });
  }
}