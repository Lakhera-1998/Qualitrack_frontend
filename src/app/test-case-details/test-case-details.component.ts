import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TestCaseService } from '../services/test-case.service';
import { TestDataService } from '../services/test-data.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../auth.service';
import { ProjectService } from '../services/project.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private testCaseService: TestCaseService,
    private testDataService: TestDataService,
    private userService: UserService,
    private authService: AuthService,
    private projectService: ProjectService
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
        this.testCase = {
          ...data,
          bug_screenshot: data.bug_screenshot 
            ? this.testCaseService.getBugScreenshotUrl(data.bug_screenshot)
            : null
        };
        
        // Load test data and history in parallel
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

  loadTestData(testCaseId: number): void {
    this.testDataService.getTestDataByTestCase(testCaseId).subscribe({
      next: (data: any[]) => {
        this.testData = data.map(item => ({
          ...item,
          file_data: item.file_data ? this.testDataService.getFileUrl(item.file_data) : null,
          image_data: item.image_data ? this.testDataService.getImageUrl(item.image_data) : null,
          file_size: this.formatFileSize(item.file_data),
          uploaded_by_name: this.getUsername(item.uploaded_by)
        }));
      },
      error: (error: any) => {
        console.error('Error fetching test data:', error);
        this.testData = [];
      }
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

  getDeveloperDisplay(developerId: number): string {
    if (!developerId) return '-';
    const developer = this.projectDevelopers.find(dev => dev.id === developerId);
    return developer ? (developer.name || developer.email || 'Unknown') : 'Unknown';
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
    this.router.navigate(['/test-cases']);
  }
}