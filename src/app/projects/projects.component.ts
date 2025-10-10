import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { ClientsService } from '../clients.service';
import { AuthService } from '../auth.service';

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
  users: any[] = [];
  technologies: any[] = [];
  searchText = '';

  newProject: any = {};
  showProjectPopup = false;
  isEditMode = false;
  editingProjectId: number | null = null;
  submitted = false;
  dateErrorMessage = '';
  apiErrorMessage = '';
  successMessage = '';
  showAddEditButtons = false;

  constructor(
    private projectService: ProjectService,
    private clientsService: ClientsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadClients();
    this.loadUsers();
    this.loadTechnologies();
    this.setButtonVisibility();
  }

  private setButtonVisibility(): void {
    const user = this.authService.getCurrentUser();
    this.showAddEditButtons = !!(user && (user.is_superuser || user.is_staff));
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (data) => (this.projects = data || []),
      error: (err) => console.error('Error loading projects', err)
    });
  }

  loadClients() {
    this.clientsService.getClients().subscribe({
      next: (data) => (this.clients = data || []),
      error: (err) => console.error(err)
    });
  }

  loadUsers() {
    this.projectService.getUsers().subscribe({
      next: (data) => (this.users = data || []),
      error: (err) => console.error(err)
    });
  }

  loadTechnologies() {
    this.projectService.getTechnologies().subscribe({
      next: (data) => (this.technologies = data || []),
      error: (err) => console.error(err)
    });
  }

  getClientName(id: number): string {
    const c = this.clients.find((x) => x.id === id);
    return c ? c.client_name : 'Unknown';
  }

  filteredProjects() {
    if (!this.searchText) return this.projects;
    const s = this.searchText.toLowerCase();
    return this.projects.filter(
      (p) =>
        p.project_name.toLowerCase().includes(s) ||
        this.getClientName(p.client).toLowerCase().includes(s)
    );
  }

  openAddProjectPopup() {
    if (!this.showAddEditButtons) return;
    this.isEditMode = false;
    this.submitted = false;
    this.newProject = {
      project_name: '',
      client: null,
      status: 'Not Started',
      start_date: '',
      deadline_date: '',
      delivery_date: null,
      frontend_developers: [],
      backend_developers: [],
      project_lead: null,
      qa_lead: null,
      frontend_technologies: [],
      backend_technologies: [],
      other_technologies: []
    };
    this.showProjectPopup = true;
  }

  editProject(project: any) {
    if (!this.showAddEditButtons) return;
    this.isEditMode = true;
    this.editingProjectId = project.id;
    this.newProject = { ...project };
    this.showProjectPopup = true;
  }

  closeProjectPopup() {
    this.showProjectPopup = false;
    this.isEditMode = false;
    this.submitted = false;
    this.apiErrorMessage = '';
    this.dateErrorMessage = '';
  }

  private parseDate(d: string): number | null {
    if (!d) return null;
    const ts = new Date(d).getTime();
    return isNaN(ts) ? null : ts;
  }

  private validateDates(): boolean {
    const s = this.parseDate(this.newProject.start_date);
    const d = this.parseDate(this.newProject.deadline_date);
    if (s && d && d < s) {
      this.dateErrorMessage = 'Deadline cannot be before Start Date.';
      return false;
    }
    return true;
  }

  saveProject() {
    this.submitted = true;
    this.apiErrorMessage = '';
    if (
      !this.newProject.project_name ||
      !this.newProject.client ||
      !this.newProject.start_date ||
      !this.newProject.deadline_date ||
      !this.validateDates()
    ) {
      return;
    }

    const payload = { ...this.newProject };

    if (this.isEditMode && this.editingProjectId) {
      this.projectService.updateProject(this.editingProjectId, payload).subscribe({
        next: () => {
          this.loadProjects();
          this.successMessage = 'Project updated successfully!';
          this.closeProjectPopup();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => (this.apiErrorMessage = err.error?.detail || 'Error updating project')
      });
    } else {
      this.projectService.addProject(payload).subscribe({
        next: () => {
          this.loadProjects();
          this.successMessage = 'Project added successfully!';
          this.closeProjectPopup();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => (this.apiErrorMessage = err.error?.detail || 'Error adding project')
      });
    }
  }

  viewRequirements(p: any) {
    this.router.navigate(['/project-requirements', p.id]);
  }

  viewTestPlans(p: any) {
    this.router.navigate(['/test-plans', p.id]);
  }

  displayUserList(list: any[]): string {
    return (list || [])
      .map((id) => this.users.find((u) => u.id === id)?.email || `User#${id}`)
      .join(', ');
  }

  displayUser(id: number): string {
    const u = this.users.find((x) => x.id === id);
    return u ? u.email : 'N/A';
  }

  displayTechList(list: any[]): string {
    return (list || [])
      .map((id) => this.technologies.find((t) => t.id === id)?.name || `Tech#${id}`)
      .join(', ');
  }
}