import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  hidePassword = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole(this.authService.userRole);
    }
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.showMessage('Please enter both email and password');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showMessage('Please enter a valid email address');
      return;
    }

    this.isLoading = true;
    console.log('Attempting login with email:', this.email);
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        console.log('Login response user:', user);
        this.isLoading = false;
        
        if (user && user.role) {
          // Check for redirect URL first
          const redirectUrl = this.authService.redirectUrl;
          if (redirectUrl) {
            this.authService.redirectUrl = null;
            this.router.navigateByUrl(redirectUrl);
          } else {
            this.redirectBasedOnRole(user.role);
          }
        } else {
          this.showMessage('Login failed: Invalid user data received');
          console.error('Invalid user data:', user);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error details:', error);
        
        if (error.status === 401) {
          this.showMessage('Invalid email or password');
        } else if (error.status === 403) {
          this.showMessage('Access forbidden. Please check your credentials.');
        } else {
          this.showMessage(error.error?.message || 'An error occurred during login. Please try again.');
        }
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  private redirectBasedOnRole(role: string | null) {
    console.log('Redirecting based on role:', role);
    switch (role?.toUpperCase()) {
      case 'ROLE_ADMIN':
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'ROLE_USER':
      case 'USER':
        this.router.navigate(['/user/hotels']);
        break;
      default:
        console.warn('Unknown role:', role);
        this.router.navigate(['/']);
    }
  }

  private showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}