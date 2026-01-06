import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestCaseService } from '../services/test-case.service';
import { RequirementService } from '../services/requirement.service';
import { ProjectService } from '../services/project.service';
import { ClientsService } from '../clients.service';
import { TestDataService } from '../services/test-data.service';
import { AuthService } from '../auth.service';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selectedCategory: string = '';
  requirement: any = null;
  testCases: any[] = [];
  filteredTestCases: any[] = [];
  testDataList: any[] = [];
  users: any[] = [];
  currentUser: any = null;
  projectDevelopers: any[] = [];

  // ✅ NEW: Flag to track if we're showing all project test cases
  showAllProjectTestCases: boolean = false;

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
  pageSize: number = 10;
  visiblePagesCount: number = 3;

  // Multiple screenshots properties
  isClipboardActive: boolean = false;
  uploadedScreenshots: any[] = [];
  existingScreenshots: any[] = [];
  screenshotsToDelete: number[] = [];

  // Screenshots viewer properties
  showScreenshotsViewer: boolean = false;
  viewingScreenshots: string[] = [];
  currentScreenshotIndex: number = 0;

  // Form validation
  formErrors: any = {
    test_case_id: '',
    title: '',
    page_name: '',
    category: '',
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
    page_name: '',
    category: 'Functional',
    title: '',
    description: '',
    pre_conditions: '',
    test_actions: '',
    expected_result: '',
    test_data: null,
    is_automated: false,
    requirement: null,
    project: null,
    created_by: null,
    assigned_to: null,
    is_executed: false,
    executed_by: null,
    executed_on: null,
    status: 'Not tested yet',
    actual_result: '',
    comments: '',
    bug_raised: false,
    bug_status: 'Open'
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
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadClients();
    this.loadUsers();
    
    // ✅ Load filters from query parameters if available
    this.loadFiltersFromQueryParams();
  }

  // ✅ UPDATED: Load filters from query parameters
  loadFiltersFromQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['clientId']) {
        this.selectedClientId = Number(params['clientId']);
        this.loadProjectsByClient(this.selectedClientId);
        
        const selectedClient = this.clients.find(client => client.id === this.selectedClientId);
        this.selectedClientName = selectedClient ? selectedClient.client_name : '';
      }
      
      if (params['projectId']) {
        this.selectedProjectId = Number(params['projectId']);
        this.loadRequirementsByProject(this.selectedProjectId);
        this.loadTestData();
        this.loadProjectDevelopers();
        
        const selectedProject = this.filteredProjects.find(project => project.id === this.selectedProjectId);
        this.selectedProjectName = selectedProject ? selectedProject.project_name : '';
        
        // ✅ NEW: Load all test cases for project if no requirement is selected
        if (!params['requirementId']) {
          this.loadAllTestCasesForProject();
        }
      }
      
      if (params['requirementId']) {
        this.selectedRequirementId = Number(params['requirementId']);
        this.loadRequirementDetails();
        this.loadTestCasesByRequirement();
      }

      // ✅ ADDED: Load category from query params
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      
      if (params['page']) {
        this.currentPage = Number(params['page']);
      }
    });
  }

  // ✅ NEW METHOD: Category change handler
  onCategoryChange(): void {
    this.currentPage = 1;
    this.filterTestCasesByCategory();
    
    // Update URL with filters
    this.updateUrlWithFilters();
  }

  // ✅ NEW METHOD: Filter test cases by category
  filterTestCasesByCategory(): void {
    if (!this.selectedCategory) {
      this.filteredTestCases = [...this.testCases];
    } else {
      this.filteredTestCases = this.testCases.filter(testCase => 
        testCase.category === this.selectedCategory
      );
    }
  }

  // ✅ UPDATED: Navigate to test case details page with filter preservation
  navigateToTestCaseDetails(testCase: any): void {
    if (testCase && testCase.id) {
      const queryParams: any = {};
      
      if (this.selectedClientId) {
        queryParams.clientId = this.selectedClientId;
      }
      if (this.selectedProjectId) {
        queryParams.projectId = this.selectedProjectId;
      }
      if (this.selectedRequirementId) {
        queryParams.requirementId = this.selectedRequirementId;
      }
      if (this.selectedCategory) {
        queryParams.category = this.selectedCategory;
      }
      if (this.currentPage > 1) {
        queryParams.page = this.currentPage;
      }
      
      this.router.navigate(['/test-case-details', testCase.id], {
        queryParams: queryParams
      });
    }
  }

  // ✅ UPDATED: Pagination methods to use filteredTestCases
  paginatedTestCases(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTestCases.slice(startIndex, endIndex);
  }

  totalPages(): number {
    return Math.ceil(this.filteredTestCases.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
      this.updateUrlWithFilters();
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
    return Math.min(end, this.filteredTestCases.length);
  }

  // ✅ UPDATED: Update URL with current filters including category
  updateUrlWithFilters(): void {
    const queryParams: any = {};
    
    if (this.selectedClientId) {
      queryParams.clientId = this.selectedClientId;
    }
    if (this.selectedProjectId) {
      queryParams.projectId = this.selectedProjectId;
    }
    if (this.selectedRequirementId) {
      queryParams.requirementId = this.selectedRequirementId;
    }
    if (this.selectedCategory) {
      queryParams.category = this.selectedCategory;
    }
    if (this.currentPage > 1) {
      queryParams.page = this.currentPage;
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
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
    this.userService.getUsers().subscribe({
      next: (data: any[]) => {
        this.users = data;
        console.log('Users loaded via UserService:', this.users);
      },
      error: (error: any) => {
        console.error('Error fetching users via UserService:', error);
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

  // ✅ UPDATED: Client change handler
  onClientChange(): void {
    this.selectedProjectId = null;
    this.selectedProjectName = '';
    this.selectedRequirementId = null;
    this.selectedCategory = '';
    this.requirement = null;
    this.testCases = [];
    this.filteredTestCases = [];
    this.filteredProjects = [];
    this.filteredRequirements = [];
    this.testDataList = [];
    this.projectDevelopers = [];
    this.currentPage = 1;
    this.showAllProjectTestCases = false;
    
    if (this.selectedClientId) {
      this.loadProjectsByClient(this.selectedClientId);
      
      const selectedClient = this.clients.find(client => client.id === this.selectedClientId);
      this.selectedClientName = selectedClient ? selectedClient.client_name : '';
    } else {
      this.selectedClientName = '';
    }
    
    this.updateUrlWithFilters();
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

  // ✅ UPDATED: Project change handler
  onProjectChange(): void {
    this.selectedRequirementId = null;
    this.selectedCategory = '';
    this.requirement = null;
    this.testCases = [];
    this.filteredTestCases = [];
    this.filteredRequirements = [];
    this.projectDevelopers = [];
    this.currentPage = 1;
    this.showAllProjectTestCases = false;
    
    if (this.selectedProjectId) {
      this.loadRequirementsByProject(this.selectedProjectId);
      this.loadTestData();
      this.loadProjectDevelopers();
      
      // ✅ NEW: Load all test cases for the selected project
      this.loadAllTestCasesForProject();
      
      const selectedProject = this.filteredProjects.find(project => project.id === this.selectedProjectId);
      this.selectedProjectName = selectedProject ? selectedProject.project_name : '';
    } else {
      this.selectedProjectName = '';
      this.testDataList = [];
    }
    
    this.updateUrlWithFilters();
  }

  // ✅ UPDATED: Load project developers for the template
  loadProjectDevelopers(): void {
    if (!this.selectedProjectId) return;
    
    this.projectService.getProjectDevelopers(this.selectedProjectId).subscribe({
      next: (data: any[]) => {
        this.projectDevelopers = data;
        console.log('Project developers loaded:', this.projectDevelopers);
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

  // ✅ UPDATED: Requirement change handler
  onRequirementChange(): void {
    this.selectedCategory = '';
    this.currentPage = 1;
    this.showAllProjectTestCases = false;
    
    if (this.selectedRequirementId) {
      this.loadRequirementDetails();
      this.loadTestCasesByRequirement();
    } else {
      this.requirement = null;
      if (this.selectedProjectId) {
        this.loadAllTestCasesForProject();
      } else {
        this.testCases = [];
        this.filteredTestCases = [];
      }
    }
    
    this.updateUrlWithFilters();
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

  // ✅ NEW METHOD: Load all test cases for the selected project
  loadAllTestCasesForProject(): void {
    if (!this.selectedProjectId) return;
    
    this.testCaseService.getTestCasesByProject(this.selectedProjectId).subscribe({
      next: (data: any[]) => {
        this.processTestCases(data);
        this.showAllProjectTestCases = true;
        this.filterTestCasesByCategory();
      },
      error: (error: any) => {
        console.error('Error fetching project test cases:', error);
        if (error.status === 401 || error.status === 403) {
          this.displayError('Authentication failed. Please log in again.');
        } else {
          this.displayError('Error loading test cases: ' + (error.error?.message || error.message));
        }
      }
    });
  }

  // ✅ UPDATED: Load test cases by specific requirement
  loadTestCasesByRequirement(): void {
    if (!this.selectedRequirementId) return;
    
    this.testCaseService.getTestCasesByRequirement(this.selectedRequirementId).subscribe({
      next: (data: any[]) => {
        this.processTestCases(data);
        this.showAllProjectTestCases = false;
        this.filterTestCasesByCategory();
      },
      error: (error: any) => {
        console.error('Error fetching test cases:', error);
        this.displayError('Error loading test cases: ' + (error.error?.message || error.message));
      }
    });
  }

  // ✅ NEW METHOD: Process test cases data (common for both project and requirement)
  processTestCases(data: any[]): void {
    this.testCases = data.map(testCase => ({
      ...testCase,
      bug_screenshots: this.processBugScreenshots(testCase.bug_screenshots),
      created_by: testCase.created_by || null,
      executed_by: testCase.executed_by || null,
      test_data: testCase.test_data || null,
      page_name: testCase.page_name || '',
      category: testCase.category || 'Functional'
    }));
    
    console.log('Processed test cases:', this.testCases);
  }

  // ✅ NEW METHOD: Process bug screenshots with proper URLs
  processBugScreenshots(screenshots: any[]): any[] {
    if (!screenshots || screenshots.length === 0) return [];
    
    return screenshots.map((screenshot: any) => ({
      ...screenshot,
      screenshot_url: this.testCaseService.getBugScreenshotUrl(screenshot.screenshot)
    }));
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

  // ✅ **FIXED METHOD: Load existing screenshots for a test case**
  loadExistingScreenshots(testCaseId: number): void {
    this.testCaseService.getBugScreenshots(testCaseId).subscribe({
      next: (data: any[]) => {
        // Process the screenshots to include proper URLs
        this.existingScreenshots = data.map(screenshot => ({
          ...screenshot,
          screenshot_url: this.testCaseService.getBugScreenshotUrl(screenshot.screenshot),
          caption: screenshot.caption || `Screenshot ${screenshot.id}`
        }));
        console.log('Loaded existing screenshots:', this.existingScreenshots);
      },
      error: (error: any) => {
        console.error('Error fetching existing screenshots:', error);
        this.existingScreenshots = [];
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
    
    if (this.currentUser && userId === this.currentUser.id) {
      const displayName = this.currentUser.displayName || this.currentUser.username || this.currentUser.email;
      return displayName || 'Current User';
    }
    
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const displayName = user.email || user.username;
      return displayName || 'Unknown';
    }
    
    const developer = this.projectDevelopers.find(dev => dev.id === userId);
    if (developer) {
      const displayName = developer.email || developer.name;
      return displayName || 'Unknown';
    }
    
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

  // ✅ Multiple Screenshots Functionality
  activateClipboard(): void {
    this.isClipboardActive = true;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isClipboardActive && event.ctrlKey && event.key === 'v') {
      return;
    }
  }

  onMultipleScreenshotsSelected(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.handleScreenshotFile(file);
    }
  }

  onPasteMultipleScreenshots(event: ClipboardEvent): void {
    event.preventDefault();
    
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          this.handleScreenshotFile(file);
        }
      }
    }
  }

  handleScreenshotFile(file: File): void {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.displayError('Invalid image type. Please use PNG, JPEG, JPG, or GIF images only.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.displayError('Image too large. Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploadedScreenshots.push({
        file: file,
        preview: e.target.result
      });
    };
    reader.readAsDataURL(file);
  }

  removeUploadedScreenshot(index: number): void {
    this.uploadedScreenshots.splice(index, 1);
  }

  removeExistingScreenshot(screenshotId: number): void {
    this.screenshotsToDelete.push(screenshotId);
    this.existingScreenshots = this.existingScreenshots.filter(s => s.id !== screenshotId);
  }

  // ✅ Multiple Screenshots Viewer
  viewAllScreenshots(testCase: any): void {
    if (!testCase.bug_screenshots || testCase.bug_screenshots.length === 0) return;
    
    this.viewingScreenshots = testCase.bug_screenshots.map((s: any) => s.screenshot_url);
    this.currentScreenshotIndex = 0;
    this.showScreenshotsViewer = true;
  }

  viewScreenshot(screenshotUrl: string): void {
    this.viewingScreenshots = [screenshotUrl];
    this.currentScreenshotIndex = 0;
    this.showScreenshotsViewer = true;
  }

  closeScreenshotsViewer(): void {
    this.showScreenshotsViewer = false;
    this.viewingScreenshots = [];
    this.currentScreenshotIndex = 0;
  }

  previousScreenshot(): void {
    if (this.currentScreenshotIndex > 0) {
      this.currentScreenshotIndex--;
    }
  }

  nextScreenshot(): void {
    if (this.currentScreenshotIndex < this.viewingScreenshots.length - 1) {
      this.currentScreenshotIndex++;
    }
  }

  goToScreenshot(index: number): void {
    this.currentScreenshotIndex = index;
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

  // ✅ UPDATED: Form Validation to include category
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

    if (!this.newTestCase.category) {
      this.formErrors.category = 'Category is required';
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
      category: '',
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

  // ✅ **FIXED METHOD: Open edit test case popup with screenshots**
  openAddTestCasePopup(): void {
    if (!this.selectedProjectId) return;
    
    this.isEditMode = false;
    this.clearFormErrors();
    this.uploadedScreenshots = [];
    this.existingScreenshots = [];
    this.screenshotsToDelete = [];
    this.isClipboardActive = false;
    
    this.newTestCase = {
      test_case_id: '',
      page_name: '',
      category: 'Functional',
      title: '',
      description: '',
      pre_conditions: '',
      test_actions: '',
      expected_result: '',
      test_data: null,
      is_automated: false,
      requirement: this.selectedRequirementId,
      project: this.selectedProjectId,
      created_by: this.currentUser?.id,
      assigned_to: null,
      is_executed: false,
      executed_by: null,
      executed_on: null,
      status: 'Not tested yet',
      actual_result: '',
      comments: '',
      bug_raised: false,
      bug_status: 'Open'
    };
    this.showTestCasePopup = true;
  }

  // ✅ **FIXED METHOD: Edit test case with proper screenshot loading**
  editTestCase(testCase: any): void {
    this.isEditMode = true;
    this.editingTestCaseId = testCase.id;
    this.uploadedScreenshots = [];
    this.existingScreenshots = [];
    this.screenshotsToDelete = [];
    this.isClipboardActive = false;
    
    // Format executed_on date
    let formattedExecutedOn = null;
    if (testCase.executed_on) {
      const executedDate = new Date(testCase.executed_on);
      formattedExecutedOn = executedDate.toISOString().slice(0, 16);
    }
    
    // Set test case data
    this.newTestCase = { 
      ...testCase,
      executed_on: formattedExecutedOn,
      page_name: testCase.page_name || '',
      category: testCase.category || 'Functional',
      // Ensure bug_raised is set correctly based on bug_status
      bug_raised: !!testCase.bug_status,
      // Handle test_data assignment
      test_data: testCase.test_data || null,
      // Handle assigned_to
      assigned_to: testCase.assigned_to || null
    };
    
    // ✅ **CRITICAL FIX: Load existing screenshots using separate API call**
    this.loadExistingScreenshots(testCase.id);
    
    this.clearFormErrors();
    this.showTestCasePopup = true;
  }

  closeTestCasePopup(): void {
    this.showTestCasePopup = false;
    this.isEditMode = false;
    this.editingTestCaseId = null;
    this.uploadedScreenshots = [];
    this.existingScreenshots = [];
    this.screenshotsToDelete = [];
    this.isClipboardActive = false;
    this.clearFormErrors();
  }

  saveTestCase(): void {
    if (!this.validateTestCaseForm()) {
      return;
    }

    const currentPageBeforeSave = this.currentPage;
    const testCaseData = { ...this.newTestCase };

    // Handle execution data
    if (testCaseData.is_executed) {
      testCaseData.executed_by = this.currentUser?.id;
      
      if (testCaseData.executed_on) {
        if (typeof testCaseData.executed_on === 'string' && testCaseData.executed_on.includes('T')) {
          testCaseData.executed_on = new Date(testCaseData.executed_on).toISOString();
        }
      }
      
      if (!testCaseData.status) {
        testCaseData.status = 'Not tested yet';
      }
    } else {
      testCaseData.executed_by = null;
      testCaseData.executed_on = null;
      testCaseData.status = 'Not tested yet';
      testCaseData.actual_result = '';
      testCaseData.test_actions = '';
    }

    // Handle bug data
    if (!testCaseData.bug_raised) {
      testCaseData.bug_status = null;
    }

    // Set required fields
    testCaseData.project = this.selectedProjectId;
    testCaseData.created_by = this.currentUser?.id;
    
    if (this.selectedRequirementId) {
      testCaseData.requirement = this.selectedRequirementId;
    }

    // Ensure page_name and category are included
    if (!testCaseData.page_name) {
      testCaseData.page_name = '';
    }
    if (!testCaseData.category) {
      testCaseData.category = 'Functional';
    }

    // Convert IDs to numbers
    if (testCaseData.test_data) {
      testCaseData.test_data = Number(testCaseData.test_data);
    }

    if (testCaseData.assigned_to) {
      testCaseData.assigned_to = Number(testCaseData.assigned_to);
    }

    console.log('Saving test case with data:', testCaseData);
    console.log('Uploaded screenshots:', this.uploadedScreenshots.length);
    console.log('Screenshots to delete:', this.screenshotsToDelete);
    console.log('Existing screenshots:', this.existingScreenshots.length);

    if (this.isEditMode && this.editingTestCaseId) {
      if (this.uploadedScreenshots.length > 0 || this.screenshotsToDelete.length > 0) {
        // Use FormData for file uploads
        const formData = new FormData();
        
        // Append all test case fields to FormData
        Object.keys(testCaseData).forEach(key => {
          if (testCaseData[key] !== null && testCaseData[key] !== undefined) {
            const value = typeof testCaseData[key] === 'object' ? JSON.stringify(testCaseData[key]) : testCaseData[key];
            formData.append(key, value.toString());
          }
        });

        // Append screenshots to delete
        this.screenshotsToDelete.forEach(screenshotId => {
          formData.append('screenshots_to_delete', screenshotId.toString());
        });

        // Append new screenshots
        this.uploadedScreenshots.forEach((screenshot, index) => {
          formData.append('screenshots', screenshot.file);
        });

        this.testCaseService.updateTestCaseWithMultipleScreenshots(this.editingTestCaseId, formData).subscribe({
          next: () => {
            this.loadAllTestCasesForProject();
            this.closeTestCasePopup();
            this.currentPage = currentPageBeforeSave;
            this.showSuccess('Test case updated successfully!');
          },
          error: (error: any) => {
            console.error('Error updating test case with screenshots:', error);
            this.formErrors.general = 'Error updating test case: ' + (error.error?.message || error.message);
          }
        });
      } else {
        // No screenshots to upload or delete - send regular JSON
        this.testCaseService.updateTestCase(this.editingTestCaseId, testCaseData).subscribe({
          next: () => {
            this.loadAllTestCasesForProject();
            this.closeTestCasePopup();
            this.currentPage = currentPageBeforeSave;
            this.showSuccess('Test case updated successfully!');
          },
          error: (error: any) => {
            console.error('Error updating test case:', error);
            this.formErrors.general = 'Error updating test case: ' + (error.error?.message || error.message);
          }
        });
      }
    } else {
      // For new test cases with screenshots
      if (this.uploadedScreenshots.length > 0) {
        const formData = new FormData();
        
        Object.keys(testCaseData).forEach(key => {
          if (testCaseData[key] !== null && testCaseData[key] !== undefined) {
            const value = typeof testCaseData[key] === 'object' ? JSON.stringify(testCaseData[key]) : testCaseData[key];
            formData.append(key, value.toString());
          }
        });

        // Append new screenshots
        this.uploadedScreenshots.forEach((screenshot, index) => {
          formData.append('screenshots', screenshot.file);
        });

        this.testCaseService.addTestCaseWithMultipleScreenshots(formData).subscribe({
          next: () => {
            this.loadAllTestCasesForProject();
            this.closeTestCasePopup();
            this.showSuccess('Test case added successfully!');
          },
          error: (error: any) => {
            console.error('Error adding test case with screenshots:', error);
            this.formErrors.general = 'Error adding test case: ' + (error.error?.message || error.message);
          }
        });
      } else {
        // No screenshots - send regular JSON
        this.testCaseService.addTestCase(testCaseData).subscribe({
          next: () => {
            this.loadAllTestCasesForProject();
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
      page_name: this.executingTestCase.page_name || '',
      category: this.executingTestCase.category || 'Functional'
    };

    console.log('Saving execution with user:', this.currentUser);
    console.log('Execution data:', updatedTestCase);

    const currentPageBeforeSave = this.currentPage;

    this.testCaseService.updateTestCase(this.executingTestCase.id, updatedTestCase).subscribe({
      next: () => {
        this.loadAllTestCasesForProject();
        this.closeExecutePopup();
        this.currentPage = currentPageBeforeSave;
        this.showSuccess('Test execution saved successfully!');
      },
      error: (error: any) => {
        console.error('Error saving test execution:', error);
        this.formExecutionErrors.general = 'Error saving execution: ' + (error.error?.message || error.message);
      }
    });
  }

  // ✅ UPDATED: Template Download and Import Functionality
  downloadTemplate(): void {
    if (!this.selectedProjectId) {
      this.displayError('Please select a project first');
      return;
    }

    this.testCaseService.downloadTemplate(this.selectedProjectId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        a.download = `testcase_template_${this.selectedProjectName || 'project'}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.showSuccess('Template downloaded successfully! Only project developers are available in user dropdowns.');
      },
      error: (error: any) => {
        console.error('Error downloading template:', error);
        this.displayError('Error downloading template: ' + (error.error?.message || error.message));
      }
    });
  }

  openImportPopup(): void {
    if (!this.selectedProjectId) {
      this.displayError('Please select a project first');
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

    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      this.displayError('Only Excel files (.xlsx, .xls) are allowed');
      return;
    }

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
    if (!this.importFile || !this.selectedProjectId) {
      this.displayError('Please select a file to import');
      return;
    }

    this.isImporting = true;
    
    this.testCaseService.bulkImportTestCases(this.selectedProjectId, this.importFile).subscribe({
      next: (results: any) => {
        this.importResults = results;
        this.isImporting = false;
        
        if (results.success) {
          if (results.imported > 0) {
            this.proceedWithImport();
          } else {
            this.displayError(results.message || 'No test cases were imported.');
            this.closeImportPopup();
          }
        } else {
          this.displayError(results.message || 'Import failed. Please check the file and try again.');
        }
      },
      error: (error: any) => {
        this.isImporting = false;
        console.error('Error during import:', error);
        
        if (error.status === 207) {
          this.importResults = error.error;
          this.showImportConfirmation = true;
        } else {
          this.displayError('Error importing file: ' + (error.error?.message || error.message));
        }
      }
    });
  }

  closeImportConfirmation(): void {
    this.showImportConfirmation = false;
  }

  proceedWithImport(): void {
    if (this.importResults) {
      if (this.importResults.imported > 0) {
        this.showSuccess(`Successfully imported ${this.importResults.imported} test cases!`);
        this.loadAllTestCasesForProject();
        this.loadTestData();
      }
      
      if (this.importResults.skipped && this.importResults.skipped.length > 0) {
        const skippedCount = this.importResults.skipped.length;
        console.warn(`${skippedCount} records were skipped:`, this.importResults.skipped);
      }
    }
    
    this.closeImportConfirmation();
    this.closeImportPopup();
  }
}