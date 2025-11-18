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
  allProjects: any[] = [];
  selectedProjectId: number | null = null;
  project: any = null;
  requirements: any[] = [];
  filteredRequirements: any[] = [];
  
  // Search and filter properties
  searchText: string = '';
  selectedPriority: string = '';
  filterIsDeveloped: boolean = false;
  filterIsTested: boolean = false;
  filterIsDelivered: boolean = false;
  filtersApplied: boolean = false;

  // ✅ Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;

  // Form validation
  formErrors: any = {
    project: '',
    requirement_title: '',
    requirement: '',
    priority: '',
    reported_date: ''
  };

  // Success message
  showSuccessMessage: boolean = false;
  successMessage: string = '';

  // Error message
  showErrorMessage: boolean = false;
  errorMessage: string = '';

  // Import functionality
  showImportPopup: boolean = false;
  showImportConfirmation: boolean = false;
  selectedFile: File | null = null;
  isDragOver: boolean = false;
  importErrors: string[] = [];
  requirementCount: number = 0;

  // Filter popup
  showFilterPopup: boolean = false;

  // Requirement details popup
  showRequirementDetailsPopup: boolean = false;
  selectedRequirement: any = null;

  newRequirement: any = {
    project: '',
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
    bug_fixed: false
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
    this.loadAllProjects();
  }

  loadAllProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (data: any[]) => {
        this.allProjects = data;
      },
      error: (err) => console.error('Error fetching all projects:', err)
    });
  }

  openFilterPopup(): void {
    this.showFilterPopup = true;
  }

  closeFilterPopup(): void {
    this.showFilterPopup = false;
  }

  applyFilters(): void {
    this.filtersApplied = true;
    this.currentPage = 1;
    
    if (this.selectedProjectId) {
      this.loadProjectDetails();
      this.loadRequirements();
    } else {
      this.loadAllRequirements();
    }
    
    this.closeFilterPopup();
  }

  clearFilters(): void {
    this.selectedProjectId = null;
    this.selectedPriority = '';
    this.filterIsDeveloped = false;
    this.filterIsTested = false;
    this.filterIsDelivered = false;
    this.searchText = '';
    this.filtersApplied = false;
    this.requirements = [];
    this.filteredRequirements = [];
    this.project = null;
    this.closeFilterPopup();
  }

  loadAllRequirements(): void {
    this.requirementService.getAllRequirements().subscribe({
      next: (data: any[]) => {
        this.requirements = data;
        this.applyAllFilters();
      },
      error: (err) => console.error('Error fetching all requirements:', err)
    });
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
        this.applyAllFilters();
      },
      error: (err) => console.error('Error fetching requirements:', err)
    });
  }

  applyAllFilters(): void {
    this.filteredRequirements = this.requirements.filter(req => {
      // Priority filter
      const matchesPriority = !this.selectedPriority || req.priority === this.selectedPriority;
      
      // Boolean filters
      const matchesIsDeveloped = !this.filterIsDeveloped || req.is_developed === true;
      const matchesIsTested = !this.filterIsTested || req.is_tested === true;
      const matchesIsDelivered = !this.filterIsDelivered || req.is_delivered === true;
      
      return matchesPriority && matchesIsDeveloped && matchesIsTested && matchesIsDelivered;
    });
    
    this.currentPage = 1;
  }

  // ✅ Excel Template Download - now enabled without project selection
  downloadTemplate(): void {
    this.requirementService.downloadTemplate().subscribe({
      next: (response: any) => {
        // Create blob from response
        const blob = new Blob([response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `requirement_template.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.showSuccess('Template downloaded successfully!');
      },
      error: (err) => {
        console.error('Error downloading template:', err);
        this.showError('Failed to download template. Please try again.');
      }
    });
  }

  // ✅ Import Requirements Functionality - now enabled without project selection
  openImportPopup(): void {
    this.showImportPopup = true;
    this.selectedFile = null;
    this.importErrors = [];
    this.isDragOver = false;
  }

  closeImportPopup(): void {
    this.showImportPopup = false;
    this.selectedFile = null;
    this.importErrors = [];
    this.isDragOver = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  handleFileSelection(file: File): void {
    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension || '')) {
      this.showError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showError('File size should be less than 10MB');
      return;
    }

    this.selectedFile = file;
    this.importErrors = [];
    
    // Pre-validate file structure
    this.preValidateExcelFile(file);
  }

  preValidateExcelFile(file: File): void {
    // Basic validation - in a real app, you might want to parse the Excel file
    // and validate its structure before uploading
    this.requirementCount = 1; // Default assumption
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  removeFile(): void {
    this.selectedFile = null;
    this.importErrors = [];
  }

  getRequirementCount(): number {
    return this.requirementCount;
  }

  confirmImport(): void {
    if (!this.selectedFile) {
      this.showError('Please select a file to import');
      return;
    }

    this.showImportConfirmation = true;
  }

  closeImportConfirmation(): void {
    this.showImportConfirmation = false;
  }

  importRequirements(): void {
    if (!this.selectedFile) return;

    this.requirementService.importRequirements(this.selectedFile).subscribe({
      next: (response: any) => {
        this.showImportConfirmation = false;
        this.closeImportPopup();
        
        if (response.errors && response.errors.length > 0) {
          this.showError(`Import completed with ${response.errors.length} errors. ${response.message}`);
          this.importErrors = response.errors;
        } else {
          this.showSuccess(response.message || 'Requirements imported successfully!');
          // Refresh requirements if filters are applied
          if (this.filtersApplied) {
            if (this.selectedProjectId) {
              this.loadRequirements();
            } else {
              this.loadAllRequirements();
            }
          }
        }
      },
      error: (err) => {
        console.error('Error importing requirements:', err);
        
        if (err.error && err.error.details) {
          this.importErrors = err.error.details;
          this.showError('Validation errors found in Excel file. Please check the errors below.');
        } else {
          this.showError(err.error?.error || 'Failed to import requirements. Please check the file format.');
        }
      }
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

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.pageSize;
    return Math.min(end, this.filteredRequirements.length);
  }

  // Filter requirements based on search text
  filterRequirements(): void {
    if (!this.searchText) {
      this.applyAllFilters();
      return;
    }
    
    this.filteredRequirements = this.requirements.filter(req => {
      const matchesSearch = req.requirement_title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        req.requirement.toLowerCase().includes(this.searchText.toLowerCase());
      
      return matchesSearch;
    });
    this.currentPage = 1;
  }

  getRequirementStatus(requirement: any): string {
    if (requirement.is_delivered) return 'delivered';
    if (requirement.is_tested) return 'tested';
    if (requirement.is_developed) return 'developed';
    return 'pending';
  }

  getClientName(clientId: number): string {
    // This will be used in the project dropdown to show client name
    // You might need to adjust this based on your project data structure
    return ''; // Remove this if not needed
  }

  // Open requirement details popup
  openRequirementDetails(requirement: any): void {
    this.selectedRequirement = requirement;
    this.showRequirementDetailsPopup = true;
  }

  // Close requirement details popup
  closeRequirementDetails(): void {
    this.showRequirementDetailsPopup = false;
    this.selectedRequirement = null;
  }

  openAddRequirementPopup(): void {
    this.isEditMode = false;
    this.clearFormErrors();
    this.newRequirement = {
      project: '',
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
      bug_fixed: false
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

    if (!this.newRequirement.project) {
      this.formErrors.project = 'Project is required';
      isValid = false;
    }

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
      project: '',
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

    if (this.isEditMode && this.editingRequirementId) {
      this.requirementService.updateRequirement(this.editingRequirementId, this.newRequirement).subscribe({
        next: () => {
          // Refresh requirements if filters are applied
          if (this.filtersApplied) {
            if (this.selectedProjectId) {
              this.loadRequirements();
            } else {
              this.loadAllRequirements();
            }
          }
          this.closeRequirementPopup();
          this.showSuccess('Requirement updated successfully!');
        },
        error: (err) => console.error('Error updating requirement:', err)
      });
    } else {
      this.requirementService.addRequirement(this.newRequirement).subscribe({
        next: () => {
          // Refresh requirements if filters are applied
          if (this.filtersApplied) {
            if (this.selectedProjectId) {
              this.loadRequirements();
            } else {
              this.loadAllRequirements();
            }
          }
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

  // Show error message
  showError(message: string): void {
    this.errorMessage = message;
    this.showErrorMessage = true;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      this.hideErrorMessage();
    }, 5000);
  }

  // Hide error message
  hideErrorMessage(): void {
    this.showErrorMessage = false;
    this.errorMessage = '';
  }

  viewTestCases(requirement: any): void {
    this.router.navigate(['/test-cases', requirement.id]);
  }
}