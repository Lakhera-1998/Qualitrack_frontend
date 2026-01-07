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
  passwordValidationError: string = '';
  phoneValidationError: string = '';
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
    this.passwordValidationError = '';
    this.phoneValidationError = '';
    this.successMessage = '';
    this.showAddUserPopup = true;
  }

  editUser(user: any): void {
    this.isEditMode = true;
    this.editingUserId = user.id;
    this.newUser = { 
      username: user.username || '',
      email: user.email,
      phone: user.phone || '',
      password: '',
      confirm_password: ''
    };
    
    this.resetPasswordVisibility();
    this.submitted = false;
    this.apiErrorMessage = '';
    this.apiError = false;
    this.passwordError = false;
    this.passwordValidationError = '';
    this.phoneValidationError = '';
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
    this.passwordValidationError = '';
    this.phoneValidationError = '';
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

  // Indian mobile number validation function
  validateIndianMobileNumber(phone: string): boolean {
    this.phoneValidationError = '';
    
    if (!phone) {
      this.phoneValidationError = 'Phone number is required.';
      return false;
    }
    
    // Remove any spaces, dashes, or other characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's exactly 10 digits
    if (cleanPhone.length !== 10) {
      this.phoneValidationError = 'Phone number must be exactly 10 digits.';
      return false;
    }
    
    // Check if it starts with 6, 7, 8, or 9
    const firstDigit = cleanPhone.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      this.phoneValidationError = 'Phone number must start with 6, 7, 8, or 9.';
      return false;
    }
    
    // Check if all characters are numbers
    if (!/^\d+$/.test(cleanPhone)) {
      this.phoneValidationError = 'Phone number must contain only digits.';
      return false;
    }
    
    return true;
  }

  // Phone number input handler
  onPhoneInput(event: any): void {
    const input = event.target.value;
    // Only allow digits
    const digitsOnly = input.replace(/\D/g, '');
    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10);
    this.newUser.phone = limitedDigits;
    
    // Validate as user types
    if (limitedDigits.length > 0) {
      this.validateIndianMobileNumber(limitedDigits);
    } else {
      this.phoneValidationError = '';
    }
  }

  // Password validation function
  validatePassword(password: string): boolean {
    this.passwordValidationError = '';
    
    if (!password) {
      return true; // Allow empty in edit mode
    }
    
    // Min 8 characters
    if (password.length < 8) {
      this.passwordValidationError = 'Password must be at least 8 characters long.';
      return false;
    }
    
    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      this.passwordValidationError = 'Password must contain at least one uppercase letter (A-Z).';
      return false;
    }
    
    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
      this.passwordValidationError = 'Password must contain at least one lowercase letter (a-z).';
      return false;
    }
    
    // At least one number
    if (!/\d/.test(password)) {
      this.passwordValidationError = 'Password must contain at least one number (0-9).';
      return false;
    }
    
    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      this.passwordValidationError = 'Password must contain at least one special character (!@#$%^&* etc.).';
      return false;
    }
    
    return true;
  }

  saveUser(): void {
    this.submitted = true;
    this.apiErrorMessage = '';
    this.apiError = false;
    this.passwordError = false;
    this.passwordValidationError = '';
    this.phoneValidationError = '';

    // Validate phone number
    if (!this.validateIndianMobileNumber(this.newUser.phone)) {
      return;
    }

    // Client-side password validation
    if (this.isEditMode) {
      // For edit mode: check if passwords match if either is provided
      if (this.newUser.password || this.newUser.confirm_password) {
        if (this.newUser.password !== this.newUser.confirm_password) {
          this.passwordError = true;
          this.apiErrorMessage = 'Passwords do not match.';
          return;
        }
        // Validate password strength if provided
        if (this.newUser.password && !this.validatePassword(this.newUser.password)) {
          return;
        }
      }
    } else {
      // For add mode: both passwords are required
      if (!this.newUser.password || !this.newUser.confirm_password) {
        this.passwordError = true;
        this.apiErrorMessage = 'Both password fields are required for new users.';
        return;
      }
      if (this.newUser.password !== this.newUser.confirm_password) {
        this.passwordError = true;
        this.apiErrorMessage = 'Passwords do not match.';
        return;
      }
      // Validate password strength
      if (!this.validatePassword(this.newUser.password)) {
        return;
      }
    }

    if (this.hasErrors()) {
      return;
    }

    // Prepare data for API based on mode
    if (this.isEditMode && this.editingUserId) {
      // For edit: prepare data for UserUpdateSerializer
      const userData: any = { 
        username: this.newUser.username,
        email: this.newUser.email,
        phone: this.newUser.phone
      };
      
      // Only add password fields if password is provided and not empty
      if (this.newUser.password && this.newUser.password.trim() !== '') {
        userData.password = this.newUser.password;
        userData.confirm_password = this.newUser.confirm_password;
      }

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
      // For add: prepare data for RegisterSerializer
      const userData: any = { 
        username: this.newUser.username,
        email: this.newUser.email,
        phone: this.newUser.phone,
        password: this.newUser.password,
        confirm_password: this.newUser.confirm_password  // Required for RegisterSerializer
      };
      
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
    this.apiErrorMessage = '';
    this.apiError = true;
    
    if (err.error) {
      if (err.error.detail) {
        this.apiErrorMessage = err.error.detail;
      } else if (err.error.message) {
        this.apiErrorMessage = err.error.message;
      } else if (typeof err.error === 'string') {
        this.apiErrorMessage = err.error;
      } else if (err.error.non_field_errors) {
        this.apiErrorMessage = err.error.non_field_errors[0];
      } else if (err.error.username) {
        // Handle username-related errors specifically
        if (Array.isArray(err.error.username)) {
          this.apiErrorMessage = `Username: ${err.error.username[0]}`;
        } else {
          this.apiErrorMessage = `Username: ${err.error.username}`;
        }
      } else if (err.error.password) {
        // Handle password-related errors specifically
        if (Array.isArray(err.error.password)) {
          this.apiErrorMessage = `Password: ${err.error.password[0]}`;
        } else {
          this.apiErrorMessage = `Password: ${err.error.password}`;
        }
      } else if (err.error.confirm_password) {
        // Handle confirm_password errors
        if (Array.isArray(err.error.confirm_password)) {
          this.apiErrorMessage = `Confirm Password: ${err.error.confirm_password[0]}`;
        } else {
          this.apiErrorMessage = `Confirm Password: ${err.error.confirm_password}`;
        }
      } else if (err.error.phone) {
        // Handle phone errors
        if (Array.isArray(err.error.phone)) {
          this.apiErrorMessage = `Phone: ${err.error.phone[0]}`;
        } else {
          this.apiErrorMessage = `Phone: ${err.error.phone}`;
        }
      } else {
        // Try to get first error
        const errorKeys = Object.keys(err.error);
        if (errorKeys.length > 0) {
          const firstErrorKey = errorKeys[0];
          const errorValue = err.error[firstErrorKey];
          if (Array.isArray(errorValue)) {
            this.apiErrorMessage = `${firstErrorKey}: ${errorValue[0]}`;
          } else {
            this.apiErrorMessage = `${firstErrorKey}: ${errorValue}`;
          }
        } else {
          this.apiErrorMessage = 'An error occurred. Please try again.';
        }
      }
    } else if (err.message) {
      this.apiErrorMessage = err.message;
    } else {
      this.apiErrorMessage = 'An error occurred. Please try again.';
    }
    
    console.error('API Error:', err);
  }

  hasErrors(): boolean {
    if (this.isEditMode) {
      // For edit mode: username, email, and phone are required
      // Password fields are optional
      return !this.newUser.username || !this.newUser.email || !this.newUser.phone;
    } else {
      // For add mode: all fields are required
      return !this.newUser.username || !this.newUser.email || !this.newUser.phone || 
             !this.newUser.password || !this.newUser.confirm_password;
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