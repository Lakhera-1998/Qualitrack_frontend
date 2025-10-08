import { Component, Output, EventEmitter, OnInit } from '@angular/core';
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
export class NavbarComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();
  showLogoutPopup: boolean = false;
  username: string | null = null; // 🔹 For showing logged-in user's name

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }

  // 🔹 Load username from AuthService
  loadUserDetails(): void {
    const userData = this.authService.getCurrentUser();
    if (userData && userData.displayName) {
      this.username = userData.displayName;
    } else {
      this.username = 'User';
    }
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  openLogoutPopup(): void {
    this.showLogoutPopup = true;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.showLogoutPopup = false;
  }

  cancelLogout(): void {
    this.showLogoutPopup = false;
  }
}
