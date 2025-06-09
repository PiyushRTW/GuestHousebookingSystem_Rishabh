import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ForgetPasswordService } from '../../services/forget-password/forget-password.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
  emailForm: FormGroup;
  resetForm: FormGroup;
  loading = false;
  isResetMode = false;
  resetToken: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private forgetPasswordService: ForgetPasswordService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'];
      if (this.resetToken) {
        this.isResetMode = true;
        this.validateResetToken();
      }
    });
  }

  private validateResetToken() {
    if (!this.resetToken) return;
    
    this.loading = true;
    this.forgetPasswordService.validateResetToken(this.resetToken).subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Invalid or expired reset token. Please request a new password reset.', 'Close', {
          duration: 5000
        });
        this.router.navigate(['/forget-password']);
      }
    });
  }

  onSubmitEmail() {
    if (this.emailForm.valid) {
      this.loading = true;
      this.forgetPasswordService.requestPasswordReset(this.emailForm.value.email).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Password reset instructions have been sent to your email.', 'Close', {
            duration: 5000
          });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.message || 'Failed to process request. Please try again.', 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  onSubmitReset() {
    if (this.resetForm.valid && this.resetToken) {
      if (this.resetForm.value.password !== this.resetForm.value.confirmPassword) {
        this.snackBar.open('Passwords do not match.', 'Close', { duration: 3000 });
        return;
      }

      this.loading = true;
      this.forgetPasswordService.resetPassword(this.resetToken, this.resetForm.value.password).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Password has been successfully reset. Please login with your new password.', 'Close', {
            duration: 5000
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error.error?.message || 'Failed to reset password. Please try again.', 'Close', {
            duration: 5000
          });
        }
      });
    }
  }

  private passwordMatchValidator(control: AbstractControl): {[key: string]: boolean} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
  }

  getErrorMessage(controlName: string): string {
    const control = this.resetForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control.hasError('minlength')) {
      return `Password must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (controlName === 'confirmPassword' && this.resetForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}
