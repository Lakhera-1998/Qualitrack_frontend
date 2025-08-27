import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TestPlanService } from '../services/test-plan.service';
import { ProjectService } from '../services/project.service';
import { TestingTypeService } from '../services/testing-type.service';
import { CommonModule } from '@angular/common';   // ✅ Needed for date pipe
import { FormsModule } from '@angular/forms';     // ✅ Needed for ngModel
import { TruncatePipe } from '../pipes/truncate.pipe';  // adjust path if needed

@Component({
  selector: 'app-test-plans',
  templateUrl: './test-plans.component.html',
  styleUrls: ['./test-plans.component.css'],
  standalone: true,  // ✅ Standalone component
  imports: [CommonModule, FormsModule, TruncatePipe]  // ✅ Import date + ngModel support
})
export class TestPlansComponent implements OnInit {
  projectId: number = 0;
  project: any = null;
  testPlans: any[] = [];
  testingTypes: any[] = [];
  users: any[] = []; // This would typically come from a user service
  
  newTestPlan: any = {
    test_plan_id: '',
    title: '',
    objective: '',
    scope: '',
    testing_types: [],
    roles_covered: '',
    test_lead: null,
    project: null
  };

  showTestPlanPopup = false;
  isEditMode = false;
  editingTestPlanId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private testPlanService: TestPlanService,
    private projectService: ProjectService,
    private testingTypeService: TestingTypeService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.loadProject();
    this.loadTestPlans();
    this.loadTestingTypes();
    this.loadUsers(); // You would implement this method to load users
  }

  loadProject(): void {
    this.projectService.getProject(this.projectId).subscribe({
      next: (data: any) => {
        this.project = data;
      },
      error: (err) => {
        console.error('Error fetching project:', err);
      }
    });
  }

  loadTestPlans(): void {
    this.testPlanService.getTestPlansByProject(this.projectId).subscribe({
      next: (data: any[]) => {
        this.testPlans = data;
      },
      error: (err) => {
        console.error('Error fetching test plans:', err);
      }
    });
  }

  loadTestingTypes(): void {
    this.testingTypeService.getTestingTypes().subscribe({
      next: (data: any[]) => {
        this.testingTypes = data;
      },
      error: (err: any) => {
        console.error('Error fetching testing types:', err);
      }
    });
  }

  loadUsers(): void {
    // This is a placeholder - you would implement a user service
    this.users = [
      { id: 1, username: 'testlead1', email: 'testlead1@example.com' },
      { id: 2, username: 'testlead2', email: 'testlead2@example.com' }
    ];
  }

  getUsername(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? (user.username || user.email) : 'Unknown';
  }

  isTestingTypeSelected(typeId: number): boolean {
    return this.newTestPlan.testing_types.includes(typeId);
  }

  onTestingTypeChange(typeId: number, event: any): void {
    if (event.target.checked) {
      this.newTestPlan.testing_types.push(typeId);
    } else {
      const index = this.newTestPlan.testing_types.indexOf(typeId);
      if (index > -1) {
        this.newTestPlan.testing_types.splice(index, 1);
      }
    }
  }

  openAddTestPlanPopup(): void {
    this.isEditMode = false;
    this.newTestPlan = {
      test_plan_id: '',
      title: '',
      objective: '',
      scope: '',
      testing_types: [],
      roles_covered: '',
      test_lead: null,
      project: this.projectId
    };
    this.showTestPlanPopup = true;
  }

  editTestPlan(testPlan: any): void {
    this.isEditMode = true;
    this.editingTestPlanId = testPlan.id;
    this.newTestPlan = { ...testPlan };
    // Convert testing_types from objects to IDs if needed
    if (testPlan.testing_types && testPlan.testing_types.length > 0 && typeof testPlan.testing_types[0] === 'object') {
      this.newTestPlan.testing_types = testPlan.testing_types.map((type: any) => type.id);
    }
    this.showTestPlanPopup = true;
  }

  closeTestPlanPopup(): void {
    this.showTestPlanPopup = false;
    this.isEditMode = false;
    this.editingTestPlanId = null;
  }

  saveTestPlan(): void {
    if (!this.newTestPlan.test_plan_id || !this.newTestPlan.title || !this.newTestPlan.objective || !this.newTestPlan.scope) {
      alert('Please fill all required fields');
      return;
    }

    // Ensure project ID is set
    this.newTestPlan.project = this.projectId;

    if (this.isEditMode && this.editingTestPlanId) {
      this.testPlanService.updateTestPlan(this.editingTestPlanId, this.newTestPlan).subscribe({
        next: () => {
          this.loadTestPlans();
          this.closeTestPlanPopup();
        },
        error: (err) => {
          console.error('Error updating test plan:', err);
        }
      });
    } else {
      this.testPlanService.addTestPlan(this.newTestPlan).subscribe({
        next: () => {
          this.loadTestPlans();
          this.closeTestPlanPopup();
        },
        error: (err) => {
          console.error('Error adding test plan:', err);
        }
      });
    }
  }
}