import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { ClientsService } from '../clients.service';

type IdOrObj = number | { id: number; [k: string]: any };

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  clients: any[] = [];
  users: any[] = [];          // ✅ developers & leads
  technologies: any[] = [];   // ✅ technology list

  newProject: any = {
    project_name: '',
    client: null,   // <-- default null
    status: null,   // <-- default null so placeholder shows
    start_date: '',
    deadline_date: '',
    delivery_date: null,
    frontend_developers: [] as number[],
    backend_developers: [] as number[],
    project_lead: null as number | null,
    qa_lead: null as number | null,
    frontend_technologies: [] as number[],
    backend_technologies: [] as number[],
    other_technologies: [] as number[]
  };

  showProjectPopup = false;
  isEditMode = false;
  editingProjectId: number | null = null;
  submitted = false;
  dateErrorMessage = '';

  constructor(
    private projectService: ProjectService,
    private clientsService: ClientsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadClients();
    this.loadUsers();
    this.loadTechnologies();
  }

  // ✅ Load all projects
  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data: any[]) => (this.projects = data || []),
      error: (err) => console.error('Error fetching projects:', err)
    });
  }

  // ✅ Load clients
  loadClients(): void {
    this.clientsService.getClients().subscribe({
      next: (data: any[]) => (this.clients = data || []),
      error: (err) => console.error('Error fetching clients:', err)
    });
  }

  // ✅ Load users
  loadUsers(): void {
    this.projectService.getUsers().subscribe({
      next: (data: any[]) => (this.users = data || []),
      error: (err) => console.error('Error fetching users:', err)
    });
  }

  // ✅ Load technologies
  loadTechnologies(): void {
    this.projectService.getTechnologies().subscribe({
      next: (data: any[]) => (this.technologies = data || []),
      error: (err) => console.error('Error fetching technologies:', err)
    });
  }

  // ✅ Get client name by ID
  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.client_name : 'Unknown';
  }

  // --- Helpers ---
  private toIdArray(arr: IdOrObj[] | null | undefined): number[] {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => (typeof item === 'number' ? item : item?.id)).filter(Boolean) as number[];
  }
  private toId(value: IdOrObj | null | undefined): number | null {
    if (value == null) return null;
    return typeof value === 'number' ? value : value.id ?? null;
  }

  displayUserList(list: IdOrObj[] | null | undefined): string {
    const ids = this.toIdArray(list);
    return ids
      .map(id => this.users.find(u => u.id === id))
      .filter(Boolean)
      .map(u => u!.email || u!.username || `User#${u!.id}`)
      .join(', ');
  }

  displayUser(value: IdOrObj | null | undefined): string {
    const id = this.toId(value);
    if (!id) return 'N/A';
    const u = this.users.find(x => x.id === id);
    return u ? (u.email || u.username || `User#${u.id}`) : `User#${id}`;
  }

  displayTechList(list: IdOrObj[] | null | undefined): string {
    const ids = this.toIdArray(list);
    return ids
      .map(id => this.technologies.find(t => t.id === id))
      .filter(Boolean)
      .map(t => t!.name || `Tech#${t!.id}`)
      .join(', ');
  }

  // ✅ Open Add form
  openAddProjectPopup(): void {
    this.isEditMode = false;
    this.submitted = false;
    this.dateErrorMessage = '';
    this.newProject = {
      project_name: '',
      client: null,
      status: 'Not Started',
      start_date: '',
      deadline_date: '',
      delivery_date: null,
      frontend_developers: [] as number[],
      backend_developers: [] as number[],
      project_lead: null,
      qa_lead: null,
      frontend_technologies: [] as number[],
      backend_technologies: [] as number[],
      other_technologies: [] as number[]
    };
    this.showProjectPopup = true;
  }

  // ✅ Open Edit form
  editProject(project: any): void {
    this.isEditMode = true;
    this.editingProjectId = project.id;
    this.submitted = false;
    this.dateErrorMessage = '';
    this.newProject = {
      project_name: project.project_name ?? '',
      client: this.toId(project.client),
      status: project.status ?? 'Not Started',
      start_date: project.start_date ?? '',
      deadline_date: project.deadline_date ?? '',
      delivery_date: project.delivery_date ?? null,
      frontend_developers: this.toIdArray(project.frontend_developers),
      backend_developers: this.toIdArray(project.backend_developers),
      project_lead: this.toId(project.project_lead),
      qa_lead: this.toId(project.qa_lead),
      frontend_technologies: this.toIdArray(project.frontend_technologies),
      backend_technologies: this.toIdArray(project.backend_technologies),
      other_technologies: this.toIdArray(project.other_technologies)
    };
    this.showProjectPopup = true;
  }

  // ✅ Close popup
  closeProjectPopup(): void {
    this.showProjectPopup = false;
    this.isEditMode = false;
    this.editingProjectId = null;
    this.submitted = false;
    this.dateErrorMessage = '';
  }

  // ✅ Date validation
  private parseDate(d: string | null | undefined): number | null {
    if (!d) return null;
    const ts = new Date(d).getTime();
    return isNaN(ts) ? null : ts;
  }
  private validateDates(): boolean {
    const start = this.parseDate(this.newProject.start_date);
    const deadline = this.parseDate(this.newProject.deadline_date);
    const delivery = this.parseDate(this.newProject.delivery_date);
    this.dateErrorMessage = '';
    if (start && deadline && deadline < start) {
      this.dateErrorMessage = 'Deadline cannot be before Start date.';
      return false;
    }
    if (start && delivery && delivery < start) {
      this.dateErrorMessage = 'Delivery cannot be before Start date.';
      return false;
    }
    return true;
  }

  hasErrors(): boolean {
    return (
      !this.newProject.project_name ||
      !this.newProject.client ||
      !this.newProject.start_date ||
      !this.newProject.deadline_date ||
      !this.validateDates()
    );
  }

  // ✅ Save or Update
  saveProject(): void {
    this.submitted = true;
    if (this.hasErrors()) return;

    const payload = {
      project_name: this.newProject.project_name,
      client: this.newProject.client,
      status: this.newProject.status,
      start_date: this.newProject.start_date,
      deadline_date: this.newProject.deadline_date,
      delivery_date: this.newProject.delivery_date,
      frontend_developers: this.toIdArray(this.newProject.frontend_developers),
      backend_developers: this.toIdArray(this.newProject.backend_developers),
      project_lead: this.toId(this.newProject.project_lead),
      qa_lead: this.toId(this.newProject.qa_lead),
      frontend_technologies: this.toIdArray(this.newProject.frontend_technologies),
      backend_technologies: this.toIdArray(this.newProject.backend_technologies),
      other_technologies: this.toIdArray(this.newProject.other_technologies)
    };

    if (this.isEditMode && this.editingProjectId) {
      this.projectService.updateProject(this.editingProjectId, payload).subscribe({
        next: () => {
          this.loadProjects();
          this.closeProjectPopup();
        },
        error: (err) => console.error('Error updating project:', err)
      });
    } else {
      this.projectService.addProject(payload).subscribe({
        next: () => {
          this.loadProjects();
          this.closeProjectPopup();
        },
        error: (err) => console.error('Error adding project:', err)
      });
    }
  }

  // ✅ Navigation
  viewRequirements(project: any): void {
    this.router.navigate(['/project-requirements', project.id]);
  }
  viewTestPlans(project: any): void {
    this.router.navigate(['/test-plans', project.id]);
  }
}
