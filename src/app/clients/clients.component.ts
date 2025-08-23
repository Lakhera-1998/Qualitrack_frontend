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
    company_logo: '',
    website_url: ''
  };

  // ✅ Popup state
  showAddClientPopup = false;
  isEditMode = false;   // 🔹 to know if we are editing
  editingClientId: number | null = null;

  constructor(
    private clientsService: ClientsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  // ✅ Fetch clients
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

  // ✅ Open Add Popup
  openAddClientPopup(): void {
    this.isEditMode = false;
    this.newClient = {
      client_name: '',
      client_type: 'Internal',
      contact_person_name: '',
      contact_person_email: '',
      contact_person_phone: '',
      company_logo: '',
      website_url: ''
    };
    this.showAddClientPopup = true;
  }

  // ✅ Open Edit Popup
  editClient(client: any): void {
    this.isEditMode = true;
    this.editingClientId = client.id;
    this.newClient = { ...client }; // preload form with existing client
    this.showAddClientPopup = true;
  }

  // ✅ Close popup
  closeAddClientPopup(): void {
    this.showAddClientPopup = false;
    this.isEditMode = false;
    this.editingClientId = null;
  }

  // ✅ Add or Update Client
  saveClient(): void {
    if (!this.newClient.client_name || !this.newClient.contact_person_email) {
      alert('Client Name and Contact Email are required');
      return;
    }

    if (this.isEditMode && this.editingClientId) {
      // 🔹 Update existing client
      this.clientsService.updateClient(this.editingClientId, this.newClient).subscribe({
        next: () => {
          this.loadClients();
          this.closeAddClientPopup();
        },
        error: (err) => {
          console.error('Error updating client:', err);
        }
      });
    } else {
      // 🔹 Add new client
      this.clientsService.addClient(this.newClient).subscribe({
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

  // // ✅ Delete client
  // deleteClient(id: number): void {
  //   if (confirm('Are you sure you want to delete this client?')) {
  //     this.clientsService.deleteClient(id).subscribe({
  //       next: () => {
  //         this.loadClients();
  //       },
  //       error: (err) => {
  //         console.error('Error deleting client:', err);
  //       }
  //     });
  //   }
  // }

  // ✅ Logout
  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
