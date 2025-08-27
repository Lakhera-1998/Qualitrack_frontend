import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TestCaseService } from '../services/test-case.service';
import { RequirementService } from '../services/requirement.service';
import { CommonModule } from '@angular/common';   // ✅ Needed for date pipe
import { FormsModule } from '@angular/forms';     // ✅ Needed for ngModel

@Component({
  selector: 'app-test-cases',
  templateUrl: './test-cases.component.html',
  styleUrls: ['./test-cases.component.css'],
  standalone: true,  // ✅ Standalone component
  imports: [CommonModule, FormsModule]  // ✅ Import date + ngModel support
})
export class TestCasesComponent implements OnInit {
  requirementId: number = 0;
  requirement: any = null;
  testCases: any[] = [];
  users: any[] = []; // This would typically come from a user service
  
  newTestCase: any = {
    title: '',
    description: '',
    pre_conditions: '',
    test_actions: '',
    expected_result: '',
    is_automated: false,
    requirement: null
  };

  executionData: any = {
    status: 'Pass',
    actual_result: '',
    comments: '',
    bug_raised: false,
    bug_status: 'Open'
  };

  showTestCasePopup = false;
  showExecutePopup = false;
  isEditMode = false;
  editingTestCaseId: number | null = null;
  executingTestCase: any = null;

  constructor(
    private route: ActivatedRoute,
    private testCaseService: TestCaseService,
    private requirementService: RequirementService
  ) {}

  ngOnInit(): void {
    this.requirementId = Number(this.route.snapshot.paramMap.get('requirementId'));
    this.loadRequirement();
    this.loadTestCases();
    this.loadUsers(); // You would implement this method to load users
  }

  loadRequirement(): void {
    this.requirementService.getRequirement(this.requirementId).subscribe({
      next: (data: any) => {
        this.requirement = data;
      },
      error: (err) => {
        console.error('Error fetching requirement:', err);
      }
    });
  }

  loadTestCases(): void {
    this.testCaseService.getTestCasesByRequirement(this.requirementId).subscribe({
      next: (data: any[]) => {
        this.testCases = data;
      },
      error: (err) => {
        console.error('Error fetching test cases:', err);
      }
    });
  }

  loadUsers(): void {
    // This is a placeholder - you would implement a user service
    this.users = [
      { id: 1, username: 'tester1', email: 'tester1@example.com' },
      { id: 2, username: 'tester2', email: 'tester2@example.com' }
    ];
  }

  getUsername(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? (user.username || user.email) : 'Unknown';
  }

  openAddTestCasePopup(): void {
    this.isEditMode = false;
    this.newTestCase = {
      title: '',
      description: '',
      pre_conditions: '',
      test_actions: '',
      expected_result: '',
      is_automated: false,
      requirement: this.requirementId
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

  saveTestCase(): void {
    if (!this.newTestCase.title || !this.newTestCase.description || 
        !this.newTestCase.test_actions || !this.newTestCase.expected_result) {
      alert('Please fill all required fields');
      return;
    }

    // Ensure requirement ID is set
    this.newTestCase.requirement = this.requirementId;

    if (this.isEditMode && this.editingTestCaseId) {
      this.testCaseService.updateTestCase(this.editingTestCaseId, this.newTestCase).subscribe({
        next: () => {
          this.loadTestCases();
          this.closeTestCasePopup();
        },
        error: (err) => {
          console.error('Error updating test case:', err);
        }
      });
    } else {
      this.testCaseService.addTestCase(this.newTestCase).subscribe({
        next: () => {
          this.loadTestCases();
          this.closeTestCasePopup();
        },
        error: (err) => {
          console.error('Error adding test case:', err);
        }
      });
    }
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
      executed_by: 1, // This should be the current user's ID
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
      },
      error: (err) => {
        console.error('Error updating test case execution:', err);
      }
    });
  }
}