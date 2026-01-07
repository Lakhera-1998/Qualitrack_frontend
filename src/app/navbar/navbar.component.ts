import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  showLogoutPopup: boolean = false;
  username: string | null = null;
  
  // Dropdown states
  showHomeDropdown: boolean = false;
  showPagesDropdown: boolean = false;
  
  // User role properties
  isSuperAdmin: boolean = false;
  isStaff: boolean = false;
  isActiveUser: boolean = false;
  
  // Mobile menu state
  isMobileMenuOpen: boolean = false;
  isMobileView: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    // Listen for route changes to close dropdowns
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeAllDropdowns();
      this.isMobileMenuOpen = false;
    });
  }

  ngOnInit(): void {
    this.loadUserDetails();
    this.checkScreenSize();
  }

  // Check screen size for responsive behavior
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView) {
      this.isMobileMenuOpen = false;
    }
  }

  loadUserDetails(): void {
    const userData = this.authService.getCurrentUser();
    if (userData && userData.displayName) {
      this.username = userData.displayName;
    } else {
      this.username = 'User';
    }
    
    // Set user roles
    if (userData) {
      this.isSuperAdmin = userData.is_superuser === true;
      this.isStaff = userData.is_staff === true;
      this.isActiveUser = userData.is_active === true && !this.isSuperAdmin && !this.isStaff;
    }
  }

  // Show all menus (for Super Admin & Staff)
  showAllMenus(): boolean {
    return this.isSuperAdmin || this.isStaff;
  }

  // Show limited menus (for Normal Active Users)
  showLimitedMenus(): boolean {
    return this.isActiveUser;
  }

  // Get dashboard route based on role
  getDashboardRoute(): string {
    if (this.isSuperAdmin || this.isStaff) {
      return '/dashboard';
    } else if (this.isActiveUser) {
      return '/user-dashboard';
    }
    return '/dashboard';
  }

  // Dropdown toggle methods
  toggleHomeDropdown(): void {
    this.showHomeDropdown = !this.showHomeDropdown;
    if (this.showHomeDropdown) {
      this.showPagesDropdown = false;
    }
  }

  togglePagesDropdown(): void {
    this.showPagesDropdown = !this.showPagesDropdown;
    if (this.showPagesDropdown) {
      this.showHomeDropdown = false;
    }
  }

  closeAllDropdowns(): void {
    this.showHomeDropdown = false;
    this.showPagesDropdown = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.closeAllDropdowns();
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeAllDropdowns();
    this.isMobileMenuOpen = false;
  }

  openLogoutPopup(): void {
    this.showLogoutPopup = true;
    this.closeAllDropdowns();
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