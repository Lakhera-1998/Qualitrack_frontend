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
    // Removed: this.loadTestData(); - Now loaded only when project is selected
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
        alert('Error loading clients: ' + (error.error?.message || error.message));
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
    this.testDataList = []; // Clear test data when client changes
    
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
        alert('Error loading projects: ' + (error.error?.message || error.message));
      }
    });
  }

  onProjectChange(): void {
    this.selectedRequirementId = null;
    this.requirement = null;
    this.testCases = [];
    this.filteredRequirements = [];
    
    if (this.selectedProjectId) {
      this.loadRequirementsByProject(this.selectedProjectId);
      this.loadTestData(); // Load test data only when project is selected
      
      const selectedProject = this.filteredProjects.find(project => project.id === this.selectedProjectId);
      this.selectedProjectName = selectedProject ? selectedProject.project_name : '';
    } else {
      this.selectedProjectName = '';
      this.testDataList = []; // Clear test data when no project is selected
    }
  }

  loadRequirementsByProject(projectId: number): void {
    this.requirementService.getRequirementsByProject(projectId).subscribe({
      next: (data: any[]) => {
        this.filteredRequirements = data;
      },
      error: (error: any) => {
        console.error('Error fetching requirements by project:', error);
        alert('Error loading requirements: ' + (error.error?.message || error.message));
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
  
  // ✅ Updated to pass both projectId and requirementId
  this.requirementService.getRequirement(this.selectedProjectId, this.selectedRequirementId).subscribe({
    next: (data: any) => {
      this.requirement = data;
    },
    error: (error: any) => {
      console.error('Error fetching requirement:', error);
      alert('Error loading requirement: ' + (error.error?.message || error.message));
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
        alert('Error loading test cases: ' + (error.error?.message || error.message));
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
        // Don't show alert for 403 errors as they're expected when no proper context
        if (error.status !== 403) {
          alert('Error loading test data: ' + (error.error?.message || error.message));
        } else {
          // Set empty array for 403 errors (no access to project test data)
          this.testDataList = [];
        }
      }
    });
  }

  loadUsers(): void {
    // This should come from a UserService in real project
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

  // ✅ Test Case CRUD
  openAddTestCasePopup(): void {
    if (!this.selectedRequirementId) return;
    
    this.isEditMode = false;
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
    this.newTestCase = { ...testCase };
    // Ensure bug_screenshot is properly handled (it might be a string URL from backend)
    if (this.newTestCase.bug_screenshot && typeof this.newTestCase.bug_screenshot === 'string') {
      this.newTestCase.bug_screenshot = null; // Reset file reference, keep URL for display
    }
    this.showTestCasePopup = true;
  }

  closeTestCasePopup(): void {
    this.showTestCasePopup = false;
    this.isEditMode = false;
    this.editingTestCaseId = null;
  }

  saveTestCase(): void {
    if (!this.newTestCase.title || !this.newTestCase.description || 
        !this.newTestCase.expected_result) {
      alert('Please fill all required fields');
      return;
    }

    // If executed, require test_actions and set executed_by/executed_on
    if (this.newTestCase.is_executed) {
      if (!this.newTestCase.test_actions) {
        alert('Test Actions is required when test case is executed');
        return;
      }
      this.newTestCase.executed_by = this.currentUser?.id;
      this.newTestCase.executed_on = new Date().toISOString();
    } else {
      this.newTestCase.executed_by = null;
      this.newTestCase.executed_on = null;
      this.newTestCase.status = 'Not tested yet';
      this.newTestCase.actual_result = '';
    }

    // If bug is raised, require bug_status
    if (this.newTestCase.bug_raised && !this.newTestCase.bug_status) {
      alert('Bug Status is required when bug is raised');
      return;
    } else if (!this.newTestCase.bug_raised) {
      this.newTestCase.bug_status = null;
      // Remove bug screenshot if bug is not raised
      this.newTestCase.bug_screenshot = null;
    }

    this.newTestCase.requirement = this.selectedRequirementId;
    this.newTestCase.created_by = this.currentUser?.id;

    // Convert test_data to number if it's a string
    if (this.newTestCase.test_data) {
      this.newTestCase.test_data = Number(this.newTestCase.test_data);
    }

    if (this.isEditMode && this.editingTestCaseId) {
      this.testCaseService.updateTestCase(this.editingTestCaseId, this.newTestCase).subscribe({
        next: () => {
          this.loadTestCases();
          this.closeTestCasePopup();
          alert('Test case updated successfully!');
        },
        error: (error: any) => {
          console.error('Error updating test case:', error);
          alert('Error updating test case: ' + (error.error?.message || error.message));
        }
      });
    } else {
      this.testCaseService.addTestCase(this.newTestCase).subscribe({
        next: () => {
          this.loadTestCases();
          this.closeTestCasePopup();
          alert('Test case added successfully!');
        },
        error: (error: any) => {
          console.error('Error adding test case:', error);
          alert('Error adding test case: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  // ✅ Test Data CRUD
  openAddTestDataPopup(): void {
    this.isEditTestDataMode = false;
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
    if (!this.newTestData.data_type) {
      alert('Please select a data type');
      return;
    }

    const formData = new FormData();
    formData.append('data_type', this.newTestData.data_type);
    
    // Add project context to the test data if available
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
          alert('Test data updated successfully!');
        },
        error: (error: any) => {
          console.error('Error updating test data:', error);
          alert('Error updating test data: ' + (error.error?.message || error.message));
        }
      });
    } else {
      this.testDataService.createTestData(formData).subscribe({
        next: () => {
          this.loadTestData();
          this.closeTestDataPopup();
          alert('Test data added successfully!');
        },
        error: (error: any) => {
          console.error('Error adding test data:', error);
          alert('Error adding test data: ' + (error.error?.message || error.message));
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
    this.showExecutePopup = true;
  }

  closeExecutePopup(): void {
    this.showExecutePopup = false;
    this.executingTestCase = null;
  }

  saveExecution(): void {
    if (!this.executionData.status) {
      alert('Please select a status');
      return;
    }

    const updatedTestCase = {
      ...this.executingTestCase,
      is_executed: true,
      executed_on: new Date().toISOString(),
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
        alert('Test execution saved successfully!');
      },
      error: (error: any) => {
        console.error('Error saving test execution:', error);
        alert('Error saving execution: ' + (error.error?.message || error.message));
      }
    });
  }
}