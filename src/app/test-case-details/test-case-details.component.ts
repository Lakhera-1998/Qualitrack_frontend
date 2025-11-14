import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestCaseService } from '../services/test-case.service';
import { TestDataService } from '../services/test-data.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../auth.service';
import { ProjectService } from '../services/project.service';
import { RequirementService } from '../services/requirement.service';

@Component({
  selector: 'app-test-case-details',
  templateUrl: './test-case-details.component.html',
  styleUrls: ['./test-case-details.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class TestCaseDetailsComponent implements OnInit {
  testCase: any = null;
  testData: any[] = [];
  testCaseHistory: any[] = [];
  loading: boolean = true;
  error: string = '';
  
  // Image viewer
  showImagePopup: boolean = false;
  viewingImage: string = '';

  // User data
  users: any[] = [];
  currentUser: any = null;
  projectDevelopers: any[] = [];
  
  // Additional data for display
  projectDetails: any = null;
  requirementDetails: any = null;
  projectsMap: Map<number, any> = new Map();

  // Screenshot viewer properties
  showScreenshotViewer: boolean = false;
  currentScreenshotIndex: number = 0;
  currentScreenshot: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private testCaseService: TestCaseService,
    private testDataService: TestDataService,
    private userService: UserService,
    private authService: AuthService,
    private projectService: ProjectService,
    private requirementService: RequirementService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUsers();
    this.loadTestCase();
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data: any[]) => {
        this.users = data;
      },
      error: (error: any) => {
        console.error('Error fetching users:', error);
      }
    });
  }

  loadTestCase(): void {
    const testCaseId = this.route.snapshot.paramMap.get('id');
    
    if (!testCaseId) {
      this.error = 'Test case ID not provided';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';

    this.testCaseService.getTestCase(parseInt(testCaseId)).subscribe({
      next: (data: any) => {
        // Process the test case data to ensure correct screenshot URLs
        this.testCase = this.processTestCaseData(data);
        
        // Load additional data in parallel
        this.loadProjectAndRequirementDetails();
        this.loadTestData(parseInt(testCaseId));
        this.loadTestCaseHistory(parseInt(testCaseId));
        
        // Load project developers if assigned_to exists
        if (this.testCase.project && this.testCase.assigned_to) {
          this.loadProjectDevelopers(this.testCase.project);
        }
      },
      error: (error: any) => {
        console.error('Error fetching test case:', error);
        this.error = 'Error loading test case: ' + (error.error?.message || error.message);
        this.loading = false;
      }
    });
  }

  // Process test case data to ensure correct screenshot URLs
  private processTestCaseData(data: any): any {
    const processedData = { ...data };
    
    // Process single bug screenshot (legacy support)
    if (processedData.bug_screenshot) {
      processedData.bug_screenshot = this.testCaseService.getBugScreenshotUrl(processedData.bug_screenshot);
    }
    
    // Process multiple bug screenshots array
    if (processedData.bug_screenshots && Array.isArray(processedData.bug_screenshots)) {
      processedData.bug_screenshots = processedData.bug_screenshots.map((screenshot: any) => ({
        ...screenshot,
        screenshot_url: this.testCaseService.getBugScreenshotUrl(screenshot.screenshot)
      }));
    }
    
    return processedData;
  }

  loadProjectAndRequirementDetails(): void {
    if (this.testCase.project) {
      // Load project details
      this.projectService.getProject(this.testCase.project).subscribe({
        next: (project: any) => {
          this.projectDetails = project;
          this.projectsMap.set(project.id, project);
        },
        error: (error: any) => {
          console.error('Error fetching project details:', error);
        }
      });
    }

    if (this.testCase.requirement && this.testCase.project) {
      // Load requirement details
      this.requirementService.getRequirement(this.testCase.project, this.testCase.requirement).subscribe({
        next: (requirement: any) => {
          this.requirementDetails = requirement;
        },
        error: (error: any) => {
          console.error('Error fetching requirement details:', error);
        }
      });
    }
  }

  loadTestData(testCaseId: number): void {
    this.testDataService.getTestDataByTestCase(testCaseId).subscribe({
      next: (data: any[]) => {
        this.testData = data.map(item => ({
          ...item,
          file_data: item.file_data ? this.testDataService.getFileUrl(item.file_data) : null,
          image_data: item.image_data ? this.testDataService.getImageUrl(item.image_data) : null,
          file_size: this.formatFileSize(item.file_data),
          uploaded_by_name: this.getUserDisplayName(item.uploaded_by)
        }));

        // Load project details for test data items
        this.loadTestDataProjectDetails();
      },
      error: (error: any) => {
        console.error('Error fetching test data:', error);
        this.testData = [];
      }
    });
  }

  loadTestDataProjectDetails(): void {
    const projectIds = new Set<number>();
    
    // Collect unique project IDs from test data
    this.testData.forEach(item => {
      if (item.project && !this.projectsMap.has(item.project)) {
        projectIds.add(item.project);
      }
    });

    // Load project details for test data
    projectIds.forEach(projectId => {
      this.projectService.getProject(projectId).subscribe({
        next: (project: any) => {
          this.projectsMap.set(projectId, project);
        },
        error: (error: any) => {
          console.error('Error fetching project details for test data:', error);
        }
      });
    });
  }

  loadTestCaseHistory(testCaseId: number): void {
    this.testCaseService.getTestCaseHistory(testCaseId).subscribe({
      next: (data: any[]) => {
        this.testCaseHistory = data;
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Error fetching test case history:', error);
        this.testCaseHistory = [];
        this.checkLoadingComplete();
      }
    });
  }

  loadProjectDevelopers(projectId: number): void {
    this.projectService.getProjectDevelopers(projectId).subscribe({
      next: (data: any[]) => {
        this.projectDevelopers = data;
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Error fetching project developers:', error);
        this.projectDevelopers = [];
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    // This method ensures loading stops only when all data is loaded
    if (this.testCase && this.testData !== null && this.testCaseHistory !== null) {
      this.loading = false;
    }
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

  getUserDisplayName(userId: number): string {
    if (!userId) return 'System';
    
    if (this.currentUser && userId === this.currentUser.id) {
      return this.currentUser.displayName || this.currentUser.username || 'Current User';
    }
    
    const user = this.users.find(u => u.id === userId);
    if (user) {
      return user.displayName || user.name || user.username || 'Unknown User';
    }
    
    const developer = this.projectDevelopers.find(dev => dev.id === userId);
    if (developer) {
      return developer.name || developer.displayName || 'Unknown User';
    }
    
    return 'Unknown User';
  }

  getDeveloperDisplay(developerId: number): string {
    if (!developerId) return '-';
    const developer = this.projectDevelopers.find(dev => dev.id === developerId);
    return developer ? (developer.name || developer.email || 'Unknown') : 'Unknown';
  }

  getProjectName(projectId: number): string {
    if (!projectId) return 'N/A';
    const project = this.projectsMap.get(projectId);
    return project ? project.project_name : 'N/A';
  }

  getRequirementTitle(): string {
    if (!this.requirementDetails) return this.testCase.requirement || '-';
    return this.requirementDetails.requirement_title || this.testCase.requirement || '-';
  }

  getProjectNameForTestCase(): string {
    if (!this.projectDetails) return this.testCase.project || '-';
    return this.projectDetails.project_name || this.testCase.project || '-';
  }

  viewImage(imageUrl: string): void {
    this.viewingImage = imageUrl;
    this.showImagePopup = true;
  }

  closeImagePopup(): void {
    this.showImagePopup = false;
    this.viewingImage = '';
  }

  // Helper method to format file sizes
  private formatFileSize(filePath: string): string {
    if (!filePath) return '';
    return 'Unknown size';
  }

  goBack(): void {
    // Get query parameters from current route to preserve filters
    const queryParams = this.route.snapshot.queryParams;
    
    // Navigate back to test cases with preserved filters
    this.router.navigate(['/test-cases'], {
      queryParams: queryParams
    });
  }

  openScreenshotViewer(index: number): void {
    if (this.testCase.bug_screenshots && this.testCase.bug_screenshots.length > 0) {
      this.currentScreenshotIndex = index;
      this.currentScreenshot = this.testCase.bug_screenshots[index];
      this.showScreenshotViewer = true;
    }
  }

  closeScreenshotViewer(): void {
    this.showScreenshotViewer = false;
    this.currentScreenshotIndex = 0;
    this.currentScreenshot = null;
  }

  nextScreenshot(): void {
    if (this.testCase.bug_screenshots && this.testCase.bug_screenshots.length > 0) {
      this.currentScreenshotIndex = (this.currentScreenshotIndex + 1) % this.testCase.bug_screenshots.length;
      this.currentScreenshot = this.testCase.bug_screenshots[this.currentScreenshotIndex];
    }
  }

  prevScreenshot(): void {
    if (this.testCase.bug_screenshots && this.testCase.bug_screenshots.length > 0) {
      this.currentScreenshotIndex = this.currentScreenshotIndex === 0 
        ? this.testCase.bug_screenshots.length - 1 
        : this.currentScreenshotIndex - 1;
      this.currentScreenshot = this.testCase.bug_screenshots[this.currentScreenshotIndex];
    }
  }

  getScreenshotCounter(): string {
    if (!this.testCase.bug_screenshots || this.testCase.bug_screenshots.length === 0) {
      return '';
    }
    return `${this.currentScreenshotIndex + 1} of ${this.testCase.bug_screenshots.length}`;
  }
}