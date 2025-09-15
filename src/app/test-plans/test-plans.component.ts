import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestPlanService } from '../services/test-plan.service';
import { ProjectService } from '../services/project.service';
import { TestingTypeService } from '../services/testing-type.service';
import { TechnologyService } from '../services/technology.service';
import { UserService } from '../services/user.service';
import { ClientsService } from '../clients.service';
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
  clients: any[] = [];
  filteredProjects: any[] = [];
  selectedClientId: number | null = null;
  selectedClientName: string = '';
  selectedProjectId: number | null = null;
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
    private router: Router,
    private testPlanService: TestPlanService,
    private projectService: ProjectService,
    private testingTypeService: TestingTypeService,
    private technologyService: TechnologyService,
    private userService: UserService,
    private clientsService: ClientsService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadTestingTypes();
    this.loadTechnologies();
    this.loadUsers();
  }

  loadClients(): void {
    this.clientsService.getClients().subscribe({
      next: (data: any[]) => {
        this.clients = data;
      },
      error: (err) => console.error('Error fetching clients:', err)
    });
  }

  onClientChange(): void {
    this.selectedProjectId = null;
    this.project = null;
    this.testPlans = [];
    this.filteredProjects = [];
    
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
      error: (err) => console.error('Error fetching projects by client:', err)
    });
  }

  onProjectChange(): void {
    if (this.selectedProjectId) {
      this.loadProjectDetails();
      this.loadTestPlans();
    } else {
      this.project = null;
      this.testPlans = [];
    }
  }

  loadProjectDetails(): void {
    if (!this.selectedProjectId) return;
    
    this.projectService.getProject(this.selectedProjectId).subscribe({
      next: (data: any) => {
        this.project = data;
      },
      error: (err) => console.error('Error fetching project:', err)
    });
  }

  loadTestPlans(): void {
    if (!this.selectedProjectId) return;
    
    this.testPlanService.getTestPlansByProject(this.selectedProjectId).subscribe({
      next: (data: any[]) => {
        this.testPlans = data;
      },
      error: (err) => console.error('Error fetching test plans:', err)
    });
  }

  loadTestingTypes(): void {
    this.testingTypeService.getTestingTypes().subscribe({
      next: (data: any[]) => {
        this.testingTypes = data;
      },
      error: (err) => console.error('Error fetching testing types:', err)
    });
  }

  loadTechnologies(): void {
    this.technologyService.getTechnologies().subscribe({
      next: (data: any[]) => {
        this.technologies = data;
      },
      error: (err) => console.error('Error fetching technologies:', err)
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data: any[]) => {
        this.users = data;
      },
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  getUsername(user: any): string {
    return user ? (user.username || user.email) : 'Unknown';
  }

  isTestingTypeSelected(id: number): boolean {
    return this.newTestPlan.testing_types_ids.includes(id);
  }

  onTestingTypeChange(id: number, event: any): void {
    if (event.target.checked) {
      this.newTestPlan.testing_types_ids.push(id);
    } else {
      this.newTestPlan.testing_types_ids = this.newTestPlan.testing_types_ids.filter((x: number) => x !== id);
    }
  }

  isTechnologySelected(id: number): boolean {
    return this.newTestPlan.technologies_ids.includes(id);
  }

  onTechnologyChange(id: number, event: any): void {
    if (event.target.checked) {
      this.newTestPlan.technologies_ids.push(id);
    } else {
      this.newTestPlan.technologies_ids = this.newTestPlan.technologies_ids.filter((x: number) => x !== id);
    }
  }

  openAddTestPlanPopup(): void {
    if (!this.selectedProjectId) return;
    
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
      project: this.selectedProjectId
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
    this.newTestPlan.project = this.selectedProjectId;

    if (this.isEditMode && this.editingTestPlanId) {
      this.testPlanService.updateTestPlan(this.editingTestPlanId, this.newTestPlan).subscribe({
        next: () => {
          this.loadTestPlans();
          this.closeTestPlanPopup();
        },
        error: (err) => console.error('Error updating test plan:', err)
      });
    } else {
      this.testPlanService.addTestPlan(this.newTestPlan).subscribe({
        next: () => {
          this.loadTestPlans();
          this.closeTestPlanPopup();
        },
        error: (err) => console.error('Error adding test plan:', err)
      });
    }
  }
}