import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestCaseService } from '../services/test-case.service';
import { RequirementService } from '../services/requirement.service';
import { ProjectService } from '../services/project.service';
import { ClientsService } from '../clients.service';
import { TestDataService } from '../services/test-data.service';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

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
  projectDevelopers: any[] = [];

  // New properties for import functionality
  showImportPopup: boolean = false;
  showImportConfirmation: boolean = false;
  importFile: File | null = null;
  isDragOver: boolean = false;
  importResults: any = null;
  isImporting: boolean = false;
  showErrorMessage: boolean = false;
  errorMessage: string = '';

  // ✅ Pagination properties
  currentPage: number = 1;
  pageSize: number = 5; // Only 5 records per page as requested
  visiblePagesCount: number = 3;

  // New properties for clipboard functionality and test case details
  isClipboardActive: boolean = false;
  clipboardImage: string | null = null;
  clipboardFile: File | null = null;
  showTestCaseDetailsPopup: boolean = false;
  selectedTestCase: any = null;
  testCaseTestData: any[] = [];
  showScreenshotViewer: boolean = false;
  viewingScreenshot: string = '';

  // Form validation
  formErrors: any = {
    test_case_id: '',
    title: '',
    page_name: '',
    description: '',
    expected_result: '',
    test_actions: '',
    bug_status: '',
    assigned_to: '',
    executed_on: '',
    general: ''
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
    bug_status: '',
    general: ''
  };

  // Success message
  showSuccessMessage: boolean = false;
  successMessage: string = '';

  newTestCase: any = {
    test_case_id: '',
    page_name: '', // ✅ Ensure page_name is included
    title: '',
    description: '',
    pre_conditions: '',
    test_actions: '',
    expected_result: '',
    test_data: null,
    is_automated: false,
    requirement: null,
    project: null, // Will be set automatically from selected project
    created_by: null,
    assigned_to: null,
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
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadClients();
    this.loadUsers();
  }

  // ✅ Pagination methods
  paginatedTestCases(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.testCases.slice(startIndex, endIndex);
  }

  totalPages(): number {
    return Math.ceil(this.testCases.length / this.pageSize);
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
    return Math.min(end, this.testCases.length);
  }

  // ✅ Loaders
  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      console.warn('No current user found in session storage');
    } else {
      console.log('Current user loaded:', this.currentUser);
    }
  }

  loadUsers(): void {
    this.http.get<any[]>(`${environment.apiBaseUrl}/users/`).subscribe({
      next: (data: any[]) => {
        this.users = data;
        console.log('Users loaded:', this.users);
      },
      error: (error: any) => {
        console.error('Error fetching users:', error);
        this.users = [];
      }
    });
  }

  loadClients(): void {
    this.clientsService.getClients().subscribe({
      next: (data: any[]) => {
        this.clients = data;
      },
      error: (error: any) => {
        console.error('Error fetching clients:', error);
        this.displayError('Error loading clients: ' + (error.error?.message || error.message));
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
    this.projectDevelopers = [];
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
      error: (error: any) => {
        console.error('Error fetching projects by client:', error);
        this.displayError('Error loading projects: ' + (error.error?.message || error.message));
      }
    });
  }

  onProjectChange(): void {
    this.selectedRequirementId = null;
    this.requirement = null;
    this.testCases = [];
    this.filteredRequirements = [];
    this.projectDevelopers = [];
    this.currentPage = 1; // ✅ Reset to first page
    
    if (this.selectedProjectId) {
      this.loadRequirementsByProject(this.selectedProjectId);
      this.loadTestData();
      this.loadProjectDevelopers();
      
      const selectedProject = this.filteredProjects.find(project => project.id === this.selectedProjectId);
      this.selectedProjectName = selectedProject ? selectedProject.project_name : '';
    } else {
      this.selectedProjectName = '';
      this.testDataList = [];
    }
  }

  loadProjectDevelopers(): void {
    if (!this.selectedProjectId) return;
    
    this.projectService.getProjectDevelopers(this.selectedProjectId).subscribe({
      next: (data: any[]) => {
        this.projectDevelopers = data;
      },
      error: (error: any) => {
        console.error('Error fetching project developers:', error);
        this.displayError('Error loading project developers: ' + (error.error?.message || error.message));
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
        this.displayError('Error loading requirements: ' + (error.error?.message || error.message));
      }
    });
  }

  onRequirementChange(): void {
    this.currentPage = 1; // ✅ Reset to first page
    
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
        this.displayError('Error loading requirement: ' + (error.error?.message || error.message));
      }
    });
  }

  loadTestCases(): void {
    if (!this.selectedRequirementId) return;
    
    this.testCaseService.getTestCasesByRequirement(this.selectedRequirementId).subscribe({
      next: (data: any[]) => {
        // Process screenshot URLs and ensure all data is properly loaded
        this.testCases = data.map(testCase => ({
          ...testCase,
          bug_screenshot: testCase.bug_screenshot 
            ? this.testCaseService.getBugScreenshotUrl(testCase.bug_screenshot)
            : null,
          // Ensure created_by and executed_by are properly handled
          created_by: testCase.created_by || null,
          executed_by: testCase.executed_by || null,
          test_data: testCase.test_data || null,
          // Ensure page_name is properly handled
          page_name: testCase.page_name || ''
        }));
        
        this.currentPage = 1; // ✅ Reset to first page when data loads
        console.log('Processed test cases with all data:', this.testCases);
      },
      error: (error: any) => {
        console.error('Error fetching test cases:', error);
        this.displayError('Error loading test cases: ' + (error.error?.message || error.message));
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

  // Load test data for a specific test case
  loadTestCaseTestData(testCaseId: number): void {
    this.testDataService.getTestDataByTestCase(testCaseId).subscribe({
      next: (data: any[]) => {
        this.testCaseTestData = data;
      },
      error: (error: any) => {
        console.error('Error fetching test case test data:', error);
        this.testCaseTestData = [];
      }
    });
  }

  getUsername(userId: number): string {
    if (!userId) return '-';
    
    if (this.currentUser && userId === this.currentUser.id) {
      return this.currentUser.displayName || this.currentUser.username || this.currentUser.email || 'Current User';
    }
    
    const user = this.users.find(u => u.id === userId);
    if (user) {
      return user.email || user.username || 'Unknown';
    }
    
    const developer = this.projectDevelopers.find(dev => dev.id === userId);
    if (developer) {
      return developer.email || developer.name || 'Unknown';
    }
    
    return 'Unknown';
  }

  getUserDisplay(userId: number): string {
    if (!userId) return '-';
    
    console.log('Looking up user with ID:', userId);
    
    if (this.currentUser && userId === this.currentUser.id) {
      const displayName = this.currentUser.displayName || this.currentUser.username || this.currentUser.email;
      console.log('Found as current user:', displayName);
      return displayName || 'Current User';
    }
    
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const displayName = user.email || user.username;
      console.log('Found in users array:', displayName);
      return displayName || 'Unknown';
    }
    
    const developer = this.projectDevelopers.find(dev => dev.id === userId);
    if (developer) {
      const displayName = developer.email || developer.name;
      console.log('Found in project developers:', displayName);
      return displayName || 'Unknown';
    }
    
    console.log('User not found in any list');
    return 'Unknown';
  }

  getDeveloperDisplay(developerId: number): string {
    if (!developerId) return '-';
    const developer = this.projectDevelopers.find(dev => dev.id === developerId);
    return developer ? (developer.name || developer.email || 'Unknown') : 'Unknown';
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

  // ✅ Clipboard Functionality
  activateClipboard(): void {
    this.isClipboardActive = true;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isClipboardActive && event.ctrlKey && event.key === 'v') {
      return;
    }
  }

  onPasteScreenshot(event: ClipboardEvent): void {
    event.preventDefault();
    
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          this.handlePastedImage(file);
          break;
        }
      }
    }
  }

  handlePastedImage(file: File): void {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.displayError('Invalid image type. Please paste PNG, JPEG, JPG, or GIF images only.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.displayError('Image too large. Maximum size is 5MB.');
      return;
    }

    this.clipboardFile = file;
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.clipboardImage = e.target.result;
    };
    reader.readAsDataURL(file);
    
    this.showSuccess('Screenshot pasted successfully! It will be saved when you submit the form.');
  }

  removePastedScreenshot(event: Event): void {
    event.stopPropagation();
    this.clipboardImage = null;
    this.clipboardFile = null;
  }

  removeCurrentScreenshot(): void {
    this.newTestCase.bug_screenshot = null;
  }

  // ✅ Screenshot Viewer
  viewScreenshot(screenshotUrl: string): void {
    this.viewingScreenshot = screenshotUrl;
    this.showScreenshotViewer = true;
  }

  closeScreenshotViewer(): void {
    this.showScreenshotViewer = false;
    this.viewingScreenshot = '';
  }

  // ✅ Test Case Details
  viewTestCaseDetails(testCase: any): void {
    this.selectedTestCase = testCase;
    this.loadTestCaseTestData(testCase.id);
    this.showTestCaseDetailsPopup = true;
  }

  closeTestCaseDetailsPopup(): void {
    this.showTestCaseDetailsPopup = false;
    this.selectedTestCase = null;
    this.testCaseTestData = [];
  }

  // ✅ Success/Error Messages
  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    
    setTimeout(() => {
      this.hideSuccessMessage();
    }, 3000);
  }

  displayError(message: string): void {
    this.errorMessage = message;
    this.showErrorMessage = true;
    console.error('Error:', message);
    
    setTimeout(() => {
      this.hideErrorMessage();
    }, 5000);
  }

  hideSuccessMessage(): void {
    this.showSuccessMessage = false;
    this.successMessage = '';
  }

  hideErrorMessage(): void {
    this.showErrorMessage = false;
    this.errorMessage = '';
  }

  // ✅ Form Validation
  validateTestCaseForm(): boolean {
    let isValid = true;
    this.clearFormErrors();

    if (!this.newTestCase.test_case_id) {
      this.formErrors.test_case_id = 'Test Case ID is required';
      isValid = false;
    }

    if (!this.newTestCase.title) {
      this.formErrors.title = 'Title is required';
      isValid = false;
    }

    if (!this.newTestCase.page_name) {
      this.formErrors.page_name = 'Page Name is required';
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
      test_case_id: '',
      title: '',
      page_name: '',
      description: '',
      expected_result: '',
      test_actions: '',
      bug_status: '',
      assigned_to: '',
      executed_on: '',
      general: ''
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
      bug_status: '',
      general: ''
    };
  }

  // ✅ Test Case CRUD - UPDATED saveTestCase method
  openAddTestCasePopup(): void {
    if (!this.selectedRequirementId || !this.selectedProjectId) return;
    
    this.isEditMode = false;
    this.clearFormErrors();
    this.clipboardImage = null;
    this.clipboardFile = null;
    this.isClipboardActive = false;
    
    this.newTestCase = {
      test_case_id: '',
      page_name: '', // ✅ Initialize page_name
      title: '',
      description: '',
      pre_conditions: '',
      test_actions: '',
      expected_result: '',
      test_data: null,
      is_automated: false,
      requirement: this.selectedRequirementId,
      project: this.selectedProjectId, // Set project automatically
      created_by: this.currentUser?.id,
      assigned_to: null,
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
    this.clipboardImage = null;
    this.clipboardFile = null;
    this.isClipboardActive = false;
    
    let formattedExecutedOn = null;
    if (testCase.executed_on) {
      const executedDate = new Date(testCase.executed_on);
      formattedExecutedOn = executedDate.toISOString().slice(0, 16);
    }
    
    this.newTestCase = { 
      ...testCase,
      executed_on: formattedExecutedOn,
      // ✅ Ensure page_name is properly set when editing
      page_name: testCase.page_name || ''
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
    this.clipboardImage = null;
    this.clipboardFile = null;
    this.isClipboardActive = false;
    this.clearFormErrors();
  }

  saveTestCase(): void {
    if (!this.validateTestCaseForm()) {
      return;
    }

    if (this.clipboardFile && this.newTestCase.bug_raised) {
      this.newTestCase.bug_screenshot = this.clipboardFile;
    }

    if (this.newTestCase.is_executed) {
      this.newTestCase.executed_by = this.currentUser?.id;
      
      if (this.newTestCase.executed_on) {
        if (typeof this.newTestCase.executed_on === 'string' && this.newTestCase.executed_on.includes('T')) {
          this.newTestCase.executed_on = new Date(this.newTestCase.executed_on).toISOString();
        }
      }
      
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
    this.newTestCase.project = this.selectedProjectId; // Ensure project is set
    this.newTestCase.created_by = this.currentUser?.id;

    // ✅ CRITICAL FIX: Ensure page_name is included and properly formatted in the payload
    if (!this.newTestCase.page_name) {
      this.newTestCase.page_name = ''; // Set default if empty
    }

    if (this.newTestCase.test_data) {
      this.newTestCase.test_data = Number(this.newTestCase.test_data);
    }

    if (this.newTestCase.assigned_to) {
      this.newTestCase.assigned_to = Number(this.newTestCase.assigned_to);
    }

    console.log('Saving test case with data:', this.newTestCase);
    console.log('Page name being sent:', this.newTestCase.page_name); // Debug log

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

  // ✅ Separate file selection methods to avoid conflicts
  onTestCaseFileSelected(event: any, type: string): void {
    const file = event.target.files[0];
    if (file) {
      if (type === 'bug_screenshot') {
        this.newTestCase.bug_screenshot = file;
        this.clipboardImage = null;
        this.clipboardFile = null;
      }
    }
  }

  onTestDataFileSelected(event: any, type: string): void {
    const file = event.target.files[0];
    if (file) {
      if (type === 'file') {
        this.newTestData.file_data = file;
        this.newTestData.file_data_name = file.name;
      } else if (type === 'image') {
        this.newTestData.image_data = file;
        this.newTestData.image_data_name = file.name;
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
    
    if (this.isEditMode && this.editingTestCaseId) {
      formData.append('test_case', this.editingTestCaseId.toString());
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
      executed_on: new Date().toISOString(),
      executed_by: this.currentUser?.id,
      status: this.executionData.status,
      actual_result: this.executionData.actual_result,
      comments: this.executionData.comments,
      bug_raised: this.executionData.bug_raised,
      bug_status: this.executionData.bug_raised ? this.executionData.bug_status : null,
      // ✅ Ensure page_name is preserved during execution
      page_name: this.executingTestCase.page_name || ''
    };

    console.log('Saving execution with user:', this.currentUser);
    console.log('Execution data:', updatedTestCase);

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

  // ✅ Template Download and Import Functionality
  downloadTemplate(): void {
  if (!this.selectedRequirementId) {
    this.displayError('Please select a requirement first');
    return;
  }

  // Pass project ID to get relevant developers in the template
  // Convert null to undefined to fix the TypeScript error
  const projectId = this.selectedProjectId || undefined;
  
  this.testCaseService.downloadTemplate(projectId).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test_case_template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.showSuccess('Template downloaded successfully! Check the Developers sheet for available developers.');
    },
    error: (error: any) => {
      console.error('Error downloading template:', error);
      this.displayError('Error downloading template: ' + (error.error?.message || error.message));
    }
  });
}

  openImportPopup(): void {
    if (!this.selectedRequirementId) {
      this.displayError('Please select a requirement first');
      return;
    }
    this.showImportPopup = true;
    this.importFile = null;
    this.importResults = null;
    this.isDragOver = false;
  }

  closeImportPopup(): void {
    this.showImportPopup = false;
    this.importFile = null;
    this.importResults = null;
    this.isDragOver = false;
  }

  onImportFileSelected(event: any): void {
    const file = event.target.files[0];
    this.handleFileSelection(file);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  handleFileSelection(file: File): void {
    if (!file) return;

    // Validate file type
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      this.displayError('Only Excel files (.xlsx, .xls) are allowed');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.displayError('File size too large. Maximum 10MB allowed.');
      return;
    }

    this.importFile = file;
    this.importResults = null;
  }

  removeImportFile(event: Event): void {
    event.stopPropagation();
    this.importFile = null;
    this.importResults = null;
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  confirmImport(): void {
    if (!this.importFile || !this.selectedRequirementId) {
      this.displayError('Please select a file to import');
      return;
    }

    this.isImporting = true;
    
    this.testCaseService.bulkImportTestCases(this.selectedRequirementId, this.importFile).subscribe({
      next: (results: any) => {
        this.importResults = results;
        this.isImporting = false;
        
        if (results.error_count === 0) {
          // No errors, proceed directly
          this.proceedWithImport();
        } else {
          // Show errors and ask for confirmation
          this.showImportConfirmation = true;
        }
      },
      error: (error: any) => {
        this.isImporting = false;
        console.error('Error during import validation:', error);
        
        if (error.status === 207) {
          // Multi-status response with errors
          this.importResults = error.error;
          this.showImportConfirmation = true;
        } else {
          this.displayError('Error validating import file: ' + (error.error?.message || error.message));
        }
      }
    });
  }

  closeImportConfirmation(): void {
    this.showImportConfirmation = false;
  }

  proceedWithImport(): void {
    if (this.importResults && this.importResults.success_count > 0) {
      this.showSuccess(`Successfully imported ${this.importResults.success_count} test cases!`);
      this.loadTestCases(); // Refresh the test cases list
      this.loadTestData(); // Refresh test data list as new test data might be created
    }
    
    this.closeImportConfirmation();
    this.closeImportPopup();
  }
}