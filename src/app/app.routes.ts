import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ClientsComponent } from './clients/clients.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectRequirementsComponent } from './project-requirements/project-requirements.component';
import { TestPlansComponent } from './test-plans/test-plans.component';
import { TestCasesComponent } from './test-cases/test-cases.component';
import { TestCaseDetailsComponent } from './test-case-details/test-case-details.component';
import { TechnologiesComponent } from './technologies/technologies.component';
import { TestingTypesComponent } from './testing-types/testing-types.component';
import { ReportComponent } from './report/report.component';
import { authGuard } from './guards/auth.guard'; // ✅ Changed from AuthGuard to authGuard
import { loginGuard } from './guards/login.guard';
import { UsersComponent } from './users/users.component'; // ✅ Add this import

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientsComponent, canActivate: [authGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [authGuard] },

  // ✅ Added base routes
  { path: 'requirements', component: ProjectRequirementsComponent, canActivate: [authGuard] },
  { path: 'test-plans', component: TestPlansComponent, canActivate: [authGuard] },
  { path: 'test-cases', component: TestCasesComponent, canActivate: [authGuard] },
  { path: 'test-case-details/:id', component: TestCaseDetailsComponent },
  
  // ✅ Keep param-based routes if you still need deep linking
  { path: 'project-requirements/:projectId', component: ProjectRequirementsComponent, canActivate: [authGuard] },
  { path: 'test-plans/:projectId', component: TestPlansComponent, canActivate: [authGuard] },
  { path: 'test-cases/:requirementId', component: TestCasesComponent, canActivate: [authGuard] },

  { path: 'technologies', component: TechnologiesComponent, canActivate: [authGuard] },
  { path: 'testing-types', component: TestingTypesComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];