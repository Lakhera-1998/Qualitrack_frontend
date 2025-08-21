import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';   // ✅ Import here
import { CommonModule } from '@angular/common';   // ✅ Add thiss

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,  // ✅ Make component standalone
  imports: [FormsModule, CommonModule]  // ✅ Tell Angular this component uses FormsModule
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        // ✅ Backend returns { token: access_token, user: {...} }
        localStorage.setItem('accessToken', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        this.isLoading = false;
        this.router.navigate(['/dashboard']); // redirect after login
      },
      error: (err) => {
         this.isLoading = false;
         this.errorMessage = err.error?.detail || 'Login failed!';
      }
    });
  }
}
