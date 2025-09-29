import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestCaseService } from '../services/test-case.service';
import { RequirementService } from '../services/requirement.service';
import { ProjectService } from '../services/project.service';
import { ClientsService } from '../clients.service';
import { TestDataService } from '../services/test-data.service';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-cases',
  templateUrl: './test-cases.component.html',
  styleUrls: ['./test-cases.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TestCasesComponent implements OnInit {
  clients: any[] = [];
  filteredProjects: any[] = [];
  filteredRequirements: any[] = [];
  selectedClientId: number | null = null;
  selectedClientName: string = '';
  selectedProjectId: number | null = null;
  selectedProjectName: string = '';
  selectedRequirementId: number | null = null;
  requirement: any = null;
  testCases: any[] = [];
  testDataList: any[] = [];
  users: any[] = [];
  currentUser: any = null;
  projectDevelopers: any[] = []; // Store project developers for assignment

  // Form validation
  formErrors: any = {
    title: '',
    description: '',
    expected_result: '',
    test_actions: '',
    bug_status: '',
    assigned_to: '' // Validation for assigned_to field
  };

  formTestDataErrors: any = {
    data_type: '',
    text_data: '',
    file_data: '',
    image_data: '',
    general: ''
  };

  formExecutionErrors: any = {
    status: '',
    bug_status: ''
  };

  // Success message
  showSuccessMessage: boolean = false;
  successMessage: string = '';

  newTestCase: any = {
    title: '',
    description: '',
    pre_conditions: '',
    test_actions: '',
    expected_result: '',
    test_data: null,
    is_automated: false,
    requirement: null,
    created_by: null,
    assigned_to: null, // assigned_to field
    is_executed: false,
    executed_by: null,
    executed_on: null,
    status: 'Not tested yet',
    actual_result: '',
    comments: '',
    bug_raised: false,
    bug_status: 'Open',
    bug_screenshot: null
  };

  newTestData: any = {
    data_type: 'text',
    text_data: '',
    file_data: null,
    image_data: null,
    file_data_name: '',
    image_data_name: ''
  };

  executionData: any = {
    status: 'Pass',
    actual_result: '',
    comments: '',
    bug_raised: false,
    bug_status: 'Open'
  };

  // UI flags
  showTestCasePopup = false;
  showExecutePopup = false;
  showTestDataPopup = false;
  isEditMode = false;
  isEditTestDataMode = false;

  // Editing states
  editingTestCaseId: number | null = null;
  editingTestDataId: number | null = null;
  executingTestCase: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private testCaseService: TestCaseService,
    private requirementService: RequirementService,
    private projectService: ProjectService,
    private clientsService: ClientsService,
    private testDataService: TestDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadClients();
    this.loadUsers();
  }

  // ✅ Loaders
  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      console.warn('No current user found in session storage');
    }
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
    this.selectedProjectName = '';
    this.selectedRequirementId = null;
    this.requirement = null;
    this.testCases = [];
    this.filteredProjects = [];
    this.filteredRequirements = [];
    this.testDataList = [];
    this.projectDevelopers = []; // Clear developers when client changes
    
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
      error: (error: any) => {
        console.error('Error fetching projects by client:', error);
        this.showError('Error loading projects: ' + (error.error?.message || error.message));
      }
    });
  }

  onProjectChange(): void {
    this.selectedRequirementId = null;
    this.requirement = null;
    this.testCases = [];
    this.filteredRequirements = [];
    this.projectDevelopers = []; // Clear developers when project changes
    
    if (this.selectedProjectId) {
      this.loadRequirementsByProject(this.selectedProjectId);
      this.loadTestData();
      this.loadProjectDevelopers(); // Load developers for the selected project
      
      const selectedProject = this.filteredProjects.find(project => project.id === this.selectedProjectId);
      this.selectedProjectName = selectedProject ? selectedProject.project_name : '';
    } else {
      this.selectedProjectName = '';
      this.testDataList = [];
    }
  }

  // Method to load project developers
  loadProjectDevelopers(): void {
    if (!this.selectedProjectId) return;
    
    this.projectService.getProjectDevelopers(this.selectedProjectId).subscribe({
      next: (data: any[]) => {
        this.projectDevelopers = data;
      },
      error: (error: any) => {
        console.error('Error fetching project developers:', error);
        this.showError('Error loading project developers: ' + (error.error?.message || error.message));
      }
    });
  }

  loadRequirementsByProject(projectId: number): void {
    this.requirementService.getRequirementsByProject(projectId).subscribe({
      next: (data: any[]) => {
        this.filteredRequirements = data;
      },
      error: (error: any) => {
        console.error('Error fetching requirements by project:', error);
        this.showError('Error loading requirements: ' + (error.error?.message || error.message));
      }
    });
  }

  onRequirementChange(): void {
    if (this.selectedRequirementId) {
      this.loadRequirementDetails();
      this.loadTestCases();
    } else {
      this.requirement = null;
      this.testCases = [];
    }
  }

  loadRequirementDetails(): void {
    if (!this.selectedRequirementId || !this.selectedProjectId) return;
    
    this.requirementService.getRequirement(this.selectedProjectId, this.selectedRequirementId).subscribe({
      next: (data: any) => {
        this.requirement = data;
      },
      error: (error: any) => {
        console.error('Error fetching requirement:', error);
        this.showError('Error loading requirement: ' + (error.error?.message || error.message));
      }
    });
  }

  loadTestCases(): void {
    if (!this.selectedRequirementId) return;
    
    this.testCaseService.getTestCasesByRequirement(this.selectedRequirementId).subscribe({
      next: (data: any[]) => {
        this.testCases = data;
      },
      error: (error: any) => {
        console.error('Error fetching test cases:', error);
        this.showError('Error loading test cases: ' + (error.error?.message || error.message));
      }
    });
  }

  loadTestData(): void {
    if (!this.selectedProjectId) {
      this.testDataList = [];
      return;
    }
    
    this.testDataService.getTestDataByProject(this.selectedProjectId).subscribe({
      next: (data: any[]) => {
        this.testDataList = data;
      },
      error: (error: any) => {
        console.error('Error fetching test data:', error);
        if (error.status !== 403) {
          this.formTestDataErrors.general = 'Error loading test data: ' + (error.error?.message || error.message);
        } else {
          this.testDataList = [];
        }
      }
    });
  }

  loadUsers(): void {
    this.users = [
      { id: 1, username: 'tester1', email: 'tester1@example.com' },
      { id: 2, username: 'tester2', email: 'tester2@example.com' }
    ];
  }

  // ✅ Helpers
  getUsername(userId: number): string {
    if (!userId) return '-';
    const user = this.users.find(u => u.id === userId);
    return user ? (user.username || user.email) : 'Unknown';
  }

  // Helper to get developer display name
  getDeveloperDisplay(developerId: number): string {
    if (!developerId) return '-';
    const developer = this.projectDevelopers.find(dev => dev.id === developerId);
    return developer ? developer.name : 'Unknown';
  }

  getTestDataDisplay(testData: any): string {
    if (!testData) return '';
    switch (testData.data_type) {
      case 'text':
        return `Text: ${testData.text_data?.substring(0, 50)}${testData.text_data?.length > 50 ? '...' : ''}`;
      case 'file':
        return `File: ${testData.file_data_name || 'Unknown file'}`;
      case 'image':
        return `Image: ${testData.image_data_name || 'Unknown image'}`;
      default:
        return `ID: ${testData.id}`;
    }
  }

  // ✅ Success/Error Messages
  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    
    setTimeout(() => {
      this.hideSuccessMessage();
    }, 3000);
  }

  showError(message: string): void {
    console.error('Error:', message);
  }

  hideSuccessMessage(): void {
    this.showSuccessMessage = false;
    this.successMessage = '';
  }

  // ✅ Form Validation
  validateTestCaseForm(): boolean {
    let isValid = true;
    this.clearFormErrors();

    if (!this.newTestCase.title) {
      this.formErrors.title = 'Title is required';
      isValid = false;
    }

    if (!this.newTestCase.description) {
      this.formErrors.description = 'Description is required';
      isValid = false;
    }

    if (!this.newTestCase.expected_result) {
      this.formErrors.expected_result = 'Expected result is required';
      isValid = false;
    }

    if (this.newTestCase.is_executed && !this.newTestCase.test_actions) {
      this.formErrors.test_actions = 'Test Actions is required when test case is executed';
      isValid = false;
    }

    if (this.newTestCase.bug_raised && !this.newTestCase.bug_status) {
      this.formErrors.bug_status = 'Bug Status is required when bug is raised';
      isValid = false;
    }

    // Validate executed_on if test case is executed
    if (this.newTestCase.is_executed && !this.newTestCase.executed_on) {
      this.formErrors.executed_on = 'Execution date is required when test case is executed';
      isValid = false;
    }

    return isValid;
  }

  validateTestDataForm(): boolean {
    let isValid = true;
    this.clearTestDataFormErrors();

    if (!this.newTestData.data_type) {
      this.formTestDataErrors.data_type = 'Data type is required';
      isValid = false;
    }

    if (this.newTestData.data_type === 'text' && !this.newTestData.text_data) {
      this.formTestDataErrors.text_data = 'Text data is required';
      isValid = false;
    }

    if (this.newTestData.data_type === 'file' && !this.newTestData.file_data) {
      this.formTestDataErrors.file_data = 'File is required';
      isValid = false;
    }

    if (this.newTestData.data_type === 'image' && !this.newTestData.image_data) {
      this.formTestDataErrors.image_data = 'Image is required';
      isValid = false;
    }

    return isValid;
  }

  validateExecutionForm(): boolean {
    let isValid = true;
    this.clearExecutionFormErrors();

    if (!this.executionData.status) {
      this.formExecutionErrors.status = 'Status is required';
      isValid = false;
    }

    if (this.executionData.bug_raised && !this.executionData.bug_status) {
      this.formExecutionErrors.bug_status = 'Bug Status is required when bug is raised';
      isValid = false;
    }

    return isValid;
  }

  clearFormErrors(): void {
    this.formErrors = {
      title: '',
      description: '',
      expected_result: '',
      test_actions: '',
      bug_status: '',
      assigned_to: '', // Clear assigned_to error
      executed_on: '' // Clear executed_on error
    };
  }

  clearTestDataFormErrors(): void {
    this.formTestDataErrors = {
      data_type: '',
      text_data: '',
      file_data: '',
      image_data: '',
      general: ''
    };
  }

  clearExecutionFormErrors(): void {
    this.formExecutionErrors = {
      status: '',
      bug_status: ''
    };
  }

  // ✅ Test Case CRUD
  openAddTestCasePopup(): void {
    if (!this.selectedRequirementId) return;
    
    this.isEditMode = false;
    this.clearFormErrors();
    this.newTestCase = {
      title: '',
      description: '',
      pre_conditions: '',
      test_actions: '',
      expected_result: '',
      test_data: null,
      is_automated: false,
      requirement: this.selectedRequirementId,
      created_by: this.currentUser?.id,
      assigned_to: null, // Initialize assigned_to
      is_executed: false,
      executed_by: null,
      executed_on: null,
      status: 'Not tested yet',
      actual_result: '',
      comments: '',
      bug_raised: false,
      bug_status: 'Open',
      bug_screenshot: null
    };
    this.showTestCasePopup = true;
  }

  editTestCase(testCase: any): void {
    this.isEditMode = true;
    this.editingTestCaseId = testCase.id;
    
    // Format the executed_on date for the datetime-local input
    let formattedExecutedOn = null;
    if (testCase.executed_on) {
      const executedDate = new Date(testCase.executed_on);
      formattedExecutedOn = executedDate.toISOString().slice(0, 16);
    }
    
    this.newTestCase = { 
      ...testCase,
      executed_on: formattedExecutedOn
    };
    
    if (this.newTestCase.bug_screenshot && typeof this.newTestCase.bug_screenshot === 'string') {
      this.newTestCase.bug_screenshot = null;
    }
    this.clearFormErrors();
    this.showTestCasePopup = true;
  }

  closeTestCasePopup(): void {
    this.showTestCasePopup = false;
    this.isEditMode = false;
    this.editingTestCaseId = null;
    this.clearFormErrors();
  }

  saveTestCase(): void {
    if (!this.validateTestCaseForm()) {
      return;
    }

    // Only set executed_by and status if the test case is executed
    if (this.newTestCase.is_executed) {
      this.newTestCase.executed_by = this.currentUser?.id;
      
      // Convert the datetime-local string to ISO format for backend
      if (this.newTestCase.executed_on) {
        // If executed_on is already in correct format (from edit), use it as is
        if (typeof this.newTestCase.executed_on === 'string' && this.newTestCase.executed_on.includes('T')) {
          // Convert datetime-local format to ISO string
          this.newTestCase.executed_on = new Date(this.newTestCase.executed_on).toISOString();
        }
        // If it's already a Date object or ISO string, leave it as is
      }
      
      // Ensure status is set if executed
      if (!this.newTestCase.status) {
        this.newTestCase.status = 'Not tested yet';
      }
    } else {
      this.newTestCase.executed_by = null;
      this.newTestCase.executed_on = null;
      this.newTestCase.status = 'Not tested yet';
      this.newTestCase.actual_result = '';
      this.newTestCase.test_actions = '';
    }

    if (!this.newTestCase.bug_raised) {
      this.newTestCase.bug_status = null;
      this.newTestCase.bug_screenshot = null;
    }

    this.newTestCase.requirement = this.selectedRequirementId;
    this.newTestCase.created_by = this.currentUser?.id;

    if (this.newTestCase.test_data) {
      this.newTestCase.test_data = Number(this.newTestCase.test_data);
    }

    if (this.newTestCase.assigned_to) {
      this.newTestCase.assigned_to = Number(this.newTestCase.assigned_to);
    }

    if (this.isEditMode && this.editingTestCaseId) {
      this.testCaseService.updateTestCase(this.editingTestCaseId, this.newTestCase).subscribe({
        next: () => {
          this.loadTestCases();
          this.closeTestCasePopup();
          this.showSuccess('Test case updated successfully!');
        },
        error: (error: any) => {
          console.error('Error updating test case:', error);
          this.formErrors.general = 'Error updating test case: ' + (error.error?.message || error.message);
        }
      });
    } else {
      this.testCaseService.addTestCase(this.newTestCase).subscribe({
        next: () => {
          this.loadTestCases();
          this.closeTestCasePopup();
          this.showSuccess('Test case added successfully!');
        },
        error: (error: any) => {
          console.error('Error adding test case:', error);
          this.formErrors.general = 'Error adding test case: ' + (error.error?.message || error.message);
        }
      });
    }
  }

  // ✅ Test Data CRUD
  openAddTestDataPopup(): void {
    this.isEditTestDataMode = false;
    this.clearTestDataFormErrors();
    this.newTestData = {
      data_type: 'text',
      text_data: '',
      file_data: null,
      image_data: null,
      file_data_name: '',
      image_data_name: ''
    };
    this.showTestDataPopup = true;
  }

  closeTestDataPopup(): void {
    this.showTestDataPopup = false;
    this.isEditTestDataMode = false;
    this.editingTestDataId = null;
    this.clearTestDataFormErrors();
  }

  onDataTypeChange(): void {
    this.newTestData.file_data = null;
    this.newTestData.image_data = null;
    this.newTestData.file_data_name = '';
    this.newTestData.image_data_name = '';
  }

  onFileSelected(event: any, type: string): void {
    const file = event.target.files[0];
    if (file) {
      if (type === 'file') {
        this.newTestData.file_data = file;
        this.newTestData.file_data_name = file.name;
      } else if (type === 'image') {
        this.newTestData.image_data = file;
        this.newTestData.image_data_name = file.name;
      } else if (type === 'bug_screenshot') {
        this.newTestCase.bug_screenshot = file;
      }
    }
  }

  saveTestData(): void {
    if (!this.validateTestDataForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('data_type', this.newTestData.data_type);
    
    if (this.selectedProjectId) {
      formData.append('project', this.selectedProjectId.toString());
    }
    
    if (this.newTestData.text_data) formData.append('text_data', this.newTestData.text_data);
    if (this.newTestData.file_data) formData.append('file_data', this.newTestData.file_data);
    if (this.newTestData.image_data) formData.append('image_data', this.newTestData.image_data);

    if (this.isEditTestDataMode && this.editingTestDataId) {
      this.testDataService.updateTestData(this.editingTestDataId, formData).subscribe({
        next: () => {
          this.loadTestData();
          this.closeTestDataPopup();
          this.showSuccess('Test data updated successfully!');
        },
        error: (error: any) => {
          console.error('Error updating test data:', error);
          this.formTestDataErrors.general = 'Error updating test data: ' + (error.error?.message || error.message);
        }
      });
    } else {
      this.testDataService.createTestData(formData).subscribe({
        next: () => {
          this.loadTestData();
          this.closeTestDataPopup();
          this.showSuccess('Test data added successfully!');
        },
        error: (error: any) => {
          console.error('Error adding test data:', error);
          this.formTestDataErrors.general = 'Error adding test data: ' + (error.error?.message || error.message);
        }
      });
    }
  }

  // ✅ Execution
  executeTestCase(testCase: any): void {
    this.executingTestCase = testCase;
    this.executionData = {
      status: 'Pass',
      actual_result: '',
      comments: '',
      bug_raised: false,
      bug_status: 'Open'
    };
    this.clearExecutionFormErrors();
    this.showExecutePopup = true;
  }

  closeExecutePopup(): void {
    this.showExecutePopup = false;
    this.executingTestCase = null;
    this.clearExecutionFormErrors();
  }

  saveExecution(): void {
    if (!this.validateExecutionForm()) {
      return;
    }

    const updatedTestCase = {
      ...this.executingTestCase,
      is_executed: true,
      executed_on: new Date().toISOString(), // For execute popup, use current datetime
      executed_by: this.currentUser?.id,
      status: this.executionData.status,
      actual_result: this.executionData.actual_result,
      comments: this.executionData.comments,
      bug_raised: this.executionData.bug_raised,
      bug_status: this.executionData.bug_raised ? this.executionData.bug_status : null
    };

    this.testCaseService.updateTestCase(this.executingTestCase.id, updatedTestCase).subscribe({
      next: () => {
        this.loadTestCases();
        this.closeExecutePopup();
        this.showSuccess('Test execution saved successfully!');
      },
      error: (error: any) => {
        console.error('Error saving test execution:', error);
        this.formExecutionErrors.general = 'Error saving execution: ' + (error.error?.message || error.message);
      }
    });
  }
}