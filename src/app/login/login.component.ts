import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // 🔹 If user already logged in, redirect based on role
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Redirect is now handled in AuthService tap operator
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.detail || 'Login failed!';
      }
    });
  }

  private redirectBasedOnRole(): void {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
      return;
    }

    // Role determination logic based on backend flags
    if (user.is_superuser) {
      // Super User (Admin) - redirect to admin dashboard
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } else if (user.is_staff) {
      // Staff User - redirect to admin/staff dashboard
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } else {
      // Regular User (is_active=true, is_superuser=false, is_staff=false) - redirect to user dashboard
      this.router.navigate(['/user-dashboard'], { replaceUrl: true });
    }
  }
}