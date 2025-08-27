import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ClientsComponent } from './clients/clients.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectRequirementsComponent } from './project-requirements/project-requirements.component';
import { TestPlansComponent } from './test-plans/test-plans.component';
import { TestCasesComponent } from './test-cases/test-cases.component';
import { TechnologiesComponent } from './technologies/technologies.component';
import { TestingTypesComponent } from './testing-types/testing-types.component';
import { authGuard } from './guards/auth.guard'; // ✅ Changed from AuthGuard to authGuard

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientsComponent, canActivate: [authGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [authGuard] },
  { path: 'project-requirements/:projectId', component: ProjectRequirementsComponent, canActivate: [authGuard] },
  { path: 'test-plans/:projectId', component: TestPlansComponent, canActivate: [authGuard] },
  { path: 'test-cases/:requirementId', component: TestCasesComponent, canActivate: [authGuard] },
  { path: 'technologies', component: TechnologiesComponent, canActivate: [authGuard] },
  { path: 'testing-types', component: TestingTypesComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];