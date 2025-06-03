import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.isLoading = true;
      const userData = {
        ...this.registrationForm.value,
        confirmPassword: undefined
      };

      this.userService.register(userData).subscribe({
        next: () => {
          this.snackBar.open('Registration successful! Please login.', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Registration error:', error);
          let errorMessage = 'Registration failed. Please try again.';
          if (error.status === 409) {
            errorMessage = 'Username or email already exists.';
          }
          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000
          });
          this.isLoading = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/login']);
  }
}
