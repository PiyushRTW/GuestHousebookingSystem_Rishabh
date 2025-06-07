import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService } from '../../../services/rooms/room.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, of } from 'rxjs';
import { takeUntil, finalize, filter, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-bed-configuration',
  templateUrl: './bed-configuration.component.html',
  styleUrls: ['./bed-configuration.component.scss']
})
export class BedConfigurationComponent implements OnInit, OnDestroy {
  bedForm!: FormGroup;
  beds: any[] = [];
  isLoading = false;
  roomId: number | null = null;
  roomNumber: string = '';
  bedCount: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize form early to avoid null issues
    this.initForm();
  }

  ngOnInit(): void {
    // Check authentication first
    if (!this.authService.isAuthenticated()) {
      this.handleUnauthorized();
      return;
    }

    // Check if user has admin role
    if (this.authService.userRole !== 'ADMIN') {
      this.snackBar.open('Access denied. Admin privileges required.', 'Close', { duration: 5000 });
      this.router.navigate(['/']);
      return;
    }

    // Get room information from query params
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        filter(params => !!params && !!params['roomId'] && !!params['roomNumber'])
      )
      .subscribe({
        next: params => {
          this.roomId = Number(params['roomId']);
          this.roomNumber = params['roomNumber'];
          this.loadBedsForRoom(this.roomId);
        },
        error: (error) => {
          console.error('Error loading room params:', error);
          this.snackBar.open('Error loading room information', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/rooms']);
        }
      });

    // Set up token refresh/check interval
    const tokenCheckInterval = setInterval(() => {
      if (!this.authService.isAuthenticated()) {
        clearInterval(tokenCheckInterval);
        this.handleUnauthorized();
      }
    }, 60000);

    // Clean up interval on destroy
    this.destroy$.subscribe(() => clearInterval(tokenCheckInterval));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.bedForm = this.fb.group({
      bedNumber: ['', Validators.required],
      pricePerNight: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadBedsForRoom(roomId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.handleUnauthorized();
      return;
    }

    this.isLoading = true;
    this.roomService.getBedsByRoom(roomId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          if (error.status === 401) {
            this.handleUnauthorized();
            return of([]);
          }
          if (error.status === 404) {
            // If no beds found, just return an empty array
            return of([]);
          }
          // For other errors, show error message but don't redirect
          console.error('Error loading beds:', error);
          this.snackBar.open('Error loading existing beds. You can still add new beds.', 'Close', { 
            duration: 5000 
          });
          return of([]);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(beds => {
        this.beds = beds;
        this.bedCount = beds.length;
        if (beds.length === 0) {
          this.snackBar.open('No beds configured yet. You can add new beds below.', 'Close', { 
            duration: 5000 
          });
        }
      });
  }

  onAddBed(): void {
    if (!this.authService.isAuthenticated()) {
      this.handleUnauthorized();
      return;
    }

    if (this.bedForm.valid && this.roomId) {
      this.isLoading = true;

      // Get form values
      const bedNumber = this.bedForm.get('bedNumber')?.value?.trim();
      const pricePerNight = this.bedForm.get('pricePerNight')?.value;

      // Validate required fields
      if (!bedNumber || !pricePerNight || pricePerNight <= 0) {
        this.snackBar.open('Please fill in all required fields with valid values', 'Close', { duration: 3000 });
        this.isLoading = false;
        return;
      }

      const bedData = {
        roomId: this.roomId,
        bedNumber: bedNumber,
        isAvailable: true,
        // Ensure price is a number with 2 decimal places
        pricePerNight: parseFloat(Number(pricePerNight).toFixed(2)),
        createdBy: this.authService.currentUserValue?.username || 'admin',
        lastModifiedBy: this.authService.currentUserValue?.username || 'admin'
      };

      this.roomService.createBed(bedData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            this.snackBar.open('Bed added successfully', 'Close', { duration: 3000 });
            this.loadBedsForRoom(this.roomId!);
            this.bedForm.patchValue({ bedNumber: '', pricePerNight: 0 });
            this.bedForm.markAsPristine();
            this.bedForm.markAsUntouched();
          },
          error: (error) => {
            console.error('Error adding bed:', error);
            if (error.status === 401) {
              this.handleUnauthorized();
              return;
            }
            let errorMessage = 'Error adding bed. ';
            if (error.error?.message) {
              errorMessage += error.error.message;
            } else if (error.error?.errors?.length > 0) {
              // Handle validation errors
              errorMessage += error.error.errors.map((e: any) => e.defaultMessage).join(', ');
            } else {
              errorMessage += 'Please try again.';
            }
            this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          }
        });
    } else {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
    }
  }

  deleteBed(bedId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.handleUnauthorized();
      return;
    }

    if (confirm('Are you sure you want to delete this bed?')) {
      this.isLoading = true;
      this.roomService.deleteBed(bedId)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            this.snackBar.open('Bed deleted successfully', 'Close', { duration: 3000 });
            this.loadBedsForRoom(this.roomId!);
          },
          error: (error) => {
            console.error('Error deleting bed:', error);
            if (error.status === 401) {
              this.handleUnauthorized();
              return;
            }
            let errorMessage = 'Error deleting bed. ';
            if (error.error?.message) {
              errorMessage += error.error.message;
            } else {
              errorMessage += 'Please try again.';
            }
            this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
          }
        });
    }
  }

  private handleUnauthorized(): void {
    this.snackBar.open('Your session has expired. Please log in again.', 'Close', {
      duration: 5000
    });
    // Store the current URL to redirect back after login
    this.authService.redirectUrl = this.router.url;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 