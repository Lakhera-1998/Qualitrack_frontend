import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TestCaseService } from '../services/test-case.service';
import { RequirementService } from '../services/requirement.service';
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
  requirementId: number = 0;
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
    created_by: null
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
    private testCaseService: TestCaseService,
    private requirementService: RequirementService,
    private testDataService: TestDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.requirementId = Number(this.route.snapshot.paramMap.get('requirementId'));
    this.loadCurrentUser();
    this.loadRequirement();
    this.loadTestCases();
    this.loadTestData();
    this.loadUsers();
  }

  // ✅ Loaders
  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      console.warn('No current user found in session storage');
    }
  }

  loadRequirement(): void {
    this.requirementService.getRequirement(this.requirementId).subscribe({
      next: (data: any) => (this.requirement = data),
      error: (error: any) => {
        console.error('Error fetching requirement:', error);
        alert('Error loading requirement: ' + (error.error?.message || error.message));
      }
    });
  }

  loadTestCases(): void {
    this.testCaseService.getTestCasesByRequirement(this.requirementId).subscribe({
      next: (data: any[]) => (this.testCases = data),
      error: (error: any) => {
        console.error('Error fetching test cases:', error);
        alert('Error loading test cases: ' + (error.error?.message || error.message));
      }
    });
  }

  loadTestData(): void {
    this.testDataService.getAllTestData().subscribe({
      next: (data: any[]) => (this.testDataList = data),
      error: (error: any) => {
        console.error('Error fetching test data:', error);
        alert('Error loading test data: ' + (error.error?.message || error.message));
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
    this.isEditMode = false;
    this.newTestCase = {
      title: '',
      description: '',
      pre_conditions: '',
      test_actions: '',
      expected_result: '',
      test_data: null,
      is_automated: false,
      requirement: this.requirementId,
      created_by: this.currentUser?.id
    };
    this.showTestCasePopup = true;
  }

  editTestCase(testCase: any): void {
    this.isEditMode = true;
    this.editingTestCaseId = testCase.id;
    this.newTestCase = { ...testCase };
    this.showTestCasePopup = true;
  }

  closeTestCasePopup(): void {
    this.showTestCasePopup = false;
    this.isEditMode = false;
    this.editingTestCaseId = null;
  }

  saveTestCase(): void {
    if (!this.newTestCase.title || !this.newTestCase.description || 
        !this.newTestCase.test_actions || !this.newTestCase.expected_result) {
      alert('Please fill all required fields');
      return;
    }

    this.newTestCase.requirement = this.requirementId;
    this.newTestCase.created_by = this.currentUser?.id;

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
