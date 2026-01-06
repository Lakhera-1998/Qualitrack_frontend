import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  searchText: string = '';
  
  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  visiblePagesCount: number = 3;

  newUser: any = {
    username: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  };

  // Password visibility states
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmNewPassword: boolean = false;

  showAddUserPopup = false;
  isEditMode = false;
  editingUserId: number | null = null;
  submitted = false;
  apiErrorMessage: string = '';
  apiError: boolean = false;
  passwordError: boolean = false;
  successMessage: string = '';

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (data: any[]) => {
        this.users = data;
        this.currentPage = 1; // Reset to first page when data loads
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  // ✅ Filter Users for Search
  filteredUsers(): any[] {
    if (!this.searchText) {
      return this.users;
    }
    const search = this.searchText.toLowerCase();
    return this.users.filter(user =>
      user.email.toLowerCase().includes(search) ||
      (user.username && user.username.toLowerCase().includes(search))
    );
  }

  // ✅ Pagination methods
  paginatedUsers(): any[] {
    const filtered = this.filteredUsers();
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return filtered.slice(startIndex, endIndex);
  }

  totalPages(): number {
    return Math.ceil(this.filteredUsers().length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const pages: number[] = [];
    
    if (total <= this.visiblePagesCount) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - Math.floor(this.visiblePagesCount / 2));
      let end = start + this.visiblePagesCount - 1;
      
      if (end > total) {
        end = total;
        start = Math.max(1, end - this.visiblePagesCount + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.pageSize;
    return Math.min(end, this.filteredUsers().length);
  }

  openAddUserPopup(): void {
    this.isEditMode = false;
    this.newUser = {
      username: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: ''
    };
    this.resetPasswordVisibility();
    this.submitted = false;
    this.apiErrorMessage = '';
    this.apiError = false;
    this.passwordError = false;
    this.successMessage = '';
    this.showAddUserPopup = true;
  }

  editUser(user: any): void {
    this.isEditMode = true;
    this.editingUserId = user.id;
    this.newUser = { 
      username: user.username,
      email: user.email,
      phone: user.phone,
      password: '',
      confirm_password: ''
    };
    this.resetPasswordVisibility();
    this.submitted = false;
    this.apiErrorMessage = '';
    this.apiError = false;
    this.passwordError = false;
    this.successMessage = '';
    this.showAddUserPopup = true;
  }

  closeAddUserPopup(): void {
    this.showAddUserPopup = false;
    this.isEditMode = false;
    this.editingUserId = null;
    this.submitted = false;
    this.apiErrorMessage = '';
    this.apiError = false;
    this.passwordError = false;
    this.resetPasswordVisibility();
  }

  // Toggle password visibility
  togglePasswordVisibility(fieldType: string): void {
    switch(fieldType) {
      case 'password':
        this.showPassword = !this.showPassword;
        break;
      case 'confirm_password':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
      case 'new_password':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm_new_password':
        this.showConfirmNewPassword = !this.showConfirmNewPassword;
        break;
    }
  }

  // Reset all password visibility states
  resetPasswordVisibility(): void {
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.showNewPassword = false;
    this.showConfirmNewPassword = false;
  }

  saveUser(): void {
    this.submitted = true;
    this.apiErrorMessage = '';
    this.apiError = false;
    this.passwordError = false;

    if (this.isEditMode) {
      // For edit mode: check if passwords match if either is provided
      if (this.newUser.password || this.newUser.confirm_password) {
        if (this.newUser.password !== this.newUser.confirm_password) {
          this.passwordError = true;
          return;
        }
      }
    } else {
      // For add mode: both passwords are required
      if (this.newUser.password !== this.newUser.confirm_password) {
        this.passwordError = true;
        return;
      }
    }

    if (this.hasErrors()) {
      return;
    }

    // Prepare data for API
    const userData: any = { 
      username: this.newUser.username,
      email: this.newUser.email,
      phone: this.newUser.phone
    };
    
    // Add password only if provided (for both add and edit modes)
    if (this.newUser.password && this.newUser.password.trim() !== '') {
      userData.password = this.newUser.password;
    }

    if (this.isEditMode && this.editingUserId) {
      this.usersService.updateUser(this.editingUserId, userData).subscribe({
        next: () => {
          this.loadUsers();
          this.successMessage = 'User updated successfully!';
          this.closeAddUserPopup();
          this.clearSuccessMessageAfterTimeout();
        },
        error: (err) => {
          this.handleApiError(err);
        }
      });
    } else {
      this.usersService.addUser(userData).subscribe({
        next: () => {
          this.loadUsers();
          this.successMessage = 'User added successfully!';
          this.closeAddUserPopup();
          this.clearSuccessMessageAfterTimeout();
        },
        error: (err) => {
          this.handleApiError(err);
        }
      });
    }
  }

  handleApiError(err: any): void {
    if (err.error) {
      if (err.error.detail) {
        this.apiErrorMessage = err.error.detail;
      } else if (err.error.message) {
        this.apiErrorMessage = err.error.message;
      } else if (typeof err.error === 'string') {
        this.apiErrorMessage = err.error;
      } else if (err.error.non_field_errors) {
        this.apiErrorMessage = err.error.non_field_errors[0];
      } else {
        const firstErrorKey = Object.keys(err.error)[0];
        if (firstErrorKey && err.error[firstErrorKey]) {
          this.apiErrorMessage = `${firstErrorKey}: ${err.error[firstErrorKey]}`;
        } else {
          this.apiErrorMessage = 'An error occurred. Please try again.';
        }
      }
    } else {
      this.apiErrorMessage = 'An error occurred. Please try again.';
    }
    this.apiError = true;
  }

  hasErrors(): boolean {
    if (this.isEditMode) {
      // For edit mode: username, email, and phone are required
      // Password fields are optional
      return (
        !this.newUser.username ||
        !this.newUser.email ||
        !this.newUser.phone
      );
    } else {
      // For add mode: all fields are required
      return (
        !this.newUser.username ||
        !this.newUser.email ||
        !this.newUser.phone ||
        !this.newUser.password ||
        !this.newUser.confirm_password
      );
    }
  }

  clearSuccessMessageAfterTimeout(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}