import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Output() sidebarToggle = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  toggleSidebar() {
    this.sidebarToggle.emit(); // ✅ emits event to app.component
  }

  logout(): void {
    this.authService.logout();
  }
}
