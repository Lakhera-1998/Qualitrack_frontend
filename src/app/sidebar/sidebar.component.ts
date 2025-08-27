import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common'; // ✅ Add this
import { RouterLink } from '@angular/router'; // ✅ Add this for routerLink

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true, // ✅ Make it standalone
  imports: [CommonModule, RouterLink] // ✅ Add these imports
})
export class SidebarComponent implements OnInit {
  currentRoute: string = '';

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}