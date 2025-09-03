import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TestPlanService } from '../services/test-plan.service';
import { ProjectService } from '../services/project.service';
import { TestingTypeService } from '../services/testing-type.service';
import { TechnologyService } from '../services/technology.service';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../pipes/truncate.pipe';

@Component({
  selector: 'app-test-plans',
  templateUrl: './test-plans.component.html',
  styleUrls: ['./test-plans.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe]
})
export class TestPlansComponent implements OnInit {
  projectId: number = 0;
  project: any = null;
  testPlans: any[] = [];
  testingTypes: any[] = [];
  technologies: any[] = [];
  users: any[] = [];

  newTestPlan: any = {
    test_plan_id: '',
    title: '',
    objective: '',
    scope: '',
    testing_types_ids: [],
    technologies_ids: [],
    roles_covered: '',
    test_lead_id: null,
    project_lead_id: null,
    project: null
  };

  showTestPlanPopup = false;
  isEditMode = false;
  editingTestPlanId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private testPlanService: TestPlanService,
    private projectService: ProjectService,
    private testingTypeService: TestingTypeService,
    private technologyService: TechnologyService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));
    this.loadProject();
    this.loadTestPlans();
    this.loadTestingTypes();
    this.loadTechnologies();
    this.loadUsers();
  }

  loadProject(): void {
    this.projectService.getProject(this.projectId).subscribe(data => this.project = data);
  }

  loadTestPlans(): void {
    this.testPlanService.getTestPlansByProject(this.projectId).subscribe(data => this.testPlans = data);
  }

  loadTestingTypes(): void {
    this.testingTypeService.getTestingTypes().subscribe(data => this.testingTypes = data);
  }

  loadTechnologies(): void {
    this.technologyService.getTechnologies().subscribe(data => this.technologies = data);
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(data => this.users = data);
  }

  getUsername(user: any): string {
    return user ? (user.username || user.email) : 'Unknown';
  }

  isTestingTypeSelected(id: number): boolean {
    return this.newTestPlan.testing_types_ids.includes(id);
  }
  onTestingTypeChange(id: number, event: any): void {
    if (event.target.checked) this.newTestPlan.testing_types_ids.push(id);
    else this.newTestPlan.testing_types_ids = this.newTestPlan.testing_types_ids.filter((x: number) => x !== id);
  }

  isTechnologySelected(id: number): boolean {
    return this.newTestPlan.technologies_ids.includes(id);
  }
  onTechnologyChange(id: number, event: any): void {
    if (event.target.checked) this.newTestPlan.technologies_ids.push(id);
    else this.newTestPlan.technologies_ids = this.newTestPlan.technologies_ids.filter((x: number) => x !== id);
  }

  openAddTestPlanPopup(): void {
    this.isEditMode = false;
    this.newTestPlan = {
      test_plan_id: '',
      title: '',
      objective: '',
      scope: '',
      testing_types_ids: [],
      technologies_ids: [],
      roles_covered: '',
      test_lead_id: null,
      project_lead_id: null,
      project: this.projectId
    };
    this.showTestPlanPopup = true;
  }

  editTestPlan(testPlan: any): void {
    this.isEditMode = true;
    this.editingTestPlanId = testPlan.id;
    this.newTestPlan = {
      ...testPlan,
      testing_types_ids: testPlan.testing_types.map((t: any) => t.id),
      technologies_ids: testPlan.technologies.map((t: any) => t.id),
      test_lead_id: testPlan.test_lead?.id || null,
      project_lead_id: testPlan.project_lead?.id || null
    };
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
    this.newTestPlan.project = this.projectId;

    if (this.isEditMode && this.editingTestPlanId) {
      this.testPlanService.updateTestPlan(this.editingTestPlanId, this.newTestPlan).subscribe(() => {
        this.loadTestPlans();
        this.closeTestPlanPopup();
      });
    } else {
      this.testPlanService.addTestPlan(this.newTestPlan).subscribe(() => {
        this.loadTestPlans();
        this.closeTestPlanPopup();
      });
    }
  }
}
