import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientsService } from '../clients.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: any[] = [];
  searchText: string = '';

  newClient: any = {
    client_name: '',
    client_type: 'Internal',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    company_logo: null,
    website_url: ''
  };

  selectedLogoFile: File | null = null;
  showAddClientPopup = false;
  isEditMode = false;
  editingClientId: number | null = null;
  submitted = false;
  apiErrorMessage: string = '';
  apiError: boolean = false;
  successMessage: string = '';

  constructor(
    private clientsService: ClientsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientsService.getClients().subscribe({
      next: (data: any[]) => {
        this.clients = data;
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }

  openAddClientPopup(): void {
    this.isEditMode = false;
    this.newClient = {
      client_name: '',
      client_type: 'Internal',
      contact_person_name: '',
      contact_person_email: '',
      contact_person_phone: '',
      company_logo: null,
      website_url: ''
    };
    this.selectedLogoFile = null;
    this.submitted = false;
    this.apiErrorMessage = '';
    this.apiError = false;
    this.successMessage = '';
    this.showAddClientPopup = true;
  }

  editClient(client: any): void {
    this.isEditMode = true;
    this.editingClientId = client.id;
    this.newClient = { ...client, company_logo: null };
    this.submitted = false;
    this.apiErrorMessage = '';
    this.apiError = false;
    this.successMessage = '';
    this.showAddClientPopup = true;
  }

  closeAddClientPopup(): void {
    this.showAddClientPopup = false;
    this.isEditMode = false;
    this.editingClientId = null;
    this.submitted = false;
    this.selectedLogoFile = null;
    this.apiErrorMessage = '';
    this.apiError = false;
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedLogoFile = event.target.files[0];
    }
  }

  saveClient(): void {
    this.submitted = true;
    this.apiErrorMessage = '';
    this.apiError = false;

    if (this.hasErrors()) {
      return;
    }

    const formData = new FormData();
    formData.append('client_name', this.newClient.client_name);
    formData.append('client_type', this.newClient.client_type);
    formData.append('contact_person_name', this.newClient.contact_person_name);
    formData.append('contact_person_email', this.newClient.contact_person_email);
    formData.append('contact_person_phone', this.newClient.contact_person_phone);

    if (this.selectedLogoFile) {
      formData.append('company_logo', this.selectedLogoFile);
    }
    if (this.newClient.website_url) {
      formData.append('website_url', this.newClient.website_url);
    }

    if (this.isEditMode && this.editingClientId) {
      this.clientsService.updateClient(this.editingClientId, formData).subscribe({
        next: () => {
          this.loadClients();
          this.successMessage = 'Client updated successfully!';
          this.closeAddClientPopup();
          this.clearSuccessMessageAfterTimeout();
        },
        error: (err) => {
          this.handleApiError(err);
        }
      });
    } else {
      this.clientsService.addClient(formData).subscribe({
        next: () => {
          this.loadClients();
          this.successMessage = 'Client added successfully!';
          this.closeAddClientPopup();
          this.clearSuccessMessageAfterTimeout();
        },
        error: (err) => {
          this.handleApiError(err);
        }
      });
    }
  }

  handleApiError(err: any): void {
    if (err.error) {
      if (err.error.detail) {
        this.apiErrorMessage = err.error.detail;
      } else if (err.error.message) {
        this.apiErrorMessage = err.error.message;
      } else if (typeof err.error === 'string') {
        this.apiErrorMessage = err.error;
      } else if (err.error.non_field_errors) {
        this.apiErrorMessage = err.error.non_field_errors[0];
      } else {
        const firstErrorKey = Object.keys(err.error)[0];
        if (firstErrorKey && err.error[firstErrorKey]) {
          this.apiErrorMessage = `${firstErrorKey}: ${err.error[firstErrorKey]}`;
        } else {
          this.apiErrorMessage = 'An error occurred. Please try again.';
        }
      }
    } else {
      this.apiErrorMessage = 'An error occurred. Please try again.';
    }
    this.apiError = true;
  }

  hasErrors(): boolean {
    return (
      !this.newClient.client_name ||
      !this.newClient.client_type ||
      !this.newClient.contact_person_name ||
      !this.newClient.contact_person_email ||
      !this.newClient.contact_person_phone
    );
  }

  clearSuccessMessageAfterTimeout(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  // ✅ Filter Clients for Search
  filteredClients(): any[] {
    if (!this.searchText) {
      return this.clients;
    }
    const search = this.searchText.toLowerCase();
    return this.clients.filter(client =>
      client.client_name.toLowerCase().includes(search) ||
      client.contact_person_name.toLowerCase().includes(search)
    );
  }
}
