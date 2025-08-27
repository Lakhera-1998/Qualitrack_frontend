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

  newClient: any = {
    client_name: '',
    client_type: 'Internal',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    company_logo: null,   // ✅ will store File reference
    website_url: ''
  };

  selectedLogoFile: File | null = null; // ✅ hold file reference
  showAddClientPopup = false;
  isEditMode = false;
  editingClientId: number | null = null;
  submitted = false;

  constructor(
    private clientsService: ClientsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  // ✅ Fetch all clients
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

  // ✅ Open popup for new client
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
    this.showAddClientPopup = true;
  }

  // ✅ Open popup for edit client
  editClient(client: any): void {
    this.isEditMode = true;
    this.editingClientId = client.id;
    this.newClient = { ...client, company_logo: null }; // reset logo file
    this.submitted = false;
    this.showAddClientPopup = true;
  }

  // ✅ Close popup
  closeAddClientPopup(): void {
    this.showAddClientPopup = false;
    this.isEditMode = false;
    this.editingClientId = null;
    this.submitted = false;
    this.selectedLogoFile = null;
  }

  // ✅ Handle file selection
  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedLogoFile = event.target.files[0];
    }
  }

  // ✅ Save or Update client
  saveClient(): void {
    this.submitted = true;

    if (this.hasErrors()) {
      return;
    }

    // ✅ prepare FormData for API
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
      // ✅ Update client
      this.clientsService.updateClient(this.editingClientId, formData).subscribe({
        next: () => {
          this.loadClients();
          this.closeAddClientPopup();
        },
        error: (err) => {
          console.error('Error updating client:', err);
        }
      });
    } else {
      // ✅ Create client
      this.clientsService.addClient(formData).subscribe({
        next: () => {
          this.loadClients();
          this.closeAddClientPopup();
        },
        error: (err) => {
          console.error('Error adding client:', err);
        }
      });
    }
  }

  // ✅ Validate form fields
  hasErrors(): boolean {
    return (
      !this.newClient.client_name ||
      !this.newClient.client_type ||
      !this.newClient.contact_person_name ||
      !this.newClient.contact_person_email ||
      !this.newClient.contact_person_phone
    );
  }

  // ✅ Logout
  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
