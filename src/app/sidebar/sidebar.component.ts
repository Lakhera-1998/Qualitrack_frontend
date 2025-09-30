import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class SidebarComponent implements OnInit {
  currentRoute: string = '';
  isSuperAdmin: boolean = false;
  isStaff: boolean = false;
  isActiveUser: boolean = false;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.isSuperAdmin = user.is_superuser === true;
      this.isStaff = user.is_staff === true;
      // 🔹 Active user = active but not staff/superadmin
      this.isActiveUser = user.is_active === true && !this.isSuperAdmin && !this.isStaff;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showAllMenus(): boolean {
    return this.isSuperAdmin || this.isStaff;
  }

  showLimitedMenus(): boolean {
    return this.isActiveUser;
  }
}