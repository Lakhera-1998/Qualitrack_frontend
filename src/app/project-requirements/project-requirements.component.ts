import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequirementService } from '../services/requirement.service';
import { ProjectService } from '../services/project.service';
import { ClientsService } from '../clients.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-requirements',
  templateUrl: './project-requirements.component.html',
  styleUrls: ['./project-requirements.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProjectRequirementsComponent implements OnInit {
  clients: any[] = [];
  filteredProjects: any[] = [];
  selectedClientId: number | null = null;
  selectedClientName: string = '';
  selectedProjectId: number | null = null;
  project: any = null;
  requirements: any[] = [];

  newRequirement: any = {
    requirement_title: '',
    requirement: '',
    priority: 'Medium',
    reported_date: '',
    expected_delivery: null,
    actual_delivery: null,
    is_developed: false,
    is_tested: false,
    is_delivered: false,
    uat_testing: false,
    bug_raised_by_client_after_uat: false,
    bug_fixed: false,
    project: null
  };

  showRequirementPopup = false;
  isEditMode = false;
  editingRequirementId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requirementService: RequirementService,
    private projectService: ProjectService,
    private clientsService: ClientsService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientsService.getClients().subscribe({
      next: (data: any[]) => {
        this.clients = data;
      },
      error: (err) => console.error('Error fetching clients:', err)
    });
  }

  onClientChange(): void {
    this.selectedProjectId = null;
    this.project = null;
    this.requirements = [];
    this.filteredProjects = [];
    
    if (this.selectedClientId) {
      this.loadProjectsByClient(this.selectedClientId);
      
      const selectedClient = this.clients.find(client => client.id === this.selectedClientId);
      this.selectedClientName = selectedClient ? selectedClient.client_name : '';
    } else {
      this.selectedClientName = '';
    }
  }

  loadProjectsByClient(clientId: number): void {
    this.projectService.getProjectsByClient(clientId).subscribe({
      next: (data: any[]) => {
        this.filteredProjects = data;
      },
      error: (err) => console.error('Error fetching projects by client:', err)
    });
  }

  onProjectChange(): void {
    if (this.selectedProjectId) {
      this.loadProjectDetails();
      this.loadRequirements();
    } else {
      this.project = null;
      this.requirements = [];
    }
  }

  loadProjectDetails(): void {
    if (!this.selectedProjectId) return;
    
    this.projectService.getProject(this.selectedProjectId).subscribe({
      next: (data: any) => {
        this.project = data;
      },
      error: (err) => console.error('Error fetching project:', err)
    });
  }

  loadRequirements(): void {
    if (!this.selectedProjectId) return;
    
    this.requirementService.getRequirementsByProject(this.selectedProjectId).subscribe({
      next: (data: any[]) => {
        this.requirements = data;
      },
      error: (err) => console.error('Error fetching requirements:', err)
    });
  }

  getRequirementStatus(requirement: any): string {
    if (requirement.is_delivered) return 'delivered';
    if (requirement.is_tested) return 'tested';
    if (requirement.is_developed) return 'developed';
    return 'pending';
  }

  openAddRequirementPopup(): void {
    if (!this.selectedProjectId) return;
    
    this.isEditMode = false;
    this.newRequirement = {
      requirement_title: '',
      requirement: '',
      priority: 'Medium',
      reported_date: new Date().toISOString().split('T')[0],
      expected_delivery: null,
      actual_delivery: null,
      is_developed: false,
      is_tested: false,
      is_delivered: false,
      uat_testing: false,
      bug_raised_by_client_after_uat: false,
      bug_fixed: false,
      project: this.selectedProjectId
    };
    this.showRequirementPopup = true;
  }

  editRequirement(requirement: any): void {
    this.isEditMode = true;
    this.editingRequirementId = requirement.id;
    this.newRequirement = { ...requirement };
    this.showRequirementPopup = true;
  }

  closeRequirementPopup(): void {
    this.showRequirementPopup = false;
    this.isEditMode = false;
    this.editingRequirementId = null;
  }

  saveRequirement(): void {
    if (!this.newRequirement.requirement_title || !this.newRequirement.requirement || !this.newRequirement.reported_date) {
      alert('Please fill all required fields');
      return;
    }

    this.newRequirement.project = this.selectedProjectId;

    if (this.isEditMode && this.editingRequirementId) {
      this.requirementService.updateRequirement(this.editingRequirementId, this.newRequirement).subscribe({
        next: () => {
          this.loadRequirements();
          this.closeRequirementPopup();
        },
        error: (err) => console.error('Error updating requirement:', err)
      });
    } else {
      this.requirementService.addRequirement(this.newRequirement).subscribe({
        next: () => {
          this.loadRequirements();
          this.closeRequirementPopup();
        },
        error: (err) => console.error('Error adding requirement:', err)
      });
    }
  }

  viewTestCases(requirement: any): void {
    this.router.navigate(['/test-cases', requirement.id]);
  }
}