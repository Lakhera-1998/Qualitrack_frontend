import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Output() sidebarToggle = new EventEmitter<void>();
  showLogoutPopup: boolean = false; // 🔹 For controlling popup visibility

  constructor(private authService: AuthService, private router: Router) {}

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  // 🔹 Open popup instead of alert
  openLogoutPopup(): void {
    this.showLogoutPopup = true;
  }

  // 🔹 Confirm logout
  confirmLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showLogoutPopup = false;
  }

  // 🔹 Cancel logout
  cancelLogout(): void {
    this.showLogoutPopup = false;
  }
}
