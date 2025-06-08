import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  isLoading = false;
  isEditing = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });
    this.userForm.disable(); // Initially disable the form
  }

  ngOnInit(): void {
    this.loadUserDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserDetails(): void {
    this.isLoading = true;
    this.error = null;

    this.userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: User) => {
          this.userForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            email: user.email
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
          this.snackBar.open('Error loading user details', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.userForm.enable();
    } else {
      this.userForm.disable();
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const userData = this.userForm.value;

      this.userService.updateUser(userData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.isEditing = false;
            this.userForm.disable();
            this.snackBar.open('Profile updated successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });
          },
          error: (error) => {
            this.isLoading = false;
            this.snackBar.open(error.message || 'Error updating profile', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });
          }
        });
    } else {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.userForm.disable();
    this.loadUserDetails(); // Reload original data
  }
}