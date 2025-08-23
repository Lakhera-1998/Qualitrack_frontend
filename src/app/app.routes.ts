import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ClientsComponent } from './clients/clients.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'clients', component: ClientsComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
