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
  filteredRequirements: any[] = [];
  
  // Search and filter properties
  searchText: string = '';
  selectedPriority: string = '';

  // ✅ Pagination properties
  currentPage: number = 1;
  pageSize: number = 5; // Only 5 records per page as requested
  visiblePagesCount: number = 3;

  // Form validation
  formErrors: any = {
    requirement_title: '',
    requirement: '',
    priority: '',
    reported_date: ''
  };

  // Success message
  showSuccessMessage: boolean = false;
  successMessage: string = '';

  newRequirement: any = {
    requirement_title: '',
    requirement: '',
    priority: '',
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
    this.filteredRequirements = [];
    this.filteredProjects = [];
    this.searchText = '';
    this.selectedPriority = '';
    this.currentPage = 1; // ✅ Reset to first page
    
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
    this.searchText = '';
    this.selectedPriority = '';
    this.currentPage = 1; // ✅ Reset to first page
    
    if (this.selectedProjectId) {
      this.loadProjectDetails();
      this.loadRequirements();
    } else {
      this.project = null;
      this.requirements = [];
      this.filteredRequirements = [];
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
        this.filteredRequirements = [...this.requirements];
        this.currentPage = 1; // ✅ Reset to first page when data loads
      },
      error: (err) => console.error('Error fetching requirements:', err)
    });
  }

  // ✅ Pagination methods
  paginatedRequirements(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredRequirements.slice(startIndex, endIndex);
  }

  totalPages(): number {
    return Math.ceil(this.filteredRequirements.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const pages: number[] = [];
    
    if (total <= this.visiblePagesCount) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - Math.floor(this.visiblePagesCount / 2));
      let end = start + this.visiblePagesCount - 1;
      
      if (end > total) {
        end = total;
        start = Math.max(1, end - this.visiblePagesCount + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.pageSize;
    return Math.min(end, this.filteredRequirements.length);
  }

  // Filter requirements based on search text and priority
  filterRequirements(): void {
    this.filteredRequirements = this.requirements.filter(req => {
      const matchesSearch = !this.searchText || 
        req.requirement_title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        req.requirement.toLowerCase().includes(this.searchText.toLowerCase());
      
      const matchesPriority = !this.selectedPriority || req.priority === this.selectedPriority;
      
      return matchesSearch && matchesPriority;
    });
    this.currentPage = 1; // ✅ Reset to first page when filtering
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
    this.clearFormErrors();
    this.newRequirement = {
      requirement_title: '',
      requirement: '',
      priority: '',
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
    this.clearFormErrors();
    this.editingRequirementId = requirement.id;
    this.newRequirement = { ...requirement };
    this.showRequirementPopup = true;
  }

  closeRequirementPopup(): void {
    this.showRequirementPopup = false;
    this.isEditMode = false;
    this.editingRequirementId = null;
    this.clearFormErrors();
  }

  // Validate form fields
  validateForm(): boolean {
    let isValid = true;
    this.clearFormErrors();

    if (!this.newRequirement.requirement_title) {
      this.formErrors.requirement_title = 'Requirement title is required';
      isValid = false;
    }

    if (!this.newRequirement.requirement) {
      this.formErrors.requirement = 'Requirement description is required';
      isValid = false;
    }

    if (!this.newRequirement.priority) {
      this.formErrors.priority = 'Priority is required';
      isValid = false;
    }

    if (!this.newRequirement.reported_date) {
      this.formErrors.reported_date = 'Reported date is required';
      isValid = false;
    }

    return isValid;
  }

  clearFormErrors(): void {
    this.formErrors = {
      requirement_title: '',
      requirement: '',
      priority: '',
      reported_date: ''
    };
  }

  saveRequirement(): void {
    if (!this.validateForm()) {
      return;
    }

    this.newRequirement.project = this.selectedProjectId;

    if (this.isEditMode && this.editingRequirementId) {
      this.requirementService.updateRequirement(this.editingRequirementId, this.newRequirement).subscribe({
        next: () => {
          this.loadRequirements();
          this.closeRequirementPopup();
          this.showSuccess('Requirement updated successfully!');
        },
        error: (err) => console.error('Error updating requirement:', err)
      });
    } else {
      this.requirementService.addRequirement(this.newRequirement).subscribe({
        next: () => {
          this.loadRequirements();
          this.closeRequirementPopup();
          this.showSuccess('Requirement added successfully!');
        },
        error: (err) => console.error('Error adding requirement:', err)
      });
    }
  }

  // Show success message
  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      this.hideSuccessMessage();
    }, 3000);
  }

  // Hide success message
  hideSuccessMessage(): void {
    this.showSuccessMessage = false;
    this.successMessage = '';
  }

  viewTestCases(requirement: any): void {
    this.router.navigate(['/test-cases', requirement.id]);
  }
}